import type { DischargePlacement, Patient } from '../../types/template';

// --- Global Response Wrapper ---
export interface ApiResponse<T = null> {
    success: boolean;
    code: string;
    message: string;
    data: T;
    traceId?: string;
}

// --- BarthelIndex (defined locally since not exported from template.ts) ---
export interface BarthelIndex {
    feeding: number;
    bathing: number;
    grooming: number;
    dressing: number;
    bowels: number;
    bladder: number;
    toiletUse: number;
    transfers: number;
    mobility: number;
    stairs: number;
    total: number;
}

// --- Enums (as const for erasableSyntaxOnly compatibility) ---
export const CaseState = {
    S0: 'S0', // Monitor
    S1: 'S1', // Review (Flagged)
    S2: 'S2', // Assessment
    S3: 'S3', // Locked (Referral Sent)
    S4: 'S4', // Closed
    S5: 'S5', // PAC Consult
    E1: 'E1', // Suspended
    T1: 'T1', // Terminated
} as const;
export type CaseState = typeof CaseState[keyof typeof CaseState];

export const ActionType = {
    FLAG: 'FLAG',
    ORDERS: 'ORDERS',
    PAC_START: 'PAC_START',
    PAC_FINISH: 'PAC_FINISH',
    REFERRAL: 'REFERRAL',
    CLOSE: 'CLOSE',
    SUSPEND: 'SUSPEND',
    RESUME: 'RESUME',
    TERMINATE: 'TERMINATE'
} as const;
export type ActionType = typeof ActionType[keyof typeof ActionType];

export const FlagSource = {
    AI: 'AI',
    MANUAL: 'MANUAL'
} as const;
export type FlagSource = typeof FlagSource[keyof typeof FlagSource];

export const PacStatus = {
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected'
} as const;
export type PacStatus = typeof PacStatus[keyof typeof PacStatus];

export const TerminationType = {
    DECEASED: 'DECEASED',
    AAD: 'AAD',
    TRANSFER: 'TRANSFER'
} as const;
export type TerminationType = typeof TerminationType[keyof typeof TerminationType];

// --- Data Models ---
export interface TodoItem {
    id: string; // UUID
    text: string;
    isCompleted: boolean;
    date?: string; // YYYY-MM-DD
    time?: string;
    location?: string;
    relatedPerson?: string;
    target?: string;
}

export interface WorkflowSnapshot {
    riskScore?: number;
    reason?: string;
    hisOrderId?: string;
    orderContent?: string;
    consultDept?: string;
    finalDestination?: string;
    [key: string]: any;
}

export interface WorkflowHistoryItem {
    timestamp: string; // ISO8601
    action: ActionType;
    actor: {
        id: string;
        name: string;
    };
    snapshot: WorkflowSnapshot;
}

export interface CaseSummaryData {
    patient: {
        id: string;
        name: string;
        bed: string;
        mrn: string;
    };
    currentState: CaseState;
    placement: DischargePlacement | null;
    assessment: {
        cmsScore: number;
        barthelIndex: BarthelIndex;
    } | null;
    todos: TodoItem[];
    workflowHistory: WorkflowHistoryItem[];
}

// --- Request Payloads ---

// PUT /cases/{id}/todos
export type UpdateTodosPayload = TodoItem[];

// POST /actions/flag
export interface FlagPayload {
    source: FlagSource;
    riskScore: number;
    reason: string;
}

// POST /actions/orders
export interface OrdersPayload {
    hisOrderId: string;
    orderContent: string;
    physicianId: string;
}

// POST /actions/pac
export interface PacStartPayload {
    consultDept: string;
    urgency: 'Routine' | 'High';
    reason: string;
}

// POST /actions/pac-finish
export interface PacFinishPayload {
    status: PacStatus;
    recommendation: string;
    pacHospital: string | null;
}

// POST /actions/referral
export interface ReferralPayload {
    matchedResources?: string[];
    aiPlan?: {
        careProblems: string[];
        resourceSuggestions: string[];
    };
}

// POST /actions/suspend
export interface SuspendPayload {
    reason: string;
    vitals?: {
        temp: number;
        spo2: number;
    };
}

// POST /actions/resume
export interface ResumePayload {
    note: string;
}

// POST /actions/terminate
export interface TerminatePayload {
    type: TerminationType;
    reason: string;
    occurredAt: string; // ISO8601
    transferDetails: {
        targetHospital: string;
        targetDepartment: string;
    } | null;
}

// POST /actions/close
export interface ClosePayload {
    actualDischargeDate: string; // ISO8601
    finalDestination: string;
    checkoutNote?: string;
}

// Re-export for convenience
export type { DischargePlacement, Patient };
