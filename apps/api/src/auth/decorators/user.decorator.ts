import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 當前用戶裝飾器
 * 從 request 中取得已驗證的用戶資訊
 * 
 * 使用範例：
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) { ... }
 */
export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);

/**
 * 當前租戶成員裝飾器
 * 從 request 中取得當前租戶成員資訊 (包含角色)
 * 
 * 使用範例：
 * @Get('my-role')
 * getMyRole(@CurrentTenantMember() member: TenantMember) { ... }
 */
export const CurrentTenantMember = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.tenantMember;
    },
);

/**
 * 當前租戶裝飾器
 * 從 request 中取得當前操作的租戶資訊
 * 
 * 使用範例：
 * @Get('hospital-info')
 * getHospitalInfo(@CurrentTenant() tenant: Tenant) { ... }
 */
export const CurrentTenant = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.tenant;
    },
);
