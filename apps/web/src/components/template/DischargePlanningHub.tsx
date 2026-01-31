import React, { useState, useEffect, useMemo } from 'react';
import { type Patient, ResourceCategory, type MatchedResource } from '../../types/template';
import { generateCarePlanAI, generateEducationText } from '../../services/geminiService';
import { standardWorkflow } from '../../data/standardWorkflow';
import { vitalMonitor } from '../../services/vitalSignMonitor';
import { SmartCMSForm } from '../assessment/SmartCMSForm';
import DischargePlacementForm from './DischargePlacementForm';
import type { DischargePlacement } from '../../types/template';

interface DischargePlanningHubProps {
    patients: Patient[];
}

const MOCK_THIRD_PARTY_RESOURCES: MatchedResource[] = [
    { id: 'ext1', name: '大愛居家護理所', category: ResourceCategory.HomeNursing, contactPerson: '王主任', phone: '02-2345-6789', city: '臺北市', status: '待確認' as any },
    { id: 'ext2', name: '陽光長照中心', category: ResourceCategory.LongTermCare, contactPerson: '李照專', phone: '02-8765-4321', city: '臺北市', status: '待確認' as any },
    { id: 'ext3', name: '永和輔具特約店', category: ResourceCategory.AssistiveTech, contactPerson: '陳先生', phone: '02-1122-3344', city: '新北市', status: '待確認' as any },
    { id: 'ext4', name: '幸福養護之家', category: ResourceCategory.LongTermCare, contactPerson: '林組長', phone: '03-5566-7788', city: '桃園市', status: '待確認' as any },
    { id: 'ext5', name: '中台灣呼吸維護所', category: ResourceCategory.HomeRespiratory, contactPerson: '張組長', phone: '04-2233-4455', city: '臺中市', status: '待確認' as any },
    { id: 'ext6', name: '南部居護聯盟', category: ResourceCategory.HomeNursing, contactPerson: '蘇小姐', phone: '07-8899-0011', city: '高雄市', status: '待確認' as any },
];

