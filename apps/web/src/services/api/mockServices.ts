import {
    ApiResponse,
    CaseState,
    ActionType,
    FlagPayload,
    OrdersPayload,
    PacStartPayload,
    PacFinishPayload,
    PacStatus,
    ReferralPayload,
    SuspendPayload,
    ResumePayload,
    TerminatePayload,
    ClosePayload,
    UpdateTodosPayload,
    CaseSummaryData,
    TodoItem,
    WorkflowHistoryItem,
    TerminationType
} from './types';
import { DischargePlacement, BarthelIndex } from '../../types/template';

// --- Error Classes ---
class ApiError extends Error {
    code: string;
    statusCode: number;

    constructor(code: string, message: string, statusCode: number = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
    }
}

// --- Verification & Logic Helpers ---
const ALLOWED_TRANSITIONS: Record<CaseState, ActionType[]> = {
    [CaseState.S0]: [ActionType.FLAG, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.S1]: [ActionType.ORDERS, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.S2]: [ActionType.PAC_START, ActionType.REFERRAL, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.S3]: [ActionType.CLOSE, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.S4]: [], // Terminal
    [CaseState.S5]: [ActionType.PAC_FINISH, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.E1]: [ActionType.RESUME, ActionType.TERMINATE],
    [CaseState.T1]: [] // Terminal
};

// --- In-Memory State Store (Mock DB) ---
interface MockState {
    patient: { id: string; name: string; bed: string; mrn: string };
    currentState: CaseState;
    previousState?: CaseState; // For Resume
    placement: DischargePlacement | null;
    assessment: { cmsScore: number; barthelIndex: BarthelIndex } | null;
    todos: TodoItem[];
    history: WorkflowHistoryItem[];
}

// Initial Mock Data
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

