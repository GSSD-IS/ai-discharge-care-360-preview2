export interface WorkflowStep {
    id: string;
    label: string;
    description?: string;
    roles: string[];
    mandatory: boolean;
    actions?: string[];
}

export interface StateDefinition {
    id: string;
    label: string;
    type: 'normal' | 'locked' | 'terminal' | 'abort' | 'pac';
    on?: Record<string, string>; // Event -> Target State ID
    guards?: string[];
}

export interface WorkflowDefinition {
    workflowId: string;
    name: string;
    version: string;
    statemachine: {
        initial: string;
        states: Record<string, StateDefinition>;
        globalEvents: Record<string, { target: string; actions: string[] }>;
    };
    steps: WorkflowStep[]; // For backward compatibility / UI rendering of specific tasks within states
}

export const standardWorkflow: WorkflowDefinition = {
    workflowId: "standard-discharge-v2-ltc3",
    name: "長照 3.0 標準出院流程 (LTC 3.0 Standard)",
    version: "2.0.0",
    statemachine: {
        initial: "S0",
        states: {
            "S0": {
                id: "S0",
                label: "住院監測 (Monitoring)",
                type: "normal",
                on: { "AI_FLAG": "S1" }
            },
            "S1": {
                id: "S1",
                label: "篩選與預備 (Screening)",
                type: "normal",
                on: { "ORDER_T3": "S2" }
            },
            "S2": {
                id: "S2",
                label: "評估與計畫 (Assessment)",
                type: "normal",
                on: {
                    "SUBMIT": "S3",
                    "PAC_ELIGIBLE": "S5"
                },
                guards: ["checkMandatoryForms"]
            },
            "S3": {
                id: "S3",
                label: "轉介鎖定 (Locked)",
                type: "locked",
                on: { "DISCHARGE": "S4" }
            },
            "S4": {
                id: "S4",
                label: "服務啟動 (Active)",
                type: "terminal"
            },
            "S5": {
                id: "S5",
                label: "PAC 分流 (Acute Post)",
                type: "pac",
                on: { "PAC_COMPLETE": "S2" }
            },
            "E1": {
                id: "E1",
                label: "異常中止 (Abort)",
                type: "abort",
                on: { "STABILIZED": "S0" }
            }
        },
        globalEvents: {
            "CLINICAL_DETERIORATION": {
                target: "E1",
                actions: ["rollbackReferral", "notifyTeam"]
            }
        }
    },
    // UI Mapping: Mapping States to the Wizard Steps we built previously
    // This allows us to re-use the DischargePlanningHub UI while powering it with the new SM
    steps: [
        {
            id: "step_pre",
            label: "S0/S1: 監測與篩選",
            description: "AI 背景監測中...",
            roles: ["AI", "Nurse"],
            mandatory: true
        },
        {
            id: "step_assessment",
            label: "S2: 評估與計畫",
            description: "護理、社工、營養、復健評估",
            roles: ["Nurse", "SocialWorker", "Therapist"],
            mandatory: true
        },
        {
            id: "step_review",
            label: "S3: 轉介鎖定",
            description: "資料已拋轉至長照平台",
            roles: ["CaseManager"],
            mandatory: true
        },
        {
            id: "step_finalize",
            label: "S4: 結案出院",
            description: "確認所有項目並產生計畫書",
            roles: ["Physician", "CaseManager"],
            mandatory: true
        }
    ]
};
