import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * 角色裝飾器
 * 用於指定路由所需的角色
 * 
 * 使用範例：
 * @Roles(UserRole.PHYSICIAN, UserRole.NURSE)
 * @Get('patients')
 * getPatients() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
