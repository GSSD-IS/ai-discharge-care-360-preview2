
// --- Types (from types.ts) ---
export interface ApiResponse<T = null> {
    success: boolean;
    code: string;
    message: string;
    data: T;
    traceId?: string;
}

export enum CaseState {
    S0 = 'S0',
    S1 = 'S1',
    S2 = 'S2',
    S3 = 'S3',
    S4 = 'S4',
    S5 = 'S5',
    E1 = 'E1',
    T1 = 'T1',
}

export enum ActionType {
    FLAG = 'FLAG',
    ORDERS = 'ORDERS',
    PAC_START = 'PAC_START',
    PAC_FINISH = 'PAC_FINISH',
    REFERRAL = 'REFERRAL',
    CLOSE = 'CLOSE',
    SUSPEND = 'SUSPEND',
    RESUME = 'RESUME',
    TERMINATE = 'TERMINATE'
}

export enum FlagSource {
    AI = 'AI',
    MANUAL = 'MANUAL'
}

export enum PacStatus {
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected'
}

export enum TerminationType {
    DECEASED = 'DECEASED',
    AAD = 'AAD',
    TRANSFER = 'TRANSFER'
}

export interface TodoItem {
    id: string;
    text: string;
    isCompleted: boolean;
    date?: string;
}

export interface WorkflowHistoryItem {
    timestamp: string;
    action: ActionType;
    actor: { id: string; name: string; };
    snapshot: any;
}

export interface CaseSummaryData {
    patient: { id: string; name: string; bed: string; mrn: string; };
    currentState: CaseState;
    placement: any | null;
    assessment: any | null;
    todos: TodoItem[];
    workflowHistory: WorkflowHistoryItem[];
}

export type UpdateTodosPayload = TodoItem[];

export interface FlagPayload {
    source: FlagSource;
    riskScore: number;
    reason: string;
}

export interface OrdersPayload {
    hisOrderId: string;
    orderContent: string;
    physicianId: string;
}

export interface PacStartPayload {
    consultDept: string;
    urgency: 'Routine' | 'High';
    reason: string;
}

export interface PacFinishPayload {
    status: PacStatus;
    recommendation: string;
    pacHospital: string | null;
}

export interface ReferralPayload {
    matchedResources?: string[];
    aiPlan?: any;
}

export interface ClosePayload {
    actualDischargeDate: string;
    finalDestination: string;
}

export interface SuspendPayload {
    reason: string;
    vitals?: any;
}

export interface ResumePayload {
    note: string;
}

export interface TerminatePayload {
    type: TerminationType;
    reason: string;
    occurredAt: string;
    transferDetails: any | null;
}

// --- Mock Service (from mockServices.ts) ---
class ApiError extends Error {
    code: string;
    statusCode: number;

    constructor(code: string, message: string, statusCode: number = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
    }
}

const ALLOWED_TRANSITIONS: Record<CaseState, ActionType[]> = {
    [CaseState.S0]: [ActionType.FLAG, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.S1]: [ActionType.ORDERS, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.S2]: [ActionType.PAC_START, ActionType.REFERRAL, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.S3]: [ActionType.CLOSE, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.S4]: [],
    [CaseState.S5]: [ActionType.PAC_FINISH, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.E1]: [ActionType.RESUME, ActionType.TERMINATE],
    [CaseState.T1]: []
};

interface MockState {
    patient: { id: string; name: string; bed: string; mrn: string };
    currentState: CaseState;
    previousState?: CaseState;
    placement: any | null;
    assessment: any | null;
    todos: TodoItem[];
    history: WorkflowHistoryItem[];
}

let MOCK_DB: Record<string, MockState> = {
    'p1': {
        patient: { id: 'p1', name: '王小明', bed: '01A-01', mrn: '881023' },
        currentState: CaseState.S0,
        placement: null,
        assessment: null,
        todos: [],
        history: []
    }
};

class DischargeMockService {
    private latency = 10;

    private async delay() {
        return new Promise(resolve => setTimeout(resolve, this.latency));
    }

