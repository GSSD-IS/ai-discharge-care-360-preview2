/**
 * 流程節點類型
 */
export enum NodeType {
    /** 起始節點 - 流程入口 */
    START = 'START',
    /** 階段節點 - 代表一個狀態/步驟 */
    STAGE = 'STAGE',
    /** 條件節點 - 依據條件分支 */
    CONDITION = 'CONDITION',
    /** 動作節點 - 觸發系統動作 (通知、表單等) */
    ACTION = 'ACTION',
    /** 結束節點 - 流程終點 */
    END = 'END',
}

/**
 * 流程節點定義
 */
export interface WorkflowNode {
    /** 節點唯一識別碼 */
    id: string;
    /** 節點類型 */
    type: NodeType;
    /** 節點標籤 (顯示名稱) */
    label: string;
    /** 節點描述 */
    description?: string;
    /** 是否為必經節點 */
    isMandatory: boolean;
    /** 節點位置 (React Flow 用) */
    position: { x: number; y: number };
    /** 額外資料 (如：綁定的表單 ID、通知設定等) */
    data?: Record<string, unknown>;
    /** 綁定的表單 ID */
    formId?: string;
}

/**
 * 流程邊線定義 (狀態轉換)
 */
export interface WorkflowEdge {
    /** 邊線唯一識別碼 */
    id: string;
    /** 來源節點 ID */
    source: string;
    /** 目標節點 ID */
    target: string;
    /** 轉換標籤 (如：「完成評估」) */
    label?: string;
    /** 轉換條件 (用於 CONDITION 節點) */
    condition?: {
        field: string;
        operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte';
        value: unknown;
    };
}

/**
 * 完整流程定義
 */
export interface WorkflowDefinitionSchema {
    /** 流程版本 */
    version: number;
    /** 流程名稱 */
    name: string;
    /** 流程描述 */
    description?: string;
    /** 所有節點 */
    nodes: WorkflowNode[];
    /** 所有邊線 (轉換) */
    edges: WorkflowEdge[];
    /** 起始節點 ID */
    startNodeId: string;
    /** 結束節點 ID 列表 */
    endNodeIds: string[];
}

/**
 * 病患在流程中的狀態
 */
export interface PatientWorkflowState {
    /** 當前節點 ID */
    currentNodeId: string;
    /** 已造訪的節點 ID 列表 (用於 Mandatory 檢查) */
    visitedNodeIds: string[];
    /** 狀態歷程記錄 */
    history: {
        nodeId: string;
        enteredAt: Date;
        exitedAt?: Date;
        completedData?: Record<string, unknown>;
    }[];
}
