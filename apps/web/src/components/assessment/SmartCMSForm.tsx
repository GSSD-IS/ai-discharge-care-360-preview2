import React, { useState } from 'react';

interface CMSField {
    id: string;
    label: string;
    aiValue: number;
    aiConfidence: number; // 0-1
    aiReasoning: string;
    humanValue?: number;
    options: { value: number; label: string }[];
}

const MOCK_CMS_DATA: CMSField[] = [
    {
        id: 'eating',
        label: '進食 (Eating)',
        aiValue: 10,
        aiConfidence: 0.95,
        aiReasoning: "護理紀錄顯示病人可自行使用餐具，食慾佳。",
        options: [
            { value: 0, label: "需全協助" },
            { value: 5, label: "需部分協助" },
            { value: 10, label: "完全獨立" }
        ]
    },
    {
        id: 'transfer',
        label: '移位 (Transfer)',
        aiValue: 5,
        aiConfidence: 0.45,
        aiReasoning: "紀錄提及『下床需攙扶』，但未明確指出是否使用輔具。",
        options: [
            { value: 0, label: "無法坐起" },
            { value: 5, label: "需 1-2 人協助" },
            { value: 10, label: "需少許協助" },
            { value: 15, label: "完全獨立" }
        ]
    },
    {
        id: 'toilet',
        label: '如廁 (Toilet Use)',
        aiValue: 10,
        aiConfidence: 0.88,
        aiReasoning: "病人每晚自行如廁次數 2-3 次，行走穩。",
        options: [
            { value: 0, label: "需協助" },
            { value: 5, label: "需部分協助" },
            { value: 10, label: "完全獨立" }
        ]
    }
];

export const SmartCMSForm: React.FC<{ onSave: (score: number) => void }> = ({ onSave }) => {
    const [fields, setFields] = useState<CMSField[]>(MOCK_CMS_DATA);
    const [correctionLog, setCorrectionLog] = useState<string[]>([]);

    const handleCorrection = (id: string, newValue: number) => {
        setFields(prev => prev.map(f => {
            if (f.id === id) {
                // Log if value changed from AI's suggestion
                if (newValue !== f.aiValue) {
                    const log = `[Correction] ${f.label}: AI(${f.aiValue}) -> Human(${newValue})`;
                    if (!correctionLog.includes(log)) setCorrectionLog([...correctionLog, log]);
                }
                return { ...f, humanValue: newValue };
            }
            return f;
        }));
    };

    const totalScore = fields.reduce((sum, f) => sum + (f.humanValue ?? f.aiValue), 0);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                        <i className="fas fa-robot"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-indigo-900">AI 智慧評估輔助</h3>
                        <p className="text-xs text-indigo-600 font-medium">AI 已依據護理紀錄預填表單。請核對並修正低信心度項目。</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {fields.map(field => {
                    const currentValue = field.humanValue ?? field.aiValue;
                    const isModified = field.humanValue !== undefined && field.humanValue !== field.aiValue;
                    const isLowConfidence = field.aiConfidence < 0.6;

                    return (
                        <div key={field.id} className={`p-4 rounded-xl border transition-all duration-300 ${isModified ? 'bg-amber-50 border-amber-200' : isLowConfidence ? 'bg-yellow-50/50 border-yellow-200' : 'bg-white border-slate-100'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-800">{field.label}</h4>
                                    {isLowConfidence && !isModified && (
                                        <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                                            <i className="fas fa-triangle-exclamation mr-1"></i> 請確認
                                        </span>
                                    )}
                                    {isModified && (
                                        <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                            <i className="fas fa-pen mr-1"></i> 已修正
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs font-bold text-slate-400">
                                    AI 信心度: <span className={`${field.aiConfidence > 0.8 ? 'text-green-500' : 'text-yellow-500'}`}>{Math.round(field.aiConfidence * 100)}%</span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 mb-3 italic border-l-2 border-slate-200 pl-2">
                                <i className="fas fa-quote-left mr-1 text-slate-300"></i>
                                {field.aiReasoning}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {field.options.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleCorrection(field.id, opt.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentValue === opt.value
                                                ? isModified
                                                    ? 'bg-amber-500 text-white shadow-md transform scale-105'
                                                    : 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        {opt.label} ({opt.value}分)
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Barthel Index</span>
                    <div className="text-3xl font-black text-slate-800">{totalScore} <span className="text-sm text-slate-400 font-medium">/ 100</span></div>
                </div>
                <div className="text-right">
                    {correctionLog.length > 0 && (
                        <div className="text-[10px] text-amber-600 font-medium mb-2 opacity-70">
                            已記錄 {correctionLog.length} 筆修正用於 AI 優化
                        </div>
                    )}
                    <button
                        onClick={() => onSave(totalScore)}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg"
                    >
                        <i className="fas fa-check mr-2"></i> 確認評估結果
                    </button>
                </div>
            </div>
        </div>
    );
};
