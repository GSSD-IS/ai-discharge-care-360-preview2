import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { FormService } from './form.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentTenant, CurrentUser } from '../auth/decorators/user.decorator';
import { UserRole } from '@prisma/client';
import { CreateFormDto, UpdateFormDto, SubmitFormDto } from './dto/form.dto';

@Controller('forms')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class FormController {
    constructor(private readonly formService: FormService) { }

    /**
     * 建立新表單定義
     * POST /forms
     */
    @Post()
    @Roles(UserRole.TENANT_ADMIN, UserRole.CASE_MANAGER)
    async createForm(
        @CurrentTenant() tenant: { id: string },
        @Body() dto: CreateFormDto,
    ) {
        return this.formService.createForm(tenant.id, dto);
    }

    /**
     * 取得租戶所有表單定義
     * GET /forms
     */
    @Get()
    async getForms(@CurrentTenant() tenant: { id: string }) {
        return this.formService.getFormsByTenant(tenant.id);
    }

    /**
     * 取得綁定至特定節點的表單
     * GET /forms/by-node?nodeId=xxx
     */
    @Get('by-node')
    async getFormsByNode(
        @CurrentTenant() tenant: { id: string },
        @Query('nodeId') nodeId: string,
    ) {
        return this.formService.getFormsByNodeId(tenant.id, nodeId);
    }

    /**
     * 取得單一表單定義
     * GET /forms/:id
     */
    @Get(':id')
    async getForm(@Param('id') id: string) {
        return this.formService.getFormById(id);
    }

    /**
     * 更新表單定義
     * PUT /forms/:id
     */
    @Put(':id')
    @Roles(UserRole.TENANT_ADMIN, UserRole.CASE_MANAGER)
    async updateForm(
        @Param('id') id: string,
        @Body() dto: UpdateFormDto,
    ) {
        return this.formService.updateForm(id, dto);
    }

    /**
     * 刪除表單定義
     * DELETE /forms/:id
     */
    @Delete(':id')
    @Roles(UserRole.TENANT_ADMIN)
    async deleteForm(@Param('id') id: string) {
        return this.formService.deleteForm(id);
    }

    /**
     * 提交表單
     * POST /forms/:id/submit
     */
    @Post(':id/submit')
    async submitForm(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
        @Body() dto: SubmitFormDto,
    ) {
        return this.formService.submitForm(id, dto.patientId, user.id, dto.data);
    }

    /**
     * 取得病患的表單提交紀錄
     * GET /forms/submissions/patient/:patientId
     */
    @Get('submissions/patient/:patientId')
    async getPatientSubmissions(@Param('patientId') patientId: string) {
        return this.formService.getSubmissionsByPatient(patientId);
    }

    /**
     * 取得表單的所有提交紀錄
     * GET /forms/:id/submissions
     */
    @Get(':id/submissions')
    async getFormSubmissions(@Param('id') id: string) {
        return this.formService.getSubmissionsByForm(id);
    }

    /**
     * 匯入預設表單模板
     * POST /forms/seed
     */
    @Post('seed/defaults')
    @Roles(UserRole.TENANT_ADMIN)
    async seedDefaults(@CurrentTenant() tenant: { id: string }) {
        return this.formService.seedDefaultForms(tenant.id);
    }
}
