import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    WorkflowDefinitionSchema,
    WorkflowNode,
    WorkflowEdge,
    PatientWorkflowState,
} from './types/workflow.types';

@Injectable()
export class WorkflowService {
    constructor(private readonly prisma: PrismaService) { }

    // =====================
    // 流程定義 CRUD
    // =====================

    /**
     * 建立新流程定義
     */
    async createWorkflow(
        tenantId: string,
        data: {
            name: string;
            description?: string;
            definition: WorkflowDefinitionSchema;
        },
    ) {
        return this.prisma.workflowDefinition.create({
            data: {
                tenantId,
                name: data.name,
                description: data.description,
                definition: data.definition as any,
                isPublished: false,
                version: 1,
            },
        });
    }

    /**
     * 取得租戶的所有流程定義
     */
    async getWorkflowsByTenant(tenantId: string) {
        return this.prisma.workflowDefinition.findMany({
            where: { tenantId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    /**
     * 取得單一流程定義
     */
    async getWorkflowById(id: string) {
        const workflow = await this.prisma.workflowDefinition.findUnique({
            where: { id },
        });

        if (!workflow) {
            throw new NotFoundException('找不到指定的流程定義');
        }

        return workflow;
    }

    /**
     * 更新流程定義
     */
    async updateWorkflow(
        id: string,
        data: {
            name?: string;
            description?: string;
            definition?: WorkflowDefinitionSchema;
        },
    ) {
        const workflow = await this.getWorkflowById(id);

        return this.prisma.workflowDefinition.update({
            where: { id },
            data: {
                name: data.name ?? workflow.name,
                description: data.description ?? workflow.description,
                definition: data.definition ? (data.definition as any) : undefined,
                version: data.definition ? workflow.version + 1 : workflow.version,
            },
        });
    }

    /**
     * 發布流程定義
     */
    async publishWorkflow(id: string) {
        const workflow = await this.getWorkflowById(id);
        const definition = workflow.definition as unknown as WorkflowDefinitionSchema;

        // 驗證流程完整性
        this.validateWorkflowDefinition(definition);

        return this.prisma.workflowDefinition.update({
            where: { id },
            data: { isPublished: true },
        });
    }

    // =====================
    // 狀態機邏輯
    // =====================

    /**
     * 取得節點的可用轉換 (Outgoing Edges)
     */
    getAvailableTransitions(
        definition: WorkflowDefinitionSchema,
        currentNodeId: string,
    ): WorkflowEdge[] {
        return definition.edges.filter((edge) => edge.source === currentNodeId);
    }

    /**
     * 執行狀態轉換
     * @param definition 流程定義
     * @param currentState 當前病患狀態
     * @param targetNodeId 目標節點 ID
     * @returns 更新後的病患狀態
     */
    executeTransition(
        definition: WorkflowDefinitionSchema,
        currentState: PatientWorkflowState,
        targetNodeId: string,
    ): PatientWorkflowState {
        const availableTransitions = this.getAvailableTransitions(
            definition,
            currentState.currentNodeId,
        );

        // 檢查轉換是否合法
        const validTransition = availableTransitions.find(
            (edge) => edge.target === targetNodeId,
        );

        if (!validTransition) {
            throw new BadRequestException(
                `無法從節點 ${currentState.currentNodeId} 轉換至 ${targetNodeId}`,
            );
        }

        // 更新歷程
        const now = new Date();
        const updatedHistory = [...currentState.history];

        // 標記當前節點離開時間
        const currentHistoryIndex = updatedHistory.findIndex(
            (h) => h.nodeId === currentState.currentNodeId && !h.exitedAt,
        );
        if (currentHistoryIndex !== -1) {
            updatedHistory[currentHistoryIndex].exitedAt = now;
        }

        // 新增目標節點進入記錄
        updatedHistory.push({
            nodeId: targetNodeId,
            enteredAt: now,
        });

        return {
            currentNodeId: targetNodeId,
            visitedNodeIds: [...new Set([...currentState.visitedNodeIds, targetNodeId])],
            history: updatedHistory,
        };
    }

    /**
     * 檢查是否已完成所有必經節點
     */
    checkMandatoryNodesCompleted(
        definition: WorkflowDefinitionSchema,
        visitedNodeIds: string[],
    ): { isComplete: boolean; missingNodes: WorkflowNode[] } {
        const mandatoryNodes = definition.nodes.filter((node) => node.isMandatory);
        const missingNodes = mandatoryNodes.filter(
            (node) => !visitedNodeIds.includes(node.id),
        );

        return {
            isComplete: missingNodes.length === 0,
            missingNodes,
        };
    }

    /**
     * 驗證流程定義的完整性
     */
    private validateWorkflowDefinition(definition: WorkflowDefinitionSchema): void {
        // 檢查起始節點存在
        const startNode = definition.nodes.find(
            (node) => node.id === definition.startNodeId,
        );
        if (!startNode) {
            throw new BadRequestException('流程定義缺少有效的起始節點');
        }

        // 檢查結束節點存在
        for (const endNodeId of definition.endNodeIds) {
            const endNode = definition.nodes.find((node) => node.id === endNodeId);
            if (!endNode) {
                throw new BadRequestException(`結束節點 ${endNodeId} 不存在於節點列表中`);
            }
        }

        // 檢查所有邊線的 source/target 都存在
        const nodeIds = new Set(definition.nodes.map((n) => n.id));
        for (const edge of definition.edges) {
            if (!nodeIds.has(edge.source)) {
                throw new BadRequestException(`邊線來源節點 ${edge.source} 不存在`);
            }
            if (!nodeIds.has(edge.target)) {
                throw new BadRequestException(`邊線目標節點 ${edge.target} 不存在`);
            }
        }
    }
}