const DischargePlanningHub: React.FC<DischargePlanningHubProps> = ({ patients }) => {
    // Basic Patient State
    const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
    const [activePatient, setActivePatient] = useState<Patient | undefined>(patients[0]);

    // State Machine & Workflow State
    const [currentState, setCurrentState] = useState<string>('S0');
    const [activeStepId, setActiveStepId] = useState<string>(standardWorkflow.steps[0].id);
    const [isPublished, setIsPublished] = useState(false);

    // L1 Sense Layer: Vitals
    const [vitals, setVitals] = useState({ temp: 36.5, spo2: 98, isCritical: false });

    // Workflow Content State
    const [aiPlan, setAiPlan] = useState<{ careProblems: string[], resourceSuggestions: string[], teamNotes: string } | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);
    const [eduContent, setEduContent] = useState<Record<string, string>>({});
    // Removed unused eduVideos state
    const [matchedResources, setMatchedResources] = useState<MatchedResource[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Placement Logic
    const [placementData, setPlacementData] = useState<DischargePlacement | undefined>(patients[0]?.dischargePlacement);
    const [isPlacementExpanded, setIsPlacementExpanded] = useState(true);

    const handleSavePlacement = (data: DischargePlacement) => {
        setPlacementData(data);
        if (activePatient) {
            activePatient.dischargePlacement = data; // Sync to patient object
        }
        alert("安置方向已更新！AI 將參考此資料生成計畫。");
    };

    // Print & Send Logic
    const handlePrint = () => {
        window.print();
    };

    const handleSendToApp = () => {
        setIsPublished(true);
        alert(`已發送至病患 [${activePatient?.name}] 的家屬端 App！\n包含：\n1. 出院照護計畫書 PDF\n2. 衛教影片清單\n3. 居家照顧注意事項`);
    };

    // CMS Score State
    const [cmsScore, setCmsScore] = useState<number | null>(null);

    // Init Monitor
    useEffect(() => {
        vitalMonitor.start();
        const unsub = vitalMonitor.subscribe((data) => {
            setVitals(data);
            // L4 Decide Layer: Global Guard
            if (data.isCritical && currentState !== 'E1') {
                setCurrentState('E1');
                alert('⚠️ [AI 守衛] 偵測到臨床惡化 (發燒/血氧低)，已強制中止轉介流程 (E1 Rollback)！');
            }
        });
        return () => {
            unsub();
            vitalMonitor.stop();
        };
    }, [currentState]);

    useEffect(() => {
        const patient = patients.find(p => p.id === selectedPatientId);
        setActivePatient(patient);
        setAiPlan(null);
        setMatchedResources(patient?.matchedResources || []);
        setIsPublished(false);
        setCmsScore(null);
        // Reset state on patient change for demo
        setCurrentState('S0');
    }, [selectedPatientId, patients]);

    // Sync placement data when active patient changes
    useEffect(() => {
        if (activePatient) {
            setPlacementData(activePatient.dischargePlacement);
        }
    }, [activePatient]);

    // Manual Override Logic (L4 Decide)
    const handleOverride = () => {
        const reason = prompt("請輸入強制解除鎖定的理由 (此操作將被記錄於 Override Log):", "病情已控制");
        if (reason) {
            console.log(`[Optimization Loop] User Overridden E1. Reason: ${reason}. This is a negative sample for Criticality Detector.`);
            vitalMonitor.forceRecovery(); // Reset mock data
            setCurrentState('S0'); // Reset to initial state (or previous state if complex)
            alert(`已解除鎖定。AI 已學習此情境為「安全異常」。`);
        }
    };

    // State Machine Logic (Mock Transition)
    const canAdvance = () => {
        if (currentState === 'S0' && vitals.isCritical) return false;
        return true;
    };

    const advanceState = (target: string) => {
        if (!canAdvance()) {
            alert('無法推進狀態：臨床指標不穩定');
            return;
        }
        setCurrentState(target);

        // Auto-switch UI tab based on State
        if (target === 'S1') setActiveStepId('step_pre');
        if (target === 'S2') setActiveStepId('step_assessment');
        if (target === 'S3') setActiveStepId('step_review');
        if (target === 'S4') setActiveStepId('step_finalize');
    };

    // --- Helpers ---

    const activeStepIndex = standardWorkflow.steps.findIndex(s => s.id === activeStepId);

    const handleRunAiAnalysis = async () => {
        if (!activePatient) return;
        setLoadingAi(true);
        const result = await generateCarePlanAI(activePatient);
        setAiPlan(result);
        setLoadingAi(false);
        // Simulate S0 -> S1 transition upon AI finding risks
        if (currentState === 'S0') advanceState('S1');
    };

    const handleGenerateEdu = async (cat: string) => {
        if (!activePatient) return;
        const text = await generateEducationText(cat, activePatient);
        setEduContent(prev => ({ ...prev, [cat]: text }));
    };

    // Removed handleVideoUpload

    const addResourceToPlan = (resource: MatchedResource) => {
        if (matchedResources.find(r => r.id === resource.id)) {
            alert("此資源已在清單中");
            return;
        }
        setMatchedResources([...matchedResources, { ...resource, id: Date.now().toString() + Math.random().toString(36).substr(2, 5) }]);
    };

    // Removed unused removeResource

    const handleImportFile = () => {
        alert("正在模擬從外部 Excel/CSV 匯入第三方資源清單...");
        const imported = [MOCK_THIRD_PARTY_RESOURCES[0], MOCK_THIRD_PARTY_RESOURCES[2]];
        setMatchedResources(prev => [...prev, ...imported.map(i => ({ ...i, id: 'imported-' + Math.random() }))]);
    };


    const filteredLibrary = useMemo(() => {
        return MOCK_THIRD_PARTY_RESOURCES.filter(res =>
            res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    // --- Render ---

    // E1 Alert Banner
    if (currentState === 'E1') {
        return (
            <div className="p-10 max-w-4xl mx-auto mt-10">
                <div className="bg-red-50 border-4 border-red-500 rounded-3xl p-10 text-center shadow-2xl animate-pulse">
                    <i className="fas fa-triangle-exclamation text-6xl text-red-500 mb-6"></i>
                    <h1 className="text-4xl font-black text-red-600 mb-4">流程異常中止 (ABORTED)</h1>
                    <p className="text-xl text-red-800 font-bold mb-8">
                        AI 監測到病人生命徵象不穩定 (Temp: {vitals.temp}°C, SpO2: {vitals.spo2}%)。<br />
                        已自動撤回所有長照轉介申請。
                    </p>
                    <button
                        onClick={handleOverride}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg"
                    >
                        <i className="fas fa-user-md mr-2"></i> 醫師強制解除 (Override)
                    </button>
                    <p className="mt-4 text-xs text-red-400 font-mono">
                        <i className="fas fa-database mr-2"></i>
                        L4 Decision Layer: Override will be logged for training.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto pb-20">
            {/* Header with State & Vitals */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${currentState === 'S0' ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-600'}`}>
                            Current State: {standardWorkflow.statemachine.states[currentState]?.label || currentState}
                        </span>
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${vitals.isCritical ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-sky-50 text-sky-600'}`}>
                            <i className="fas fa-heart-pulse mr-1"></i>
                            Temp: {vitals.temp}°C | SpO2: {vitals.spo2}%
                        </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">出院準備與轉介中心</h2>
                    <p className="text-sm text-slate-500 font-medium">Discharge Planning & Transition Center</p>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => vitalMonitor.forceDeterioration()} className="px-3 py-1 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 text-xs font-bold rounded">
                        <i className="fas fa-bug mr-1"></i> Simulate E1
                    </button>
                    <select
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold outline-none"
                    >
                        {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stepper (UI Mapping from SM) */}
            <div className="flex items-center justify-between px-4 overflow-x-auto">
                {standardWorkflow.steps.map((s, idx) => {
                    const isActive = activeStepId === s.id;
                    const isPast = activeStepIndex > idx;
                    return (
                        <button
                            key={s.id}
                            onClick={() => setActiveStepId(s.id)}
                            className={`flex flex-col items-center gap-2 group relative min-w-[100px] ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
                            disabled={!isPast && !isActive}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-slate-900 text-white shadow-xl' : 'bg-white border border-slate-200'}`}>
                                <i className="fas fa-circle-notch"></i>
                            </div>
                            <span className="text-[10px] font-black uppercase">{s.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[500px] p-8">

                {/* Persistent Header: Basic Info & Placement */}
                <div className="mb-8 border-b border-slate-100 pb-8">
                    <button
                        onClick={() => setIsPlacementExpanded(!isPlacementExpanded)}
                        className="flex items-center justify-between w-full mb-4 group"
                    >
                        <h4 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                            <i className="fas fa-clipboard-user text-sky-500"></i>
                            基本資料與安置方向 (AI Context)
                        </h4>
                        <span className="text-xs text-slate-400 group-hover:text-sky-600 transition">
                            <i className={`fas fa-chevron-${isPlacementExpanded ? 'up' : 'down'} mr-1`}></i>
                            {isPlacementExpanded ? '收折' : '展開'}
                        </span>
                    </button>

                    {isPlacementExpanded && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">病患姓名</label>
                                    <p className="font-bold text-slate-800 text-lg">{activePatient?.name}</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">床號 / ID</label>
                                    <p className="font-bold text-slate-700">{activePatient?.bed} <span className="text-slate-300">|</span> {activePatient?.id}</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">主責醫師</label>
                                    <p className="font-bold text-slate-700">Dr. 柯 (V.S.)</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">預計出院日</label>
                                    <p className="font-bold text-slate-700">{activePatient?.expectedDischargeDate || '未定'}</p>
                                </div>
                            </div>

                            <DischargePlacementForm
                                initialData={placementData}
                                onSave={handleSavePlacement}
                            />
                        </div>
                    )}
                </div>

                {/* Step 1: Pre-assessment (S0/S1) */}
                {activeStepId === 'step_pre' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">S0/S1: 住院監測與篩選</h3>
                            <button onClick={handleRunAiAnalysis} disabled={loadingAi} className="bg-sky-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-sky-700 transition shadow-lg flex items-center gap-2">
                                {loadingAi ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
                                {loadingAi ? 'AI 運算中...' : 'AI 自動生成照護計畫'}
                            </button>
                        </div>
                        {aiPlan ? (
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-300">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <i className="fas fa-file-medical-alt text-teal-500"></i>
                                        出院照護計畫 (可編輯預覽)
                                    </h4>
                                    <div className="flex gap-2">
                                        <button onClick={handlePrint} className="bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition">
                                            <i className="fas fa-print mr-1"></i> 列印
                                        </button>
                                        <button onClick={handleSendToApp} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition">
                                            <i className="fas fa-paper-plane mr-1"></i> 發送
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1 block">照護問題 (Care Problems)</label>
                                        <textarea
                                            value={aiPlan.careProblems.join('\n')}
                                            onChange={(e) => setAiPlan(prev => prev ? ({ ...prev, careProblems: e.target.value.split('\n') }) : null)}
                                            className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-200 outline-none min-h-[100px]"
                                            placeholder="AI 將自動生成照護問題..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1 block">資源建議 (Suggestions)</label>
                                        <textarea
                                            value={aiPlan.resourceSuggestions.join('\n')}
                                            onChange={(e) => setAiPlan(prev => prev ? ({ ...prev, resourceSuggestions: e.target.value.split('\n') }) : null)}
                                            className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-200 outline-none min-h-[80px]"
                                            placeholder="AI 將自動生成資源建議..."
                                        />
                                    </div>
                                </div>

                                <button onClick={() => advanceState('S2')} className="mt-6 bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-bold w-full hover:bg-teal-700 transition shadow-lg">
                                    確認計畫並繼續 (前往 S2)
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-slate-300 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                <i className="fas fa-robot text-4xl mb-4 opacity-50"></i>
                                <p>點擊上方按鈕，AI 將根據病歷與安置方向自動生成計畫</p>
                            </div>
                        )}

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <h4 className="text-lg font-bold mb-4">基本資料與安置方向 (AI Context)</h4>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">病患姓名</label>
                                        <p className="font-bold text-slate-700">{activePatient?.name}</p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">床號</label>
                                        <p className="font-bold text-slate-700">{activePatient?.bed}</p>
                                    </div>
                                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">主責醫師</label>
                                        <p className="font-bold text-slate-700">Dr. 柯 (V.S.)</p>
                                    </div>
                                </div>

                                <DischargePlacementForm
                                    initialData={placementData}
                                    onSave={handleSavePlacement}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Assessment (S2) - Enhanced with HITL SmartCMSForm */}
                {activeStepId === 'step_assessment' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold">S2: {standardWorkflow.statemachine.states['S2'].label}</h3>

                        {/* HITL Component */}
                        <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50">
                            <SmartCMSForm onSave={(score) => {
                                setCmsScore(score);
                                alert("評估已完成！資料已暫存。");
                            }} />
                        </div>

                        {/* Transition Control */}
                        {cmsScore !== null && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-4 text-center">
                                    <span className="text-xs font-bold text-indigo-400 uppercase">Ready to Proceed</span>
                                    <p className="text-indigo-900 font-bold">Barthel Index Score: {cmsScore}</p>
                                </div>
                                <button onClick={() => advanceState('S3')} className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-bold shadow-xl">
                                    送出評估 (前往 S3 鎖定)
                                </button>
                            </div>
                        )}

                        {/* Education Section embedded */}
                        {/* Education Section embedded */}
                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                <i className="fas fa-chalkboard-teacher text-teal-600"></i>
                                衛教指導與建議 (AI Generated)
                            </h4>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                                        <i className="fas fa-wand-magic-sparkles text-teal-500"></i> AI 衛教生成
                                    </h3>
                                    <button onClick={() => { handleGenerateEdu('Medication'); handleGenerateEdu('HomeCare'); handleGenerateEdu('FollowUp'); }} disabled={loadingAi} className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                                        <i className={`fas fa-rotate ${loadingAi ? 'fa-spin' : ''}`}></i> 重新生成
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Card 1: Medication */}
                                    <div className="p-4 rounded-xl border-l-4 border-l-emerald-500 bg-slate-50 hover:bg-white hover:shadow-md transition border border-slate-100 group cursor-pointer relative" onClick={() => handleGenerateEdu('Medication')}>
                                        <i className="fas fa-pen absolute right-4 top-4 text-slate-300 hover:text-emerald-500 cursor-pointer"></i>
                                        <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                                            <i className="fas fa-pills text-emerald-500"></i> 藥物使用說明
                                        </h4>
                                        <div className="text-xs text-slate-500 leading-relaxed font-medium">
                                            {eduContent['Medication'] ? <p>{eduContent['Medication']}</p> : (
                                                <>
                                                    <p className="font-bold text-slate-700 mb-1">抗凝血劑 (Warfarin)</p>
                                                    <p>每日固定時間服用。注意牙齦出血或異常瘀青，避免食用過量深綠色蔬菜。</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card 2: Home Care */}
                                    <div className="p-4 rounded-xl border-l-4 border-l-sky-500 bg-slate-50 hover:bg-white hover:shadow-md transition border border-slate-100 group cursor-pointer relative" onClick={() => handleGenerateEdu('HomeCare')}>
                                        <i className="fas fa-pen absolute right-4 top-4 text-slate-300 hover:text-sky-500 cursor-pointer"></i>
                                        <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                                            <i className="fas fa-house-medical text-sky-500"></i> 居家照護重點
                                        </h4>
                                        <div className="text-xs text-slate-500 leading-relaxed space-y-1">
                                            {eduContent['HomeCare'] ? <p>{eduContent['HomeCare']}</p> : (
                                                <ul className="list-disc list-inside">
                                                    <li>傷口保持乾燥，每日觀察有無紅腫。</li>
                                                    <li>氧氣流量設定為 2L/min，遠離煙火。</li>
                                                    <li>每 2 小時協助翻身拍背一次。</li>
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card 3: Follow Up */}
                                    <div className="p-4 rounded-xl border-l-4 border-l-amber-500 bg-slate-50 hover:bg-white hover:shadow-md transition border border-slate-100 group cursor-pointer relative" onClick={() => handleGenerateEdu('FollowUp')}>
                                        <i className="fas fa-pen absolute right-4 top-4 text-slate-300 hover:text-amber-500 cursor-pointer"></i>
                                        <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                                            <i className="fas fa-calendar-check text-amber-500"></i> 預約回診提醒
                                        </h4>
                                        <div className="text-xs text-slate-500 leading-relaxed space-y-1">
                                            {eduContent['FollowUp'] ? <p>{eduContent['FollowUp']}</p> : (
                                                <div className="flex items-center gap-3 mt-3">
                                                    <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex flex-col items-center justify-center leading-none shadow-sm">
                                                        <span className="text-[8px] font-bold uppercase">Dec</span>
                                                        <span className="text-sm font-black">02</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-700 text-xs">心臟內科門診</p>
                                                        <p className="text-[10px] text-slate-400">2023-12-02 09:30 AM</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <button className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xl shadow-teal-700/20 font-black text-sm flex items-center justify-center gap-2 transition transform active:scale-95">
                                        <i className="fas fa-wand-magic-sparkles"></i>
                                        確認並生成正式衛教單張
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Locked (S3) */}
                {activeStepId === 'step_review' && (
                    <div className="text-center py-20">
                        <div className="inline-block p-4 bg-yellow-50 rounded-full mb-4">
                            <i className="fas fa-lock text-3xl text-yellow-500"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">已進入 S3 轉介鎖定狀態</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto mt-2">
                            資料已同步至長照中心。此階段 AI 仍持續監控 (L1 Sense)，若病情變化將自動回滾。
                        </p>

                        <h4 className="font-bold mb-4 text-left">媒合資源清單</h4>
                        <div className="text-left bg-slate-50 p-4 rounded-xl mb-4">
                            <input placeholder="搜尋資源..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full mb-2 p-2 rounded border" />
                            {matchedResources.map(r => <div key={r.id} className="text-sm">{r.name}</div>)}
                            <div className="mt-2 pt-2 border-t">
                                <p className="text-xs text-slate-400">模擬搜尋結果:</p>
                                {filteredLibrary.map(r => (
                                    <button key={r.id} onClick={() => addResourceToPlan(r)} className="mr-2 text-xs bg-white border px-2 py-1 rounded">+ {r.name}</button>
                                ))}
                                <button onClick={handleImportFile} className="float-right text-xs text-sky-600">匯入更多</button>
                            </div>
                        </div>

                        <button onClick={() => advanceState('S4')} className="bg-sky-600 text-white px-8 py-3 rounded-xl font-bold">
                            辦理出院 (S4)
                        </button>
                    </div>
                )}

                {/* Step 4: Success (S4) */}
                {activeStepId === 'step_finalize' && (
                    <div className="text-center py-20">
                        {isPublished ? (
                            <>
                                <h1 className="text-4xl font-black text-green-500 mb-4">結案成功</h1>
                                <p className="text-slate-500">長照服務已啟動。0-Day Wait 達成。</p>
                            </>
                        ) : (
                            <div className="flex justify-center gap-4">
                                <button onClick={handlePrint} className="bg-white border-2 border-slate-800 text-slate-800 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition">
                                    <i className="fas fa-print mr-2"></i> 列印計畫書
                                </button>
                                <button onClick={handleSendToApp} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-xl">
                                    <i className="fas fa-paper-plane mr-2"></i> 發送至家屬 App
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};

export default DischargePlanningHub;
