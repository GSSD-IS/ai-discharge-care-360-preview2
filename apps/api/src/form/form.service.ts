import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as adlTemplate from './templates/adl-form.json';
import * as mnaTemplate from './templates/mna-form.json';
import * as socialWorkerTemplate from './templates/social-worker-form.json';

@Injectable()
export class FormService {
    private readonly logger = new Logger(FormService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * 建立新表單定義
     */
    async createForm(
        tenantId: string,
        data: {
            name: string;
            description?: string;
            definition: Record<string, unknown>;
            nodeBindings?: string[];
        },
    ) {
        return this.prisma.formDefinition.create({
            data: {
                tenantId,
                name: data.name,
                description: data.description,
                definition: data.definition as any,
                nodeBindings: data.nodeBindings || [],
            },
        });
    }

    /**
     * 取得租戶的所有表單定義
     */
    async getFormsByTenant(tenantId: string) {
        return this.prisma.formDefinition.findMany({
            where: { tenantId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    /**
     * 取得單一表單定義
     */
    async getFormById(id: string) {
        const form = await this.prisma.formDefinition.findUnique({
            where: { id },
        });

        if (!form) {
            throw new NotFoundException('找不到指定的表單定義');
        }

        return form;
    }

    /**
     * 更新表單定義
     */
    async updateForm(
        id: string,
        data: {
            name?: string;
            description?: string;
            definition?: Record<string, unknown>;
            nodeBindings?: string[];
        },
    ) {
        await this.getFormById(id);

        return this.prisma.formDefinition.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                definition: data.definition ? (data.definition as any) : undefined,
                nodeBindings: data.nodeBindings,
            },
        });
    }

    /**
     * 刪除表單定義
     */
    async deleteForm(id: string) {
        await this.getFormById(id);
        return this.prisma.formDefinition.delete({ where: { id } });
    }

    /**
     * 取得綁定至特定節點的表單
     */
    async getFormsByNodeId(tenantId: string, nodeId: string) {
        return this.prisma.formDefinition.findMany({
            where: {
                tenantId,
                nodeBindings: { has: nodeId },
            },
        });
    }

    /**
     * 提交表單
     */
    async submitForm(
        formId: string,
        patientId: string,
        submittedById: string,
        data: Record<string, unknown>,
    ) {
        // 驗證表單存在
        await this.getFormById(formId);

        return this.prisma.formSubmission.create({
            data: {
                formId,
                patientId,
                submittedById,
                data: data as any,
            },
        });
    }

    /**
     * 取得病患的表單提交紀錄
     */
    async getSubmissionsByPatient(patientId: string) {
        return this.prisma.formSubmission.findMany({
            where: { patientId },
            include: { form: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * 取得特定表單的所有提交紀錄
     */
    async getSubmissionsByForm(formId: string) {
        return this.prisma.formSubmission.findMany({
            where: { formId },
            orderBy: { createdAt: 'desc' },
        });
        return this.prisma.formSubmission.findMany({
            where: { formId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * 為租戶種子預設表單 (ADL, MNA, Social Worker)
     */
    async seedDefaultForms(tenantId: string) {
        const templates = [
            { name: 'ADL 評估表 (Barthel Index)', template: adlTemplate },
            { name: 'MNA 迷你營養評估 (MNA-SF)', template: mnaTemplate },
            { name: '社工需求評估表', template: socialWorkerTemplate },
        ];

        let createdCount = 0;

        for (const t of templates) {
            // Check if form with same name exists to avoid duplicates
            const existing = await this.prisma.formDefinition.findFirst({
                where: { tenantId, name: t.name },
            });

            if (!existing) {
                await this.createForm(tenantId, {
                    name: t.name,
                    description: '系統預設臨床表單模板',
                    definition: t.template as any,
                });
                createdCount++;
            }
        }

        this.logger.log(`Seeded ${createdCount} default forms for tenant ${tenantId}`);
        return { message: `已成功匯入 ${createdCount} 個預設表單`, count: createdCount };
    }
}
