import { apiRequest } from './api';
import type { Patient } from '../types/template';



export const assessRiskAI = async (patient: Patient): Promise<{ riskLevel: string; score: number; reasoning: string }> => {
    try {
        return await apiRequest<{ riskLevel: string; score: number; reasoning: string }>('/ai/risk-assessment', {
            method: 'POST',
            body: JSON.stringify(patient)
        });
    } catch (e) {
        console.error("AI Risk Error", e);
        return { riskLevel: 'Unknown', score: patient.riskScore, reasoning: 'AI 連線失敗，顯示原始記錄。' };
    }
};

export const generateDischargeSummary = async (patient: Patient): Promise<string> => {
    // Phase 4.3: Real AI Risk Assessment
    const risk = await assessRiskAI(patient);

    return `[AI 摘要報告 (${new Date().toLocaleDateString()})]
  個案姓名：${patient.name}
  ${patient.diagnosis}
  
  【AI 風險評估】
  - 風險等級：${risk.riskLevel} (分數: ${risk.score})
  - 判定理由：${risk.reasoning}

  【綜合建議】
  個案目前生命徵象穩定。護理端指出傷口癒合良好。
  社工目前正在協助申請長照補助。`;
};

export const generateCarePlanAI = async (patient: Patient): Promise<{ careProblems: string[], resourceSuggestions: string[], teamNotes: string }> => {
    try {
        return await apiRequest<{ careProblems: string[], resourceSuggestions: string[], teamNotes: string }>('/ai/care-plan', {
            method: 'POST',
            body: JSON.stringify(patient)
        });
    } catch (e) {
        console.error("AI Error, falling back to mock", e);
        return {
            careProblems: [
                '連線 AI 失敗 - 使用備援資料',
                '高齡跌倒風險',
                '術後傷口照護知識不足'
            ],
            resourceSuggestions: [
                '居家護理訪視 (每週一次)',
                '長照交通接送服務'
            ],
            teamNotes: '建議稍後重試 AI 連線。'
        };
    }
};

export const generateEducationText = async (category: string, patient: Patient): Promise<string> => {
    try {
        const res = await apiRequest<{ content: string }>('/ai/education', {
            method: 'POST',
            body: JSON.stringify({ category, patientData: patient })
        });
        return res.content;
    } catch (e) {
        console.error("AI Education Error", e);
        return '暫無法取得 AI 衛教內容。';
    }
};

export const generateFollowUpQuestions = async (_patient: Patient): Promise<string[]> => {
    return [
        "請問您返家後傷口是否有紅腫熱痛的情形？",
        "服藥後是否有出現頭暈或噁心的副作用？",
        "是否已按照衛教單張進行復健運動？"
    ];
};

export interface FollowUpSummaryParams {
    patientName: string | undefined;
    callDate: string;
    responder: string;
    recentVisit: any;
    qa: any[];
}

export const generateFollowUpNarrative = async (params: FollowUpSummaryParams): Promise<string> => {
    return `[Mock AI Narrative]
    電訪對象：${params.responder}
    個案 ${params.patientName} 目前狀況穩定。
    Q&A 摘要：
    ${params.qa.map((q: any) => `- ${q.question}: ${q.answer}`).join('\n')}
    
    HIS 最近就醫紀錄顯示：${params.recentVisit ? params.recentVisit.details : '無近期紀錄'}。
    建議持續依照出院計畫追蹤，下週再進行一次電訪。`;
};