// --- Mock Service Class ---
export class DischargeMockService {
    private latency = 500; // Simulate network delay

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
            snapshot: JSON.parse(JSON.stringify(snapshot)) // Deep copy
        });
    }

    // --- Public API Methods ---

    // GET /summary
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

    // PUT /todos
    async syncTodos(patientId: string, items: UpdateTodosPayload): Promise<ApiResponse<TodoItem[]>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        // S3 is Locked for Todos as well per requirements? Spec says "Active S3 Locked"
        // Wait, spec requirement clarifies: "Locked Write Protection... incl PUT todos" -> YES.
        this.checkLock(ctx);

        // Validation: Unique IDs
        const ids = items.map(i => i.id).filter(id => !!id);
        if (new Set(ids).size !== ids.length) {
            throw new ApiError('ERR_ID_DUPLICATE', 'Duplicate IDs in payload', 400);
        }

        // Logic: Replace All. Gen UUID if missing.
        const newTodos = items.map(item => ({
            ...item,
            id: item.id || crypto.randomUUID()
        }));

        ctx.todos = newTodos;
        this.saveContext(patientId, ctx);

        return { success: true, code: '20000', message: 'Todos synced', data: newTodos };
    }

    // PUT /placement
    async updatePlacement(patientId: string, data: DischargePlacement): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.checkLock(ctx);

        // Validation: Type Home requires homeCare
        if (data.type === 'Home' && !data.homeCare) {
            throw new ApiError('ERR_VALIDATION_FAIL', 'Home placement requires homeCare details', 400);
        }

        ctx.placement = data;
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Placement updated', data: null };
    }

    // PUT /assessment
    async updateAssessment(patientId: string, data: { cmsScore: number, barthelIndex: BarthelIndex }): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.checkLock(ctx);

        ctx.assessment = data;
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Assessment updated', data: null };
    }

    // --- Actions ---

    private validateTransition(ctx: MockState, action: ActionType) {
        const allowed = ALLOWED_TRANSITIONS[ctx.currentState];
        if (!allowed || !allowed.includes(action)) {
            throw new ApiError('ERR_TRANSITION_INVALID', `Cannot perform ${action} from ${ctx.currentState}`, 409);
        }
    }

    // POST /flag
    async flag(patientId: string, payload: FlagPayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.FLAG);

        ctx.currentState = CaseState.S1;
        this.recordHistory(ctx, ActionType.FLAG, payload.source === 'AI' ? 'AI System' : 'User', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Flagged', data: null };
    }

    // POST /orders
    async orders(patientId: string, payload: OrdersPayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.ORDERS);

        if (!payload.physicianId) {
            throw new ApiError('ERR_VALIDATION_FAIL', 'physicianId required', 400);
        }

        ctx.currentState = CaseState.S2;
        this.recordHistory(ctx, ActionType.ORDERS, 'Dr. Mock', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Orders received', data: null };
    }

    // POST /pac
    async startPac(patientId: string, payload: PacStartPayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.PAC_START);

        ctx.currentState = CaseState.S5;
        this.recordHistory(ctx, ActionType.PAC_START, 'User', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'PAC Started', data: null };
    }

    // POST /pac-finish
    async finishPac(patientId: string, payload: PacFinishPayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.PAC_FINISH);

        // Validation
        if (payload.status === PacStatus.ACCEPTED && !payload.pacHospital) {
            throw new ApiError('ERR_VALIDATION_FAIL', 'pacHospital required when Accepted', 400);
        }
        if (payload.status === PacStatus.REJECTED && payload.pacHospital) {
            throw new ApiError('ERR_VALIDATION_FAIL', 'pacHospital must be null when Rejected', 400);
        }

        // Logic: Auto Update Placement if Accepted
        if (payload.status === PacStatus.ACCEPTED && ctx.placement) {
            ctx.placement.type = 'Transfer'; // Simplified, spec says "Transfer + PAC"
            ctx.placement.transfer = { type: 'PAC', name: payload.pacHospital! };
        } else if (payload.status === PacStatus.ACCEPTED && !ctx.placement) {
            throw new ApiError('ERR_AUTOMATION_FAIL', 'Cannot update placement (missing)', 500);
        }

        ctx.currentState = CaseState.S2;
        this.recordHistory(ctx, ActionType.PAC_FINISH, 'PAC Manager', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'PAC Finished', data: null };
    }

    // POST /referral
    async referral(patientId: string, payload: ReferralPayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);

        // Blocking Rules
        if (ctx.currentState === CaseState.S1) throw new ApiError('ERR_TRANSITION_INVALID', 'Cannot refer from S1', 409);
        if (ctx.currentState === CaseState.S5) throw new ApiError('ERR_PAC_UNFINISHED', 'Must finish PAC first', 409);

        this.validateTransition(ctx, ActionType.REFERRAL);

        // Validation: Placement & Assessment Not Null
        if (!ctx.placement || !ctx.assessment) {
            throw new ApiError('ERR_VALIDATION_FAIL', 'Placement and Assessment required', 400);
        }

        ctx.currentState = CaseState.S3;
        this.recordHistory(ctx, ActionType.REFERRAL, 'Case Manager', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Referral Sent', data: null };
    }

    // POST /close
    async close(patientId: string, payload: ClosePayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.CLOSE);

        ctx.currentState = CaseState.S4;
        this.recordHistory(ctx, ActionType.CLOSE, 'Admin', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Case Closed', data: null };
    }

    // POST /suspend
    async suspend(patientId: string, payload: SuspendPayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.SUSPEND);

        ctx.previousState = ctx.currentState; // Snapshot state
        ctx.currentState = CaseState.E1;
        this.recordHistory(ctx, ActionType.SUSPEND, 'System', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Case Suspended', data: null };
    }

    // POST /resume
    async resume(patientId: string, payload: ResumePayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.RESUME);

        if (!ctx.previousState) {
            // Fallback if missing? Spec says "Auto-restore". Default S0.
            ctx.currentState = CaseState.S0;
        } else {
            ctx.currentState = ctx.previousState;
        }

        delete ctx.previousState; // Clear snapshot
        this.recordHistory(ctx, ActionType.RESUME, 'User', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Case Resumed', data: null };
    }

    // POST /terminate
    async terminate(patientId: string, payload: TerminatePayload): Promise<ApiResponse<null>> {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.TERMINATE);

        // Validation
        if (payload.type === TerminationType.TRANSFER && !payload.transferDetails) {
            throw new ApiError('ERR_VALIDATION_FAIL', 'Transfer details required', 400);
        }
        if (payload.type !== TerminationType.TRANSFER && payload.transferDetails) {
            // Strict requirement: must be null. 
            // Note: In strict mock, we might just ignore it, but spec says "must be null". 
            // Let's enforce strictly.
            throw new ApiError('ERR_VALIDATION_FAIL', 'Transfer details must be null', 400);
        }

        ctx.currentState = CaseState.T1;
        this.recordHistory(ctx, ActionType.TERMINATE, 'Admin', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Case Terminated', data: null };
    }
}

export const mockApi = new DischargeMockService();
