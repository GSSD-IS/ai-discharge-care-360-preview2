/**
 * 流程節點類型
 */
export const NodeType = {
    START: 'START',
    STAGE: 'STAGE',
    CONDITION: 'CONDITION',
    ACTION: 'ACTION',
    END: 'END',
} as const;

export type NodeType = typeof NodeType[keyof typeof NodeType];

/**
 * 流程節點定義
 */
export interface WorkflowNode {
    id: string;
    type: NodeType;
    label: string;
    description?: string;
    isMandatory: boolean;
    position: { x: number; y: number };
    data?: Record<string, unknown>;
    formId?: string;
}

/**
 * 流程邊線定義
 */
export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    condition?: {
        field: string;
        operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte';
        value: unknown;
    };
}

/**
 * 完整流程定義
 */
export interface WorkflowDefinition {
    version: number;
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    startNodeId: string;
    endNodeIds: string[];
}
