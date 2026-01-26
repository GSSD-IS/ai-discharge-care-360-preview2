import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly prisma: PrismaService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('seed')
  async seedDemoData() {
    const tenantId = 'demo-tenant-id';

    // 1. Ensure Tenant
    await this.prisma.tenant.upsert({
      where: { id: tenantId },
      update: {},
      create: {
        id: tenantId,
        name: 'Demo Hospital',
        slug: 'demo', // Fixed: slug is required
      },
    });

    // 2. Create Seed Workflow
    const workflowName = '標準出院準備流程';
    const workflow = await this.prisma.workflowDefinition.create({
      data: {
        tenantId,
        name: workflowName,
        definition: {
          version: 1,
          name: workflowName,
          nodes: [
            { id: 'start', type: 'START', label: '入院', position: { x: 250, y: 0 }, isMandatory: false },
            { id: 'stage1', type: 'STAGE', label: '風險篩檢', position: { x: 250, y: 150 }, isMandatory: true },
            { id: 'stage2', type: 'STAGE', label: '綜合評估', position: { x: 250, y: 300 }, isMandatory: true },
            { id: 'stage3', type: 'STAGE', label: '出院衛教', position: { x: 250, y: 450 }, isMandatory: false },
            { id: 'end', type: 'END', label: '出院', position: { x: 250, y: 600 }, isMandatory: false },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'stage1' },
            { id: 'e2', source: 'stage1', target: 'stage2' },
            { id: 'e3', source: 'stage2', target: 'stage3' },
            { id: 'e4', source: 'stage3', target: 'end' },
          ],
          startNodeId: 'start',
          endNodeIds: ['end'],
        } as any,
      }
    });

    // 3. Create Demo Patients
    const patientsData = [
      { name: '王大明', mrn: 'MRN001', riskLevel: 'HIGH', currentStatusNodeId: 'stage1' },
      { name: '李阿姨', mrn: 'MRN002', riskLevel: 'MEDIUM', currentStatusNodeId: 'stage2' },
      { name: '張伯伯', mrn: 'MRN003', riskLevel: 'LOW', currentStatusNodeId: 'stage3' },
      { name: '陳小美', mrn: 'MRN004', riskLevel: 'HIGH', currentStatusNodeId: 'stage1' },
    ];

    for (const p of patientsData) {
      // Check existing to avoid unique constraint error
      const existing = await this.prisma.patient.findFirst({
        where: { tenantId, mrn: p.mrn }
      });

      if (!existing) {
        await this.prisma.patient.create({
          data: {
            tenantId,
            activeWorkflowId: workflow.id,
            currentStatusNodeId: p.currentStatusNodeId,
            mrn: p.mrn,
            name: p.name,
            riskLevel: p.riskLevel as any,
            admissionDate: new Date(), // Fixed: require admissionDate
          }
        });
      }
    }

    return { message: 'Seed complete' };
  }
}
