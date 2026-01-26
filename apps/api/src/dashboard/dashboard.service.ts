import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { WorkflowDefinitionSchema } from '../workflow/types/workflow.types';

@Injectable()
export class DashboardService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly workflowService: WorkflowService,
    ) { }

    /**
     * 取得依階段分組的病患清單 (看板視圖)
     */
    async getPatientsByStage(tenantId: string, workflowId: string) {
        // 1. 取得流程定義以解析節點名稱
        const workflow = await this.workflowService.getWorkflowById(workflowId);
        const definition = workflow.definition as unknown as WorkflowDefinitionSchema;
        const nodesMap = new Map(definition.nodes.map((n) => [n.id, n]));

        // 2. 取得該流程下的所有病患
        const patients = await this.prisma.patient.findMany({
            where: {
                tenantId,
                activeWorkflowId: workflowId,
            },
            orderBy: { updatedAt: 'desc' },
        });

        // 3. 檢查必經節點狀態 (警示邏輯)
        const patientsWithAlerts = patients.map((patient) => {
            // 解析 visitedNodes (假設存在於 Redis 或 DB，目前先模擬為空或需從 history 解析)
            // 這裡簡化：若有 currentStatusNodeId，則檢查它是否為必經
            // 實際專案應從 PatientWorkflowState 取得 visitedNodeIds

            // 暫時 Mock: 隨機產生警示以供前端測試
            const hasAlert = Math.random() > 0.8;

            return {
                ...patient,
                hasAlert,
                alertMessage: hasAlert ? '未完成必經表單' : null,
            };
        });

        // 4. 依節點分組
        const grouped: Record<string, typeof patientsWithAlerts> = {};

        // 初始化所有節點的空陣列
        definition.nodes.forEach(node => {
            if (node.type === 'STAGE' || node.type === 'START' || node.type === 'END') {
                grouped[node.id] = [];
            }
        });

        // 分配病患
        patientsWithAlerts.forEach((patient) => {
            const nodeId = patient.currentStatusNodeId || definition.startNodeId;
            if (grouped[nodeId]) {
                grouped[nodeId].push(patient);
            } else {
                // 處理例外：病患所在的節點已被刪除
                // 將其歸類到 'unknown' 或預設起始點
                if (!grouped['unknown']) grouped['unknown'] = [];
                grouped['unknown'].push(patient);
            }
        });

        return {
            columns: grouped,
            nodes: definition.nodes.reduce((acc, node) => {
                acc[node.id] = node;
                return acc;
            }, {} as Record<string, any>),
        };
    }

    /**
     * 取得儀表板統計數據
     */
    async getDashboardStats(tenantId: string) {
        const totalPatients = await this.prisma.patient.count({ where: { tenantId } });
        const highRiskPatients = await this.prisma.patient.count({
            where: { tenantId, riskLevel: 'HIGH' },
        });

        // 這裡可以增加更多統計，例如本月出院人數等

        return {
            totalPatients,
            highRiskPatients,
            occupancyRate: 85, // Mock data
            readmissionRate: 12.5, // Mock data
        };
    }
}
