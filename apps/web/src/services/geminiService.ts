import type { Patient } from '../types/template';

export const generateDischargeSummary = async (patient: Patient): Promise<string> => {
    return `[Mock AI Summary for ${patient.name}]
  個案目前生命徵象穩定。護理端指出傷口癒合良好，但需注意防跌。
  營養方面建議維持低鹽低脂飲食。藥劑師已核對用藥，無交互作用風險。
  社工目前正在協助申請長照補助，進度正常。
  整體出院風險評估：${patient.riskScore > 60 ? '高風險，需密切追蹤' : '低風險，可按計畫出院'}。`;
};

export const generateCarePlanAI = async (_patient: Patient): Promise<{ careProblems: string[], resourceSuggestions: string[], teamNotes: string }> => {
    return {
        careProblems: [
            '高齡跌倒風險',
            '術後傷口照護知識不足',
            '多重用藥遵囑性潛在問題'
        ],
        resourceSuggestions: [
            '居家護理訪視 (每週一次)',
            '長照交通接送服務',
            '輔具購買補助 (助行器)'
        ],
        teamNotes: '建議出院前由護理師進行最後一次家屬衛教回覆示教。'
    };
};

export const generateEducationText = async (category: string, _patient: Patient): Promise<string> => {
    const contents: Record<string, string> = {
        'Wound': '傷口保持清潔乾燥，若有紅腫熱痛請立即回診。換藥時請先洗手，使用無菌棉棒。',
        'Nasogastric': '鼻胃管餵食前後請確認管路位置。進食後請維持半坐臥姿至少 30 分鐘以防嗆咳。',
        'Nutrition': '建議攝取高蛋白飲食促進傷口癒合，如魚肉、蛋、豆漿。避免刺激性食物。',
        'Activity': '建議每日進行床邊坐起練習 3 次，每次 10 分鐘。下床行走需由家屬陪同。'
    };
    return contents[category] || '暫無特定衛教內容。';
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
