export const UserRole = {
    SuperAdmin: 'SuperAdmin',
    TenantAdmin: 'TenantAdmin',
    Nurse: 'Nurse',
    Doctor: 'Doctor',
    SocialWorker: 'SocialWorker'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    logoUrl?: string; // URL to logo image
    themeColor: string; // Primary color hex code
    status: 'Active' | 'Trial' | 'Suspended';
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string; // 'platform' for SuperAdmin
    avatarUrl?: string;
}
