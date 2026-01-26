/**
 * 看板病患資料 (簡化版)
 */
export interface KanbanPatient {
    id: string;
    mrn: string; // 病歷號
    name: string;
    riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
    riskScore?: number;
    admissionDate: string;

    // 警示狀態 (由後端計算)
    hasAlert: boolean;
    alertMessage?: string;

    // 當前位置
    currentStatusNodeId?: string;
}

/**
 * 看板資料結構 (API 回傳)
 */
export interface KanbanData {
    columns: {
        [nodeId: string]: KanbanPatient[];
    };
    nodes: {
        [nodeId: string]: {
            id: string;
            label: string;
            type: string;
        };
    };
}
