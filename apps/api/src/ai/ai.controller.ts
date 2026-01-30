import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('ai')
export class AiController {
    constructor(private readonly geminiService: GeminiService) { }

    @Post('care-plan')
    async generateCarePlan(@Body() body: any) {
        return this.geminiService.generateCarePlan(body);
    }

    @Post('education')
    async generateEducation(@Body() body: { category: string; patientData: any }) {
        return this.geminiService.generateEducation(body.category, body.patientData);
    }

    @Post('risk-assessment')
    async assessRisk(@Body() body: any) {
        return this.geminiService.assessRisk(body);
    }
}
