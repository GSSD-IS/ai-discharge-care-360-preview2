// SaaS Admin Mock Service
// Self-contained type definitions (no import conflicts)

// --- Types & Enums (as const for erasableSyntaxOnly compatibility) ---

export const TenantStatus = {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    ARCHIVED: 'ARCHIVED'
} as const;
export type TenantStatus = typeof TenantStatus[keyof typeof TenantStatus];

export const SubscriptionPlan = {
    STANDARD: 'STANDARD',
    PREMIUM: 'PREMIUM'
} as const;
export type SubscriptionPlan = typeof SubscriptionPlan[keyof typeof SubscriptionPlan];

export const AdminRole = {
    SUPER_ADMIN: 'ROLE_SUPER_ADMIN',
    TENANT_ADMIN: 'ROLE_TENANT_ADMIN',
    USER: 'ROLE_USER',
    ANONYMOUS: 'ANONYMOUS'
} as const;
export type AdminRole = typeof AdminRole[keyof typeof AdminRole];


export interface FeatureFlags {
    ENABLE_AI_ANALYSIS: boolean;
    ENABLE_PAC_INTEGRATION: boolean;
    MAX_USERS: number;
}

export interface TenantConfig {
    id: string;        // UUID
    name: string;
    status: TenantStatus;
    plan: SubscriptionPlan;
    createdAt: string; // ISO8601
    // adminEmail removed from response schema
    features: FeatureFlags;
    apiUsage: {
        current: number;
        limit: number;
    };
}

export type AuditAction = 'CREATE_TENANT' | 'SUSPEND_TENANT' | 'UPDATE_FEATURE' | 'UPDATE_PLAN';

export interface AuditLog {
    id: string; // UUID
    timestamp: string; // ISO8601
    actorId: string;
    targetTenantId: string;
    action: AuditAction;
    changes: { prev: any; next: any };
    ipAddress: string;
}

export interface TenantsResponse {
    data: TenantConfig[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

// --- Errors ---
class ApiError extends Error {
    constructor(public code: string, message: string, public statusCode: number = 400) {
        super(message);
    }
}

// --- Helpers ---
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const ISOLATION_BLACKLIST = [
    'mrn', 'diagnosis', 'medications', 'admissionDate',
    'dischargeDate', 'caregiverName', 'cmsScore', 'barthelIndex'
];

const stripBlacklist = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(stripBlacklist);

    const newObj: any = {};
    for (const key in obj) {
        if (ISOLATION_BLACKLIST.includes(key)) continue;
        newObj[key] = stripBlacklist(obj[key]);
    }
    return newObj;
};

// --- Mock Database ---
let MOCK_TENANTS: TenantConfig[] = [];
let MOCK_AUDIT_LOGS: AuditLog[] = [];

const seedData = () => {
    if (MOCK_TENANTS.length === 0) {
        const baseTime = Date.now();
        for (let i = 1; i <= 10; i++) {
            const createdAt = new Date(baseTime - (10 - i) * 1000).toISOString();
            MOCK_TENANTS.push({
                id: generateUUID(),
                name: `Tenant ${i}`,
                status: TenantStatus.ACTIVE,
                plan: SubscriptionPlan.STANDARD,
                createdAt: createdAt,
                features: {
                    ENABLE_AI_ANALYSIS: false,
                    ENABLE_PAC_INTEGRATION: false,
                    MAX_USERS: 10
                },
                apiUsage: { current: 0, limit: 1000 }
            });
        }
    }
};

seedData();

// --- Service ---
export class SaaSAdminService {
    private currentUserRole: string = AdminRole.ANONYMOUS;
    private currentUserId: string = 'admin-user-id';

    setRole(role: string) {
        this.currentUserRole = role;
    }

    private checkRBAC() {
        if (this.currentUserRole !== AdminRole.SUPER_ADMIN) {
            throw new ApiError('ERR_FORBIDDEN', 'Access Denied', 403);
        }
    }

    private logAudit(targetId: string, action: AuditAction, prev: any, next: any) {
        const log: AuditLog = {
            id: generateUUID(),
            timestamp: new Date().toISOString(),
            actorId: this.currentUserId,
            targetTenantId: targetId,
            action,
            changes: { prev, next },
            ipAddress: '127.0.0.1'
        };
        MOCK_AUDIT_LOGS.unshift(log);
    }

    // GET /v1/admin/tenants
    async getTenants(params: { page?: number; limit?: number; status?: string; plan?: string }): Promise<TenantsResponse> {
        this.checkRBAC();

        let page = params.page ?? 1;
        let limit = params.limit ?? 20;

        if (typeof page !== 'number' || page < 1) throw new ApiError('ERR_INVALID_PARAM', 'Invalid page', 400);
        if (typeof limit !== 'number' || limit <= 0) throw new ApiError('ERR_INVALID_PARAM', 'Invalid limit', 400);

        let filtered = [...MOCK_TENANTS];

        if (params.status) filtered = filtered.filter(t => t.status === params.status);
        if (params.plan) filtered = filtered.filter(t => t.plan === params.plan);

        // Sorting: createdAt DESC
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = filtered.length;
        const start = (page - 1) * limit;
        const paged = filtered.slice(start, start + limit).map(t => stripBlacklist(t));

        return {
            data: paged,
            meta: { total, page, limit }
        };
    }

