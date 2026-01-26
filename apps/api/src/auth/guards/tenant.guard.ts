import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 租戶守衛 (Tenant Guard)
 * 
 * 功能：
 * 1. 從 Request Header 讀取 `X-Tenant-ID`
 * 2. 驗證當前登入用戶是否為該租戶的成員
 * 3. 將租戶成員資訊附加到 request.tenantMember
 * 
 * 使用方式：@UseGuards(JwtAuthGuard, TenantGuard)
 */
@Injectable()
export class TenantGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('未授權的請求');
        }

        // 從 Header 取得租戶 ID
        const tenantId = request.headers['x-tenant-id'];
        if (!tenantId) {
            throw new BadRequestException('缺少 X-Tenant-ID 標頭');
        }

        // 驗證用戶是否屬於該租戶
        const membership = await this.prisma.tenantMember.findUnique({
            where: {
                userId_tenantId: {
                    userId: user.id,
                    tenantId: tenantId,
                },
            },
            include: {
                tenant: true,
            },
        });

        if (!membership) {
            throw new ForbiddenException('您不屬於此醫院/機構');
        }

        if (!membership.isActive) {
            throw new ForbiddenException('您在此機構的帳號已被停用');
        }

        // 將成員資訊附加到 request，供後續使用
        request.tenantMember = membership;
        request.tenant = membership.tenant;

        return true;
    }
}
