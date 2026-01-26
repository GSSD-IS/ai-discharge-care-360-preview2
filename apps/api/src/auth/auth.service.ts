import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, AuthResponse } from './dto/auth.dto';

// JWT Payload 結構
export interface JwtPayload {
    sub: string; // userId
    email: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * 使用者登入
     * @param dto - 電子郵件與密碼
     * @returns JWT Token 與使用者基本資訊
     */
    async login(dto: LoginDto): Promise<AuthResponse> {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('帳號或密碼錯誤');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('帳號或密碼錯誤');
        }

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
        };
    }

    /**
     * 驗證 JWT Payload 並取得使用者
     * @param payload - JWT 解碼後的 Payload
     * @returns 使用者實體 (不含密碼)
     */
    async validateUser(payload: JwtPayload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                fullName: true,
                memberships: {
                    include: {
                        tenant: true,
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('使用者不存在');
        }

        return user;
    }

    /**
     * 雜湊密碼 (用於註冊或重設密碼)
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }
}