    private getContext(patientId: string): MockState {
        const ctx = MOCK_DB[patientId];
        if (!ctx) throw new ApiError('ERR_NOT_FOUND', 'Patient not found', 404);
        return ctx;
    }

    private saveContext(patientId: string, newState: MockState) {
        MOCK_DB[patientId] = newState;
    }

    private checkLock(ctx: MockState) {
        if (ctx.currentState === CaseState.S3) {
            throw new ApiError('ERR_STATE_LOCKED', 'Case is locked in S3', 409);
        }
    }

    private recordHistory(ctx: MockState, action: ActionType, actorName: string, snapshot: any) {
        ctx.history.push({
            timestamp: new Date().toISOString(),
            action,
            actor: { id: 'mock-user', name: actorName },
            snapshot: JSON.parse(JSON.stringify(snapshot))
        });
    }

    async getSummary(patientId: string): Promise<ApiResponse<CaseSummaryData>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        return {
            success: true,
            code: '20000',
            message: 'OK',
            data: {
                patient: ctx.patient,
                currentState: ctx.currentState,
                placement: ctx.placement,
                assessment: ctx.assessment,
                todos: ctx.todos,
                workflowHistory: ctx.history
            }
        };
    }

    async syncTodos(patientId: string, items: UpdateTodosPayload): Promise<ApiResponse<TodoItem[]>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.checkLock(ctx);

        const ids = items.map(i => i.id).filter(id => !!id);
        if (new Set(ids).size !== ids.length) {
            throw new ApiError('ERR_ID_DUPLICATE', 'Duplicate IDs in payload', 400);
        }

        const newTodos = items.map(item => ({
            ...item,
            id: item.id || Math.random().toString(36).substring(7)
        }));

        ctx.todos = newTodos;
        this.saveContext(patientId, ctx);

        return { success: true, code: '20000', message: 'Todos synced', data: newTodos };
    }

    async updatePlacement(patientId: string, data: any): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.checkLock(ctx);

        if (data.type === 'Home' && !data.homeCare) {
            throw new ApiError('ERR_VALIDATION_FAIL', 'Home placement requires homeCare details', 400);
        }

        ctx.placement = data;
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Placement updated', data: null };
    }

    async updateAssessment(patientId: string, data: any): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.checkLock(ctx);
        ctx.assessment = data;
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Assessment updated', data: null };
    }

    private validateTransition(ctx: MockState, action: ActionType) {
        const allowed = ALLOWED_TRANSITIONS[ctx.currentState];
        if (!allowed || !allowed.includes(action)) {
            throw new ApiError('ERR_TRANSITION_INVALID', `Cannot perform ${action} from ${ctx.currentState}`, 409);
        }
    }

    async flag(patientId: string, payload: FlagPayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.FLAG);
        ctx.currentState = CaseState.S1;
        this.recordHistory(ctx, ActionType.FLAG, payload.source === 'AI' ? 'AI System' : 'User', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Flagged', data: null };
    }

    async orders(patientId: string, payload: OrdersPayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.ORDERS);
        if (!payload.physicianId) throw new ApiError('ERR_VALIDATION_FAIL', 'physicianId required', 400);
        ctx.currentState = CaseState.S2;
        this.recordHistory(ctx, ActionType.ORDERS, 'Dr. Mock', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Orders received', data: null };
    }

    async startPac(patientId: string, payload: PacStartPayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.PAC_START);
        ctx.currentState = CaseState.S5;
        this.recordHistory(ctx, ActionType.PAC_START, 'User', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'PAC Started', data: null };
    }

    async finishPac(patientId: string, payload: PacFinishPayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.PAC_FINISH);
        if (payload.status === PacStatus.ACCEPTED && !payload.pacHospital) throw new ApiError('ERR_VALIDATION_FAIL', 'pacHospital required', 400);
        if (payload.status === PacStatus.REJECTED && payload.pacHospital) throw new ApiError('ERR_VALIDATION_FAIL', 'pacHospital must be null', 400);

        if (payload.status === PacStatus.ACCEPTED && ctx.placement) {
            ctx.placement.type = 'Transfer';
            ctx.placement.transfer = { type: 'PAC', name: payload.pacHospital! };
        }
        ctx.currentState = CaseState.S2;
        this.recordHistory(ctx, ActionType.PAC_FINISH, 'PAC Manager', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'PAC Finished', data: null };
    }

    async referral(patientId: string, payload: ReferralPayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        if (ctx.currentState === CaseState.S1) throw new ApiError('ERR_TRANSITION_INVALID', 'Cannot refer from S1', 409);
        if (ctx.currentState === CaseState.S5) throw new ApiError('ERR_PAC_UNFINISHED', 'Must finish PAC first', 409);
        this.validateTransition(ctx, ActionType.REFERRAL);
        if (!ctx.placement || !ctx.assessment) throw new ApiError('ERR_VALIDATION_FAIL', 'Placement and Assessment required', 400);
        ctx.currentState = CaseState.S3;
        this.recordHistory(ctx, ActionType.REFERRAL, 'Case Manager', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Referral Sent', data: null };
    }

    async close(patientId: string, payload: ClosePayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.CLOSE);
        ctx.currentState = CaseState.S4;
        this.recordHistory(ctx, ActionType.CLOSE, 'Admin', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Case Closed', data: null };
    }
}

