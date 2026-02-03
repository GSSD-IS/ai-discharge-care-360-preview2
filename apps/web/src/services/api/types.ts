import {
    DischargePlacement,
    BarthelIndex,
    Patient
} from '../../types/template';

// --- Global Response Wrapper ---
export interface ApiResponse<T = null> {
    success: boolean;
    code: string;
    message: string;
    data: T;
    traceId?: string;
}

// --- Enums ---
export enum CaseState {
    S0 = 'S0', // Monitor
    S1 = 'S1', // Review (Flagged)
    S2 = 'S2', // Assessment
    S3 = 'S3', // Locked (Referral Sent)
    S4 = 'S4', // Closed
    S5 = 'S5', // PAC Consult
    E1 = 'E1', // Suspended
    T1 = 'T1', // Terminated
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
    // Snapshot can be any payload, using a union type or specific interface per action is better
    // For simplicity in Mock, we allow partial flexible structure but strongly typed common fields
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
    pacHospital: string | null; // Required if Accepted, Null if Rejected
}

// POST /actions/referral
export interface ReferralPayload {
    matchedResources?: string[]; // IDs
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
    } | null; // Required if TRANSFER, Null otherwise
}

// POST /actions/close
export interface ClosePayload {
    actualDischargeDate: string; // ISO8601
    finalDestination: string;
    checkoutNote?: string;
}
