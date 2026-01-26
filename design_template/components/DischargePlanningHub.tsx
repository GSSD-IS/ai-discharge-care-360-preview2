
import React, { useState, useEffect, useMemo } from 'react';
import { Patient, DischargeType, ResourceCategory, MatchedResource } from '../types';
import { generateCarePlanAI, generateEducationText } from '../services/geminiService';

interface DischargePlanningHubProps {
  patients: Patient[];
}

const CITIES = ['全部縣市', '臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市', '基隆市', '新竹市', '嘉義市'];

const MOCK_THIRD_PARTY_RESOURCES: MatchedResource[] = [
  { id: 'ext1', name: '大愛居家護理所', category: ResourceCategory.HomeNursing, contactPerson: '王主任', phone: '02-2345-6789', city: '臺北市', status: '待確認' },
  { id: 'ext2', name: '陽光長照中心', category: ResourceCategory.LongTermCare, contactPerson: '李照專', phone: '02-8765-4321', city: '臺北市', status: '待確認' },
  { id: 'ext3', name: '永和輔具特約店', category: ResourceCategory.AssistiveTech, contactPerson: '陳先生', phone: '02-1122-3344', city: '新北市', status: '待確認' },
  { id: 'ext4', name: '幸福養護之家', category: ResourceCategory.LongTermCare, contactPerson: '林組長', phone: '03-5566-7788', city: '桃園市', status: '待確認' },
  { id: 'ext5', name: '中台灣呼吸維護所', category: ResourceCategory.HomeRespiratory, contactPerson: '張組長', phone: '04-2233-4455', city: '臺中市', status: '待確認' },
  { id: 'ext6', name: '南部居護聯盟', category: ResourceCategory.HomeNursing, contactPerson: '蘇小姐', phone: '07-8899-0011', city: '高雄市', status: '待確認' },
];

