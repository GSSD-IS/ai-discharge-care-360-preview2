/**
 * 登入請求 DTO
 */
export class LoginDto {
    email: string;
    password: string;
}

/**
 * 登入回應結構
 */
export class AuthResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        fullName: string;
    };
}
