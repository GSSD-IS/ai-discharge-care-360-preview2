import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private readonly logger = new Logger(GeminiService.name);

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY is not defined in env, using default or potentially failing.');
        }
        this.genAI = new GoogleGenerativeAI(apiKey || 'AIzaSyABrJ6eki92OMTi-uwaclqYQI4b6blHkCo');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

    async generateCarePlan(
        patientData: any,
    ): Promise<{ careProblems: string[]; resourceSuggestions: string[]; teamNotes: string }> {
        const prompt = `
      You are an expert medical discharge planner in Taiwan.
      Generate a care plan for this patient:
      ${JSON.stringify(patientData)}

      Return JSON with:
      1. "careProblems": List of 3-5 potential care problems (e.g., risk of falling).
      2. "resourceSuggestions": List of 3 suitable long-term care resources in Taiwan.
      3. "teamNotes": A professional note for the medical team (less than 50 words).

      Language: Traditional Chinese.
      Do not include markdown code blocks.
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const text = this.cleanJson(result.response.text());
            return JSON.parse(text);
        } catch (error) {
            this.logger.error('Care plan generation failed', error);
            return {
                careProblems: ['無法取得 AI 建議', '請手動評估'],
                resourceSuggestions: [],
                teamNotes: 'AI 服務連線失敗',
            };
        }
    }

    async generateEducation(category: string, patientData: any): Promise<{ content: string }> {
        const prompt = `
      Write a short, easy-to-understand patient education card for category: "${category}".
      Patient Context:
      ${JSON.stringify(patientData)}

      Language: Traditional Chinese.
      Tone: Warm, encouraging, simple (for elderly).
      Length: Around 50-80 words.
      Return JSON with field "content".
      Do not include markdown code blocks.
    `;
        try {
            const result = await this.model.generateContent(prompt);
            const text = this.cleanJson(result.response.text());
            return JSON.parse(text);
        } catch (error) {
            return { content: '暫時無法生成衛教內容。' };
        }
    }

    async assessRisk(patientData: any): Promise<{ riskLevel: string; score: number; reasoning: string }> {
        const prompt = `
      Act as a clinical risk manager. Analyze the 30-day readmission risk for:
      ${JSON.stringify(patientData)}

      Factors to consider: Age, recent surgeries, comorbidities, living situation.

      Return JSON with:
      - "riskLevel": "High" (>70), "Medium" (30-70), or "Low" (<30).
      - "score": Integer 0-100.
      - "reasoning": Concise clinical explanation in Traditional Chinese (max 50 words).

      Do not include markdown code blocks.
    `;
        try {
            const result = await this.model.generateContent(prompt);
            const text = this.cleanJson(result.response.text());
            return JSON.parse(text);
        } catch (error) {
            this.logger.error('Risk assessment failed', error);
            return { riskLevel: 'Unknown', score: 0, reasoning: 'AI Service Error' };
        }
    }

    private cleanJson(text: string): string {
        return text.replace(/```json/g, '').replace(/```/g, '').trim();
    }
}