const DischargePlanningHub: React.FC<DischargePlanningHubProps> = ({ patients }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [activePatient, setActivePatient] = useState<Patient | undefined>(patients[0]);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [isPublished, setIsPublished] = useState(false);
  
  // Section 1: AI Plan
  const [aiPlan, setAiPlan] = useState<{ careProblems: string[], resourceSuggestions: string[], teamNotes: string } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Section 2: Education
  const [eduContent, setEduContent] = useState<Record<string, string>>({});
  const [eduVideos, setEduVideos] = useState<Record<string, string>>({});

  // Section 3: Matched Resources & External Library
  const [matchedResources, setMatchedResources] = useState<MatchedResource[]>([]);
  const [newResource, setNewResource] = useState<Partial<MatchedResource>>({
    category: ResourceCategory.LongTermCare,
    status: '待確認',
    city: '臺北市'
  });
  const [selectedCity, setSelectedCity] = useState<string>('全部縣市');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const patient = patients.find(p => p.id === selectedPatientId);
    setActivePatient(patient);
    setAiPlan(null); 
    setMatchedResources(patient?.matchedResources || []);
    setIsPublished(false);
  }, [selectedPatientId, patients]);

  const filteredLibrary = useMemo(() => {
    return MOCK_THIRD_PARTY_RESOURCES.filter(res => {
      const matchesCity = selectedCity === '全部縣市' || res.city === selectedCity;
      const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            res.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCity && matchesSearch;
    });
  }, [selectedCity, searchQuery]);

  const handleRunAiAnalysis = async () => {
    if (!activePatient) return;
    setLoadingAi(true);
    const result = await generateCarePlanAI(activePatient);
    setAiPlan(result);
    setLoadingAi(false);
  };

  const handleGenerateEdu = async (cat: string) => {
    if (!activePatient) return;
    const text = await generateEducationText(cat, activePatient);
    setEduContent(prev => ({ ...prev, [cat]: text }));
  };

  const handleVideoUpload = (cat: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEduVideos(prev => ({ ...prev, [cat]: file.name }));
    }
  };

  const addResourceToPlan = (resource: MatchedResource) => {
    if (matchedResources.find(r => r.id === resource.id)) {
      alert("此資源已在清單中");
      return;
    }
    setMatchedResources([...matchedResources, { ...resource, id: Date.now().toString() + Math.random().toString(36).substr(2, 5) }]);
  };

  const handleManualAdd = () => {
    if (!newResource.name || !newResource.phone) {
      alert("請填寫資源名稱與聯絡電話");
      return;
    }
    const resource: MatchedResource = {
      id: Date.now().toString(),
      category: newResource.category as ResourceCategory,
      name: newResource.name || '',
      contactPerson: newResource.contactPerson || '單位窗口',
      phone: newResource.phone || '',
      status: newResource.status as any || '待確認',
      city: newResource.city,
      note: newResource.note
    };
    setMatchedResources([...matchedResources, resource]);
    setNewResource({ category: ResourceCategory.LongTermCare, status: '待確認', city: '臺北市' });
  };

  const removeResource = (id: string) => {
    setMatchedResources(matchedResources.filter(r => r.id !== id));
  };

  const handleImportFile = () => {
    // Simulated file import
    alert("正在模擬從外部 Excel/CSV 匯入第三方資源清單...");
    const imported = [MOCK_THIRD_PARTY_RESOURCES[0], MOCK_THIRD_PARTY_RESOURCES[2]];
    setMatchedResources(prev => [...prev, ...imported.map(i => ({ ...i, id: 'imported-' + Math.random() }))]);
  };

  const handlePublish = () => {
    setIsPublished(true);
    setTimeout(() => {
      alert("計畫已正式同步至家屬端行動 App！");
    }, 100);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto pb-20">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">建立出院準備計畫</h2>
          <p className="text-sm text-slate-500 font-medium">Step by Step 個案安置流程</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">個案選擇:</label>
          <select 
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-sky-600 outline-none focus:ring-2 focus:ring-sky-500"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.bed})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modern Stepper */}
      <div className="flex items-center justify-between px-4">
        {[
          { step: 1, title: '照護分析', icon: 'fa-brain' },
          { step: 2, title: '衛教生成', icon: 'fa-graduation-cap' },
          { step: 3, title: '資源清單', icon: 'fa-clipboard-check' },
          { step: 4, title: '預覽發布', icon: 'fa-paper-plane' }
        ].map((s, idx) => (
          <React.Fragment key={s.step}>
            <button
              onClick={() => setActiveStep(s.step as any)}
              className="flex flex-col items-center gap-2 group relative"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeStep === s.step ? 'bg-slate-900 text-white shadow-xl scale-110' : activeStep > s.step ? 'bg-sky-500 text-white' : 'bg-white text-slate-300 border border-slate-100'}`}>
                <i className={`fas ${s.icon}`}></i>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeStep === s.step ? 'text-slate-900' : 'text-slate-400'}`}>{s.title}</span>
              {activeStep === s.step && <div className="absolute -bottom-4 w-1 h-1 bg-sky-500 rounded-full"></div>}
            </button>
            {idx < 3 && <div className={`flex-1 h-0.5 mx-4 rounded-full ${activeStep > s.step ? 'bg-sky-500' : 'bg-slate-100'}`}></div>}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[550px] overflow-hidden flex flex-col">
        <div className="flex-1">
          {activeStep === 1 && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <h3 className="text-xl font-bold text-slate-800">1. 照護問題與 AI 分析</h3>
                <button 
                  onClick={handleRunAiAnalysis}
                  disabled={loadingAi}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center gap-2 shadow-lg shadow-sky-600/20"
                >
                  {loadingAi ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-magic"></i>}
                  {loadingAi ? 'AI 分析中...' : '生成 AI 照護建議'}
                </button>
              </div>

              {aiPlan ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">核心照護問題 (Care Problems)</h4>
                    <div className="space-y-2">
                      {aiPlan.careProblems.map((prob, i) => (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 leading-relaxed">
                          <span className="text-sky-500 mr-2 font-black">#{i+1}</span> {prob}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">AI 媒合建議資源</h4>
                    <div className="space-y-2">
                      {aiPlan.resourceSuggestions.map((res, i) => (
                        <div key={i} className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs font-bold text-indigo-700 flex items-start gap-3">
                           <i className="fas fa-check-circle mt-0.5 opacity-40"></i> {res}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-slate-50 rounded-3xl text-slate-300">
                  <i className="fas fa-brain text-4xl mb-3 opacity-20"></i>
                  <p className="text-sm font-medium">請啟動 AI 分析以利後續計畫擬定</p>
                </div>
              )}
            </div>
          )}

          {activeStep === 2 && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-xl font-bold text-slate-800 border-b border-slate-50 pb-6">2. 衛教計畫生成</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'Wound', name: '傷口衛教', icon: 'fa-band-aid', canUpload: true },
                  { id: 'Nasogastric', name: '管路與抽痰', icon: 'fa-lungs', canUpload: true },
                  { id: 'Nutrition', name: '營養衛教', icon: 'fa-apple-whole' },
                  { id: 'Activity', name: '復健與活動', icon: 'fa-person-walking' }
                ].map(cat => (
                  <div key={cat.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 group hover:border-sky-300 transition">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-sky-600">
                          <i className={`fas ${cat.icon} text-lg`}></i>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{cat.name}</h4>
                      </div>
                      <button 
                        onClick={() => handleGenerateEdu(cat.id)}
                        className="text-[10px] font-black text-sky-600 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-sky-600 hover:text-white transition"
                      >
                        AI 自動撰寫
                      </button>
                    </div>
                    {eduContent[cat.id] ? (
                      <div className="bg-white p-4 rounded-xl border border-slate-100 text-[11px] leading-relaxed text-slate-600 max-h-32 overflow-y-auto italic">
                        {eduContent[cat.id]}
                      </div>
                    ) : (
                      <div className="h-20 flex items-center justify-center text-[10px] text-slate-300 border border-dashed border-slate-200 rounded-xl uppercase font-black">內容待生成</div>
                    )}
                    {cat.canUpload && (
                      <label className="mt-4 block cursor-pointer text-[10px] font-bold text-slate-400 hover:text-sky-600">
                        <i className="fas fa-video mr-2"></i> 
                        {eduVideos[cat.id] ? `影片已就緒: ${eduVideos[cat.id]}` : '上傳示範影片'}
                        <input type="file" className="hidden" onChange={(e) => handleVideoUpload(cat.id, e)} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                <h3 className="text-xl font-bold text-slate-800">3. 資源查找與匯入</h3>
                <button 
                  onClick={handleImportFile}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition flex items-center gap-2"
                >
                  <i className="fas fa-file-import"></i> 匯入第三方資源清單
                </button>
              </div>

              <div className="grid grid-cols-12 gap-8">
                {/* Search & Filter Library */}
                <div className="col-span-12 lg:col-span-7 space-y-4">
                  <div className="flex flex-col md:flex-row gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex-1 relative">
                      <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"></i>
                      <input 
                        type="text" 
                        placeholder="搜尋單位名稱、服務類別..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <select 
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden min-h-[400px]">
                    <p className="bg-slate-50 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">外部資源資料庫</p>
                    <div className="divide-y divide-slate-50 h-[360px] overflow-y-auto">
                      {filteredLibrary.map(libRes => (
                        <div key={libRes.id} className="p-4 hover:bg-slate-50/50 transition flex justify-between items-center group">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition">
                              <i className="fas fa-building-user text-sm"></i>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <h5 className="font-bold text-slate-800 text-sm">{libRes.name}</h5>
                                <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">{libRes.city}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-medium">{libRes.category} | {libRes.contactPerson}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => addResourceToPlan(libRes)}
                            className="text-[10px] font-black text-sky-600 bg-sky-50 hover:bg-sky-600 hover:text-white px-3 py-2 rounded-lg transition"
                          >
                            <i className="fas fa-plus mr-1"></i> 加入計畫
                          </button>
                        </div>
                      ))}
                      {filteredLibrary.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                           <i className="fas fa-magnifying-glass text-3xl mb-3 opacity-20"></i>
                           <p className="text-xs font-bold uppercase">查無符合條件之資源</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Patient's Current Resource Plan */}
                <div className="col-span-12 lg:col-span-5 space-y-4">
                  <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl min-h-[464px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-bold flex items-center gap-2">
                        <i className="fas fa-clipboard-list text-sky-400"></i> 本案媒合清單
                      </h4>
                      <span className="text-[10px] bg-sky-600 text-white px-2 py-0.5 rounded font-black">{matchedResources.length} 筆</span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] pr-2 scrollbar-hide">
                      {matchedResources.map(res => (
                        <div key={res.id} className="bg-white/5 border border-white/10 p-4 rounded-xl relative group">
                          <button 
                            onClick={() => removeResource(res.id)} 
                            className="absolute top-4 right-4 text-white/20 hover:text-red-400 transition"
                          >
                            <i className="fas fa-times-circle"></i>
                          </button>
                          <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest mb-1">{res.category}</p>
                          <h5 className="font-bold text-sm text-white mb-2">{res.name}</h5>
                          <div className="flex justify-between items-center text-[11px] text-white/60">
                            <span className="flex items-center gap-2"><i className="fas fa-user-circle"></i>{res.contactPerson}</span>
                            <span className="font-mono text-sky-400 font-bold">{res.phone}</span>
                          </div>
                        </div>
                      ))}
                      {matchedResources.length === 0 && (
                        <div className="h-40 flex flex-col items-center justify-center text-white/20 border-2 border-dashed border-white/5 rounded-2xl">
                          <i className="fas fa-plus-circle text-2xl mb-2"></i>
                          <p className="text-xs font-bold uppercase tracking-widest">點擊左側資源加入</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-6 mt-auto border-t border-white/5 space-y-3">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">手動新增資源</p>
                       <div className="grid grid-cols-2 gap-2">
                          <input 
                             placeholder="單位名稱"
                             value={newResource.name || ''}
                             onChange={(e) => setNewResource({...newResource, name: e.target.value})}
                             className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-sky-500"
                          />
                          <input 
                             placeholder="電話"
                             value={newResource.phone || ''}
                             onChange={(e) => setNewResource({...newResource, phone: e.target.value})}
                             className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-sky-500"
                          />
                       </div>
                       <button 
                         onClick={handleManualAdd}
                         className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black rounded-lg transition"
                       >
                         新增手動項目
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-h-[650px] overflow-y-auto">
              <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100 relative shadow-inner">
                <div className="absolute top-10 right-10 text-slate-200 text-7xl opacity-10">
                  <i className="fas fa-file-medical"></i>
                </div>
                
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">出院準備照護計畫書 (預覽)</h3>
                  <p className="text-sm text-slate-400 font-medium">個案姓名: {activePatient?.name} | 床號: {activePatient?.bed} | 日期: 2023-11-30</p>
                </div>

                <div className="space-y-10">
                  <section>
                    <h4 className="text-xs font-black text-sky-600 uppercase tracking-widest mb-4 border-b border-sky-100 pb-2">1. 照護問題摘要</h4>
                    <ul className="list-disc list-inside space-y-2 text-xs text-slate-600 font-medium">
                      {aiPlan?.careProblems.map((p, i) => <li key={i}>{p}</li>)}
                      {!aiPlan && <li className="italic text-slate-300">尚未生成分析內容</li>}
                    </ul>
                  </section>

                  <section>
                    <h4 className="text-xs font-black text-sky-600 uppercase tracking-widest mb-4 border-b border-sky-100 pb-2">2. 衛教重點指引</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(eduContent).map(([cat, text]) => (
                        <div key={cat} className="p-3 bg-white rounded-xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 mb-1 uppercase">{cat}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">{text}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs font-black text-sky-600 uppercase tracking-widest mb-4 border-b border-sky-100 pb-2">3. 媒合資源窗口</h4>
                    <div className="space-y-3">
                      {matchedResources.map(res => (
                        <div key={res.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
                          <div>
                            <p className="text-[9px] font-black text-slate-400">{res.category}</p>
                            <p className="text-xs font-bold text-slate-800">{res.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-sky-600">{res.phone}</p>
                            <p className="text-[9px] text-slate-400">{res.contactPerson}</p>
                          </div>
                        </div>
                      ))}
                      {matchedResources.length === 0 && <p className="text-xs italic text-slate-300">無媒合資源清單</p>}
                    </div>
                  </section>
                </div>
              </div>

              <div className="flex flex-col items-center py-6">
                {isPublished ? (
                  <div className="bg-green-500 text-white px-8 py-4 rounded-2xl flex items-center gap-3 animate-bounce shadow-xl">
                    <i className="fas fa-check-circle text-xl"></i>
                    <span className="font-bold">計畫已成功發布！</span>
                  </div>
                ) : (
                  <button 
                    onClick={handlePublish}
                    className="px-12 py-5 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-2xl hover:scale-105 active:scale-95 duration-200"
                  >
                    確認並發布至家屬 App 頁面
                  </button>
                )}
                <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest opacity-50">點擊發布後家屬端將會即時收到通知</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <button 
            onClick={() => setActiveStep(prev => Math.max(1, prev - 1) as any)}
            className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition ${activeStep === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-slate-800'}`}
            disabled={activeStep === 1}
          >
            <i className="fas fa-arrow-left mr-2"></i> 上一步驟
          </button>
          <div className="text-xs font-black text-slate-300">Step {activeStep} / 4</div>
          <button 
            onClick={() => setActiveStep(prev => Math.min(4, prev + 1) as any)}
            className={`px-8 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition ${activeStep === 4 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-800 hover:bg-slate-100'}`}
            disabled={activeStep === 4}
          >
            下一步驟 <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DischargePlanningHub;
