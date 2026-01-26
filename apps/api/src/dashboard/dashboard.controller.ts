import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { CurrentTenant } from '../auth/decorators/user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    /**
     * 取得看板數據 (病患依階段分組)
     * GET /dashboard/kanban?workflowId=xxx
     */
    @Get('kanban')
    async getKanbanData(
        @CurrentTenant() tenant: { id: string },
        @Query('workflowId') workflowId: string,
    ) {
        return this.dashboardService.getPatientsByStage(tenant.id, workflowId);
    }

    /**
     * 取得統計概況
     * GET /dashboard/stats
     */
    @Get('stats')
    async getStats(@CurrentTenant() tenant: { id: string }) {
        return this.dashboardService.getDashboardStats(tenant.id);
    }
}