    // POST /v1/admin/tenants
    async createTenant(payload: { name: string; adminEmail: string; plan: SubscriptionPlan; domain?: string }): Promise<TenantConfig> {
        this.checkRBAC();

        if (!payload.name || !payload.adminEmail || !payload.plan) throw new ApiError('ERR_VALIDATION', 'Missing required fields', 400);
        if (!Object.values(SubscriptionPlan).includes(payload.plan)) throw new ApiError('ERR_VALIDATION', 'Invalid Plan', 400);

        const newTenant: TenantConfig = {
            id: generateUUID(),
            name: payload.name,
            plan: payload.plan,
            status: TenantStatus.ACTIVE,
            createdAt: new Date().toISOString(),
            features: {
                ENABLE_AI_ANALYSIS: payload.plan === SubscriptionPlan.PREMIUM,
                ENABLE_PAC_INTEGRATION: false,
                MAX_USERS: 5
            },
            apiUsage: { current: 0, limit: 1000 }
        };

        MOCK_TENANTS.unshift(newTenant);
        this.logAudit(newTenant.id, 'CREATE_TENANT', null, stripBlacklist(newTenant));

        return stripBlacklist(newTenant);
    }

    // PUT /v1/admin/tenants/{id}/plan
    async updatePlan(id: string, payload: { plan: SubscriptionPlan }): Promise<TenantConfig> {
        this.checkRBAC();

        const tenant = MOCK_TENANTS.find(t => t.id === id);
        if (!tenant) throw new ApiError('ERR_NOT_FOUND', 'Tenant not found', 404);

        if (!payload || !payload.plan) throw new ApiError('ERR_VALIDATION', 'Missing plan', 400);
        if (!Object.values(SubscriptionPlan).includes(payload.plan)) throw new ApiError('ERR_VALIDATION', 'Invalid Plan', 400);

        const prev = { plan: tenant.plan };
        tenant.plan = payload.plan;
        this.logAudit(id, 'UPDATE_PLAN', prev, { plan: payload.plan });

        return stripBlacklist(tenant);
    }

    // PUT /v1/admin/tenants/{id}/suspend
    async suspendTenant(id: string, payload: { reason: string }): Promise<TenantConfig> {
        this.checkRBAC();

        const tenant = MOCK_TENANTS.find(t => t.id === id);
        if (!tenant) throw new ApiError('ERR_NOT_FOUND', 'Tenant not found', 404);

        if (!payload || !payload.reason) throw new ApiError('ERR_VALIDATION', 'Missing reason', 400);

        const prev = { status: tenant.status };
        tenant.status = TenantStatus.SUSPENDED;
        this.logAudit(id, 'SUSPEND_TENANT', prev, { status: TenantStatus.SUSPENDED, reason: payload.reason });

        return stripBlacklist(tenant);
    }

    // PUT /v1/admin/tenants/{id}/features
    async updateFeatures(id: string, payload: FeatureFlags): Promise<TenantConfig> {
        this.checkRBAC();

        const tenant = MOCK_TENANTS.find(t => t.id === id);
        if (!tenant) throw new ApiError('ERR_NOT_FOUND', 'Tenant not found', 404);

        const validKeys = ['ENABLE_AI_ANALYSIS', 'ENABLE_PAC_INTEGRATION', 'MAX_USERS'];
        const hasInvalidKey = Object.keys(payload).some(k => !validKeys.includes(k));

        if (hasInvalidKey) throw new ApiError('ERR_VALIDATION', 'Invalid feature key', 400);
        if (typeof payload.ENABLE_AI_ANALYSIS !== 'boolean') throw new ApiError('ERR_VALIDATION', 'Invalid boolean AI', 400);
        if (typeof payload.ENABLE_PAC_INTEGRATION !== 'boolean') throw new ApiError('ERR_VALIDATION', 'Invalid boolean PAC', 400);
        if (typeof payload.MAX_USERS !== 'number' || payload.MAX_USERS <= 0) throw new ApiError('ERR_VALIDATION', 'Invalid MAX_USERS', 400);

        const prev = { ...tenant.features };
        tenant.features = payload;
        this.logAudit(id, 'UPDATE_FEATURE', prev, payload);

        return stripBlacklist(tenant);
    }

    // GET /v1/admin/audit-logs
    async getAuditLogs(params: { targetTenantId?: string; actorId?: string; dateRange?: string }): Promise<AuditLog[]> {
        this.checkRBAC();

        if (params.dateRange && isNaN(Date.parse(params.dateRange))) {
            throw new ApiError('ERR_VALIDATION', 'Invalid date format', 400);
        }

        let filtered = [...MOCK_AUDIT_LOGS];

        if (params.targetTenantId) filtered = filtered.filter(l => l.targetTenantId === params.targetTenantId);
        if (params.actorId) filtered = filtered.filter(l => l.actorId === params.actorId);

        return filtered.map(log => stripBlacklist(log));
    }
}

export const saasAdminService = new SaaSAdminService();
