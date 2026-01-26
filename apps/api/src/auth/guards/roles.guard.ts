import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * 角色守衛 (Roles Guard)
 * 
 * 功能：
 * 1. 檢查用戶在當前租戶的角色是否符合路由要求
 * 2. 需搭配 @Roles() 裝飾器使用
 * 
 * 使用方式：
 * @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
 * @Roles(UserRole.PHYSICIAN, UserRole.NURSE)
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // 若無指定角色限制，則允許通過
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const tenantMember = request.tenantMember;

        if (!tenantMember) {
            throw new ForbiddenException('缺少租戶成員資訊');
        }

        // 檢查用戶角色是否在允許清單中
        const hasRole = requiredRoles.includes(tenantMember.role);
        if (!hasRole) {
            throw new ForbiddenException('您沒有權限執行此操作');
        }

        return true;
    }
}
