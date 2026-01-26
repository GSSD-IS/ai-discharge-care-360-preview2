import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentTenant } from '../auth/decorators/user.decorator';
import { UserRole } from '@prisma/client';
import { WorkflowDefinitionSchema } from './types/workflow.types';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto/workflow.dto';

@Controller('workflows')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class WorkflowController {
    constructor(private readonly workflowService: WorkflowService) { }

    /**
     * 建立新流程定義
     * POST /workflows
     * 僅限 TENANT_ADMIN 或 CASE_MANAGER
     */
    @Post()
    @Roles(UserRole.TENANT_ADMIN, UserRole.CASE_MANAGER)
    async createWorkflow(
        @CurrentTenant() tenant: { id: string },
        @Body() dto: CreateWorkflowDto,
    ) {
        return this.workflowService.createWorkflow(tenant.id, dto);
    }

    /**
     * 取得租戶的所有流程定義
     * GET /workflows
     */
    @Get()
    async getWorkflows(@CurrentTenant() tenant: { id: string }) {
        return this.workflowService.getWorkflowsByTenant(tenant.id);
    }

    /**
     * 取得單一流程定義
     * GET /workflows/:id
     */
    @Get(':id')
    async getWorkflow(@Param('id') id: string) {
        return this.workflowService.getWorkflowById(id);
    }

    /**
     * 更新流程定義
     * PUT /workflows/:id
     * 僅限 TENANT_ADMIN 或 CASE_MANAGER
     */
    @Put(':id')
    @Roles(UserRole.TENANT_ADMIN, UserRole.CASE_MANAGER)
    async updateWorkflow(
        @Param('id') id: string,
        @Body() dto: UpdateWorkflowDto,
    ) {
        return this.workflowService.updateWorkflow(id, dto);
    }

    /**
     * 發布流程定義
     * POST /workflows/:id/publish
     * 僅限 TENANT_ADMIN
     */
    @Post(':id/publish')
    @Roles(UserRole.TENANT_ADMIN)
    async publishWorkflow(@Param('id') id: string) {
        return this.workflowService.publishWorkflow(id);
    }
}
