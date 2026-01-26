import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, Line
} from 'recharts';

const deptData = [
    { name: '胸腔內科', count: 125, readmit: 12 },
    { name: '心臟內科', count: 98, readmit: 8 },
    { name: '一般外科', count: 86, readmit: 5 },
    { name: '神經內科', count: 74, readmit: 15 },
    { name: '骨科', count: 62, readmit: 4 },
];

const wardPlacementData = [
    { name: '7A 病房', 返家: 25, 長照: 8, 養護: 5, RCW: 10, PAC: 2, 居護: 3, 呼吸4階: 2 },
    { name: '7B 病房', 返家: 30, 長照: 5, 養護: 2, RCW: 0, PAC: 8, 居護: 4, 呼吸4階: 0 },
    { name: '6A 病房', 返家: 18, 長照: 12, 養護: 10, RCW: 2, PAC: 15, 居護: 1, 呼吸4階: 1 },
    { name: '6C 病房', 返家: 22, 長照: 4, 養護: 3, RCW: 0, PAC: 5, 居護: 6, 呼吸4階: 0 },
    { name: 'ICU', 返家: 2, 長照: 1, 養護: 1, RCW: 15, PAC: 0, 居護: 0, 呼吸4階: 8 },
];

// Expanded PAC data with total cases, ratios, and transition metrics
const pacDetailedData = [
    { name: '腦中風', total: 42, ratio: 40, transferred: 38, transitionRate: 90.5 },
    { name: '骨折', total: 32, ratio: 30, transferred: 30, transitionRate: 93.7 },
    { name: '衰弱高齡', total: 21, ratio: 20, transferred: 16, transitionRate: 76.2 },
    { name: '腦傷', total: 10, ratio: 10, transferred: 7, transitionRate: 70.0 },
];

const trendData = [
    { month: '7月', alos: 14.2, readmit: 6.2 },
    { month: '8月', alos: 13.5, readmit: 5.8 },
    { month: '9月', alos: 12.8, readmit: 5.4 },
    { month: '10月', alos: 12.1, readmit: 5.1 },
    { month: '11月', alos: 12.5, readmit: 5.2 },
];

const DataAnalytics: React.FC = () => {
    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <i className="fas fa-chart-mixed text-sky-600"></i> 出院準備數據中心
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">介接 HIS 系統即時統計回饋</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-sky-500 shadow-sm">
                        <option>最近 30 天</option>
                        <option>最近 3 個月</option>
                        <option>2023 年度</option>
                    </select>
                    <button className="bg-white border border-slate-200 rounded-xl p-2 text-slate-400 hover:text-sky-600 transition shadow-sm">
                        <i className="fas fa-download"></i>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">平均住院天數 (ALOS)</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-black text-slate-800">12.5</h3>
                        <span className="text-xs font-bold text-green-500 mb-1"><i className="fas fa-caret-down mr-1"></i>0.3d</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">目標值: 11.5d</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">30天再入院率</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-black text-slate-800">5.2%</h3>
                        <span className="text-xs font-bold text-green-500 mb-1"><i className="fas fa-caret-down mr-1"></i>0.2%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">全院平均: 5.8%</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">門診回診率</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-black text-slate-800">88.4%</h3>
                        <span className="text-xs font-bold text-sky-500 mb-1"><i className="fas fa-caret-up mr-1"></i>1.2%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">出院 14 天內回診</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">超長住院比率 (&gt;30d)</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-black text-slate-800">4.1%</h3>
                        <span className="text-xs font-bold text-red-500 mb-1"><i className="fas fa-caret-up mr-1"></i>0.5%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">全院目前共 12 案</p>
                </div>
            </div>

            <div className="grid grid-cols-1 space-y-6">
                {/* Ward-based Placement Distribution - STACKED BAR CHART */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">個案收案與安置分布 (依病房)</h3>
                            <p className="text-xs text-slate-400 mt-1 font-medium">包含長照、RCW、PAC 與呼吸 4 階等細項</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                            <i className="fas fa-bed"></i>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={wardPlacementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 13, fontWeight: 700, fill: '#64748b' }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }} />
                                <Bar dataKey="返家" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="長照" stackId="a" fill="#6366f1" />
                                <Bar dataKey="養護" stackId="a" fill="#8b5cf6" />
                                <Bar dataKey="RCW" stackId="a" fill="#ec4899" />
                                <Bar dataKey="PAC" stackId="a" fill="#f43f5e" />
                                <Bar dataKey="居護" stackId="a" fill="#f59e0b" />
                                <Bar dataKey="呼吸4階" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* PAC Detailed Statistics */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-hospital-user text-indigo-500"></i> 急性後期照護 (PAC) 疾病別效益分析
                            </h3>
                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded tracking-widest uppercase">DETAIL REPORT</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">疾病類別</th>
                                        <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">個案總數</th>
                                        <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">佔比</th>
                                        <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">轉銜人數</th>
                                        <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">轉銜率</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {pacDetailedData.map((item) => (
                                        <tr key={item.name} className="hover:bg-slate-50/50 transition">
                                            <td className="py-4 text-xs font-bold text-slate-700">{item.name}</td>
                                            <td className="py-4 text-xs font-black text-slate-500 text-center">{item.total}</td>
                                            <td className="py-4 text-xs font-black text-slate-500 text-center">{item.ratio}%</td>
                                            <td className="py-4 text-xs font-black text-sky-600 text-center">{item.transferred}</td>
                                            <td className="py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-black text-slate-800">{item.transitionRate}%</span>
                                                    <div className="w-16 bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${item.transitionRate >= 85 ? 'bg-green-500' : item.transitionRate >= 75 ? 'bg-sky-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${item.transitionRate}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-8 p-5 bg-sky-50 rounded-2xl border border-sky-100/50">
                            <div className="flex items-center gap-3 mb-2">
                                <i className="fas fa-lungs text-sky-600"></i>
                                <p className="text-xs text-sky-600 font-black uppercase tracking-widest">呼吸轉銜效能指標</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-2xl font-black text-slate-800">92%</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">呼吸 4 階成功轉銜率</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-slate-800">14</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">RCW 轉入總案數</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Department Stats with Readmit Contrast */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800">各科別收案規模與再入院對照</h3>
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <i className="fas fa-stethoscope"></i>
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deptData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} width={80} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="count" name="收案總數" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                                    <Bar dataKey="readmit" name="再入院數" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* ALOS & Readmit Trend */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800">經營指標趨勢分析 (ALOS vs 再入院)</h3>
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 text-sky-500"><i className="fas fa-circle text-[6px]"></i> 平均住院天數</span>
                        <span className="flex items-center gap-1.5 text-rose-500"><i className="fas fa-circle text-[6px]"></i> 再入院率</span>
                    </div>
                </div>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorAlos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area type="monotone" dataKey="alos" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorAlos)" strokeWidth={3} />
                            <Line type="monotone" dataKey="readmit" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DataAnalytics;