const mockApi = new DischargeMockService();

// --- Test Runner ---
async function runTests() {
    console.log('--- Starting Mock API Bundled Tests ---');
    try {
        const pId = 'p1';
        let summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S0, 'Initial state S0');
        console.log('✅ Initial State S0');

        await mockApi.flag(pId, { source: FlagSource.AI, riskScore: 88, reason: 'Test Risk' });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S1, 'S1 after Flag');
        console.log('✅ S0 -> S1 Flag');

        try {
            await mockApi.referral(pId, { matchedResources: [] });
            console.error('❌ Failed to block S1 -> Referral');
        } catch (e: any) {
            console.assert(e.code === 'ERR_TRANSITION_INVALID', 'Block S1 -> Referral');
            console.log('✅ Block S1 -> Referral');
        }

        await mockApi.orders(pId, { hisOrderId: 'H1', orderContent: 'Test', physicianId: 'DOC1' });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S2, 'S2 after Orders');
        console.log('✅ S1 -> S2 Orders');

        await mockApi.updatePlacement(pId, { type: 'Home', expectedDischargeDate: '2023-12-31', homeCare: { caregiver: 'Family' } });
        await mockApi.updateAssessment(pId, { cmsScore: 100, barthelIndex: { totalScore: 100, items: [] } });

        await mockApi.startPac(pId, { consultDept: 'Neuro', urgency: 'High', reason: 'PAC' });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S5, 'S5 after PAC Start');
        console.log('✅ S2 -> S5 PAC Start');

        try {
            await mockApi.referral(pId, {});
            console.error('❌ Failed to block S5 -> Referral');
        } catch (e: any) {
            console.assert(e.code === 'ERR_PAC_UNFINISHED', 'Block S5 -> Referral');
            console.log('✅ Block S5 -> Referral');
        }

        await mockApi.finishPac(pId, { status: PacStatus.ACCEPTED, recommendation: 'Go', pacHospital: 'General Hospital' });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S2, 'Return to S2');
        console.assert(summary.data.placement.type === 'Transfer', 'Auto Placement Update');
        console.log('✅ PAC Finish & Automation');

        await mockApi.referral(pId, { matchedResources: ['r1'] });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S3, 'S3 after Referral');
        console.log('✅ S2 -> S3 Referral');

        try {
            await mockApi.updatePlacement(pId, { type: 'Home' });
            console.error('❌ Failed to block Update in S3');
        } catch (e: any) {
            console.assert(e.code === 'ERR_STATE_LOCKED', 'Block S3 Update');
            console.log('✅ S3 Locking');
        }

        await mockApi.close(pId, { actualDischargeDate: '2023-12-31', finalDestination: 'Home' });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S4, 'S4 after Close');
        console.log('✅ S3 -> S4 Close');

        console.log('🎉 All Bundled Tests Passed!');

    } catch (e) {
        console.error('Test Failed:', e);
    }
}

runTests();
