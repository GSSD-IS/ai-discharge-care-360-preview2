
// --- Constants (Enums replacement) ---
const CaseState = {
    S0: 'S0',
    S1: 'S1',
    S2: 'S2',
    S3: 'S3',
    S4: 'S4',
    S5: 'S5',
    E1: 'E1',
    T1: 'T1',
};

const ActionType = {
    FLAG: 'FLAG',
    ORDERS: 'ORDERS',
    PAC_START: 'PAC_START',
    PAC_FINISH: 'PAC_FINISH',
    REFERRAL: 'REFERRAL',
    CLOSE: 'CLOSE',
    SUSPEND: 'SUSPEND',
    RESUME: 'RESUME',
    TERMINATE: 'TERMINATE'
};

const FlagSource = { AI: 'AI', MANUAL: 'MANUAL' };
const PacStatus = { ACCEPTED: 'Accepted', REJECTED: 'Rejected' };
const TerminationType = { DECEASED: 'DECEASED', AAD: 'AAD', TRANSFER: 'TRANSFER' };

// --- Mock Service ---
class ApiError extends Error {
    constructor(code, message, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
    }
}

const ALLOWED_TRANSITIONS = {
    [CaseState.S0]: [ActionType.FLAG, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.S1]: [ActionType.ORDERS, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.S2]: [ActionType.PAC_START, ActionType.REFERRAL, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.S3]: [ActionType.CLOSE, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.S4]: [],
    [CaseState.S5]: [ActionType.PAC_FINISH, ActionType.SUSPEND, ActionType.TERMINATE],
    [CaseState.E1]: [ActionType.RESUME, ActionType.TERMINATE],
    [CaseState.T1]: []
};

let MOCK_DB = {
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
    constructor() { this.latency = 10; }

    async delay() {
        return new Promise(resolve => setTimeout(resolve, this.latency));
    }

    getContext(patientId) {
        const ctx = MOCK_DB[patientId];
        if (!ctx) throw new ApiError('ERR_NOT_FOUND', 'Patient not found', 404);
        return ctx;
    }

    saveContext(patientId, newState) {
        MOCK_DB[patientId] = newState;
    }

    checkLock(ctx) {
        if (ctx.currentState === CaseState.S3) {
            throw new ApiError('ERR_STATE_LOCKED', 'Case is locked in S3', 409);
        }
    }

    recordHistory(ctx, action, actorName, snapshot) {
        ctx.history.push({
            timestamp: new Date().toISOString(),
            action,
            actor: { id: 'mock-user', name: actorName },
            snapshot: JSON.parse(JSON.stringify(snapshot))
        });
    }

    async getSummary(patientId) {
        await this.delay();
        const ctx = this.getContext(patientId);
        return {
            success: true, code: '20000', message: 'OK',
            data: {
                patient: ctx.patient, currentState: ctx.currentState,
                placement: ctx.placement, assessment: ctx.assessment,
                todos: ctx.todos, workflowHistory: ctx.history
            }
        };
    }

    async syncTodos(patientId, items) {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.checkLock(ctx); // S3 Write Protection

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

    async updatePlacement(patientId, data) {
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

    async updateAssessment(patientId, data) {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.checkLock(ctx);
        ctx.assessment = data;
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Assessment updated', data: null };
    }

    validateTransition(ctx, action) {
        const allowed = ALLOWED_TRANSITIONS[ctx.currentState];
        if (!allowed || !allowed.includes(action)) {
            throw new ApiError('ERR_TRANSITION_INVALID', `Cannot perform ${action} from ${ctx.currentState}`, 409);
        }
    }

    async flag(patientId, payload) {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.FLAG);
        ctx.currentState = CaseState.S1;
        this.recordHistory(ctx, ActionType.FLAG, payload.source === 'AI' ? 'AI System' : 'User', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Flagged', data: null };
    }

    async orders(patientId, payload) {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.ORDERS);
        if (!payload.physicianId) throw new ApiError('ERR_VALIDATION_FAIL', 'physicianId required', 400);
        ctx.currentState = CaseState.S2;
        this.recordHistory(ctx, ActionType.ORDERS, 'Dr. Mock', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'Orders received', data: null };
    }

    async startPac(patientId, payload) {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.PAC_START);
        ctx.currentState = CaseState.S5;
        this.recordHistory(ctx, ActionType.PAC_START, 'User', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'PAC Started', data: null };
    }

    async finishPac(patientId, payload) {
        await this.delay();
        const ctx = this.getContext(patientId);
        this.validateTransition(ctx, ActionType.PAC_FINISH);
        if (payload.status === PacStatus.ACCEPTED && !payload.pacHospital) throw new ApiError('ERR_VALIDATION_FAIL', 'pacHospital required', 400);
        if (payload.status === PacStatus.REJECTED && payload.pacHospital) throw new ApiError('ERR_VALIDATION_FAIL', 'pacHospital must be null', 400);

        if (payload.status === PacStatus.ACCEPTED && ctx.placement) {
            ctx.placement.type = 'Transfer';
            ctx.placement.transfer = { type: 'PAC', name: payload.pacHospital };
        }
        ctx.currentState = CaseState.S2;
        this.recordHistory(ctx, ActionType.PAC_FINISH, 'PAC Manager', payload);
        this.saveContext(patientId, ctx);
        return { success: true, code: '20000', message: 'PAC Finished', data: null };
    }

    async referral(patientId, payload) {
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

    async close(patientId, payload) {
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
    console.log('--- Starting Mock API JS Tests ---');
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
        } catch (e) {
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
        } catch (e) {
            console.assert(e.code === 'ERR_PAC_UNFINISHED', 'Block S5 -> Referral');
            console.log('✅ Block S5 -> Referral');
        }

        await mockApi.finishPac(pId, { status: PacStatus.ACCEPTED, recommendation: 'Go', pacHospital: 'General Hospital' });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S2, 'Return to S2');
        console.assert(summary.data.placement.type === 'Transfer', 'Auto Placement Update');
        console.log('✅ PAC Finish & Automation');

        // Todo Sync Test (Must be before S3)
        await mockApi.syncTodos(pId, [{ text: "New Todo", isCompleted: false }]);
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.todos.length === 1, 'Todo added');
        console.assert(!!summary.data.todos[0].id, 'Todo ID generated');
        console.log('✅ Todo Sync');

        await mockApi.referral(pId, { matchedResources: ['r1'] });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S3, 'S3 after Referral');
        console.log('✅ S2 -> S3 Referral');

        try {
            await mockApi.updatePlacement(pId, { type: 'Home' });
            console.error('❌ Failed to block Update in S3');
        } catch (e) {
            console.assert(e.code === 'ERR_STATE_LOCKED', 'Block S3 Update');
            console.log('✅ S3 Locking');
        }

        // Locked Todo Test
        try {
            await mockApi.syncTodos(pId, []);
            console.error('❌ Failed to block Todo Sync in S3');
        } catch (e) {
            console.assert(e.code === 'ERR_STATE_LOCKED', 'Block S3 Todo');
            console.log('✅ S3 Todo Locking');
        }

        await mockApi.close(pId, { actualDischargeDate: '2023-12-31', finalDestination: 'Home' });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S4, 'S4 after Close');
        console.log('✅ S3 -> S4 Close');

        console.log('🎉 All JS Tests Passed!');
    } catch (e) {
        console.error('Test Failed:', e);
        process.exit(1);
    }
}

runTests();
