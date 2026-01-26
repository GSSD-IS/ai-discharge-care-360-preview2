import React, { useEffect, useState } from 'react';

interface VitalSign {
    id: number;
    patient: string;
    bed: string;
    hr: number;
    bpSys: number;
    bpDia: number;
    spo2: number;
    status: 'Stable' | 'Warning' | 'Critical';
}

const ClinicalMonitor: React.FC = () => {
    const [vitals, setVitals] = useState<VitalSign[]>([
        { id: 1, patient: '王大明', bed: 'A01-1', hr: 72, bpSys: 120, bpDia: 80, spo2: 98, status: 'Stable' },
        { id: 2, patient: '李小美', bed: 'A01-2', hr: 85, bpSys: 135, bpDia: 88, spo2: 96, status: 'Stable' },
        { id: 3, patient: '陳阿公', bed: 'A02-1', hr: 110, bpSys: 160, bpDia: 95, spo2: 88, status: 'Critical' }, // E1 Trigger
        { id: 4, patient: '張奶奶', bed: 'A02-2', hr: 65, bpSys: 110, bpDia: 70, spo2: 99, status: 'Stable' },
    ]);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setVitals(prev => prev.map(v => {
                if (v.status === 'Critical') return v; // Critical stays critical until handled

                // Random fluctuates
                const newHr = v.hr + Math.floor(Math.random() * 5) - 2;
                const newSpo2 = Math.min(100, v.spo2 + Math.floor(Math.random() * 3) - 1);

                return { ...v, hr: newHr, spo2: newSpo2 };
            }));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">臨床監測中心 (Clinical Monitor)</h1>
                    <p className="text-slate-500 text-sm">即時生命徵象與 E1 異常阻斷模擬</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    System Connected
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {vitals.map(v => (
                    <div key={v.id} className={`rounded-2xl p-6 border-b-4 shadow-sm transition-all duration-500 ${v.status === 'Critical' ? 'bg-red-50 border-red-500 animate-pulse' :
                            v.status === 'Warning' ? 'bg-amber-50 border-amber-400' :
                                'bg-white border-green-400'
                        }`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">{v.patient}</h3>
                                <div className="text-xs text-slate-500 font-mono">Bed: {v.bed}</div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${v.status === 'Critical' ? 'bg-red-500 text-white' :
                                    'bg-slate-100 text-slate-500'
                                }`}>{v.status}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-slate-400 uppercase font-bold">HR (bpm)</div>
                                <div className={`text-2xl font-mono font-black ${v.hr > 100 ? 'text-red-500' : 'text-slate-700'
                                    }`}>{v.hr}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 uppercase font-bold">SpO2 (%)</div>
                                <div className={`text-2xl font-mono font-black ${v.spo2 < 90 ? 'text-red-500' : 'text-slate-700'
                                    }`}>{v.spo2}</div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-xs text-slate-400 uppercase font-bold">BP (mmHg)</div>
                                <div className={`text-xl font-mono font-bold ${v.bpSys > 140 ? 'text-amber-500' : 'text-slate-700'
                                    }`}>{v.bpSys}/{v.bpDia}</div>
                            </div>
                        </div>

                        {v.status === 'Critical' && (
                            <div className="mt-4 pt-4 border-t border-red-100">
                                <div className="text-xs font-bold text-red-600 mb-2">
                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                    E1 Triggered: Vitals Unstable
                                </div>
                                <button className="w-full bg-red-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-red-700">
                                    緊急處置 & 中止出院
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClinicalMonitor;
