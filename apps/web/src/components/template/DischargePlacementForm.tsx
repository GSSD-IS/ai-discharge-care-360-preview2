import React, { useState } from 'react';
import { type DischargePlacement, type PlacementType, type CaregiverType, type MedicalDevice, type GeneralDevice, type TransportType, type TubeCareType } from '../../types/template';

interface DischargePlacementFormProps {
    initialData?: DischargePlacement;
    onSave: (data: DischargePlacement) => void;
}

const DischargePlacementForm: React.FC<DischargePlacementFormProps> = ({ initialData, onSave }) => {
    const [placementType, setPlacementType] = useState<PlacementType>(initialData?.type || 'Home');

    // Home Care State
    const [caregiver, setCaregiver] = useState<CaregiverType>(initialData?.homeCare?.caregiver || 'Family');
    const [medicalDevices, setMedicalDevices] = useState<MedicalDevice[]>(initialData?.homeCare?.medicalDevices || []);
    const [generalDevices, setGeneralDevices] = useState<GeneralDevice[]>(initialData?.homeCare?.generalDevices || []);
    const [transport, setTransport] = useState<TransportType>(initialData?.homeCare?.transport || 'Self');
    const [tubeCare, setTubeCare] = useState<TubeCareType>(initialData?.homeCare?.tubeCare || 'OPD');
    const [otherDeviceNote, setOtherDeviceNote] = useState(initialData?.homeCare?.otherDeviceNote || '');

    // Other Types State
    const [rcwName, setRcwName] = useState(initialData?.rcwUnitName || '');
    const [hospiceName, setHospiceName] = useState(initialData?.homeHospiceUnitName || '');

    const [facilityType, setFacilityType] = useState<'NursingHome' | 'CareCenter'>(initialData?.facility?.type || 'NursingHome');
    const [facilityName, setFacilityName] = useState(initialData?.facility?.name || '');
    const [facilityStatus, setFacilityStatus] = useState<'Searching' | 'Examining' | 'Waiting'>(initialData?.facility?.status || 'Searching');

    const [transferType, setTransferType] = useState<'RCW' | 'PAC' | 'RehabWard' | 'HospiceWard' | 'GeneralHospital'>(initialData?.transfer?.type || 'GeneralHospital');
    const [transferName, setTransferName] = useState(initialData?.transfer?.name || '');

    const handleSave = () => {
        const data: DischargePlacement = {
            type: placementType,
            homeCare: placementType === 'Home' ? {
                caregiver,
                medicalDevices,
                generalDevices,
                transport,
                tubeCare,
                otherDeviceNote
            } : undefined,
            rcwUnitName: placementType === 'RCW' ? rcwName : undefined,
            homeHospiceUnitName: placementType === 'HomeHospice' ? hospiceName : undefined,
            facility: placementType === 'Facility' ? {
                type: facilityType,
                name: facilityName,
                status: facilityStatus
            } : undefined,
            transfer: placementType === 'Transfer' ? {
                type: transferType,
                name: transferName
            } : undefined
        };
        onSave(data);
    };

    const toggleDevice = <T extends string>(list: T[], setList: (l: T[]) => void, item: T) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. Select Placement Type */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">出院安置方向</label>
                <div className="flex gap-2 flex-wrap">
                    {[
                        { id: 'Home', label: '1-1 返家' },
                        { id: 'RCW', label: '1-2 呼吸4階' },
                        { id: 'HomeHospice', label: '1-3 居家安寧' },
                        { id: 'Facility', label: '2-1 機構' },
                        { id: 'Transfer', label: '2-2 轉院' }
                    ].map(type => (
                        <button
                            key={type.id}
                            onClick={() => setPlacementType(type.id as PlacementType)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold border ${placementType === type.id ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Dynamic Content Based on Type */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                {placementType === 'Home' && (
                    <div className="space-y-4">
                        {/* Caregiver */}
                        <div>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">a. 照顧人力</span>
                            <div className="flex gap-2">
                                {['Family', 'PrivateNurse', 'ForeignCaregiver', 'Other'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setCaregiver(c as CaregiverType)}
                                        className={`px-3 py-1.5 rounded text-xs font-bold border ${caregiver === c ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-white text-slate-500 border-slate-200'}`}
                                    >
                                        {{ Family: '家人', PrivateNurse: '自費看護', ForeignCaregiver: '外籍看護', Other: '其他' }[c]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Devices */}
                        <div>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">b. 輔具準備</span>
                            <div className="mb-2">
                                <span className="text-[10px] text-slate-400 font-bold mr-2">醫療輔具:</span>
                                {['Suction', 'OxygenGen', 'Ventilator', 'Oximeter', 'Other'].map(d => (
                                    <button key={d} onClick={() => toggleDevice(medicalDevices, setMedicalDevices, d as MedicalDevice)} className={`mr-1 px-2 py-1 rounded text-[10px] border ${medicalDevices.includes(d as MedicalDevice) ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'bg-white text-slate-400 border-slate-200'}`}>
                                        {{ Suction: '抽痰機', OxygenGen: '氧氣機', Ventilator: '呼吸器', Oximeter: '血氧機', Other: '其他' }[d]}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold mr-2">一般輔具:</span>
                                {['Wheelchair', 'Walker', 'Crutches', 'CommodeChair', 'ShowerChair', 'Other'].map(d => (
                                    <button key={d} onClick={() => toggleDevice(generalDevices, setGeneralDevices, d as GeneralDevice)} className={`mr-1 px-2 py-1 rounded text-[10px] border ${generalDevices.includes(d as GeneralDevice) ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'bg-white text-slate-400 border-slate-200'}`}>
                                        {{ Wheelchair: '輪椅', Walker: '助行器', Crutches: '拐杖', CommodeChair: '便盆椅', ShowerChair: '沐浴椅', Other: '其他' }[d]}
                                    </button>
                                ))}
                            </div>
                            {(medicalDevices.includes('Other') || generalDevices.includes('Other')) && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={otherDeviceNote}
                                        onChange={(e) => setOtherDeviceNote(e.target.value)}
                                        placeholder="請輸入其他輔具名稱..."
                                        className="w-full text-xs p-2 rounded border border-slate-200"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Transport */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">c. 出院交通</span>
                                <select value={transport} onChange={e => setTransport(e.target.value as TransportType)} className="w-full text-xs p-2 rounded border border-slate-200">
                                    <option value="Self">自行接送</option>
                                    <option value="AccessibleCar">無障礙交通車</option>
                                    <option value="Ambulance">救護車</option>
                                </select>
                            </div>
                            <div>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">d. 管路照護</span>
                                <select value={tubeCare} onChange={e => setTubeCare(e.target.value as TubeCareType)} className="w-full text-xs p-2 rounded border border-slate-200">
                                    <option value="HomeNursing">轉介居家護理</option>
                                    <option value="OPD">自行至門診更換</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {(placementType === 'RCW' || placementType === 'HomeHospice') && (
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">單位名稱</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-slate-200 rounded text-sm"
                            placeholder="請輸入轉介單位名稱..."
                            value={placementType === 'RCW' ? rcwName : hospiceName}
                            onChange={e => placementType === 'RCW' ? setRcwName(e.target.value) : setHospiceName(e.target.value)}
                        />
                    </div>
                )}

                {placementType === 'Facility' && (
                    <div className="space-y-3">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">機構類型</label>
                                <select value={facilityType} onChange={e => setFacilityType(e.target.value as any)} className="w-full text-sm p-2 border border-slate-200 rounded">
                                    <option value="NursingHome">護理之家</option>
                                    <option value="CareCenter">養護中心</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">準備進度</label>
                                <select value={facilityStatus} onChange={e => setFacilityStatus(e.target.value as any)} className="w-full text-sm p-2 border border-slate-200 rounded">
                                    <option value="Searching">尋找中</option>
                                    <option value="Examining">體檢中</option>
                                    <option value="Waiting">等待轉銜</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">單位名稱</label>
                            <input type="text" value={facilityName} onChange={e => setFacilityName(e.target.value)} className="w-full p-2 border border-slate-200 rounded text-sm" placeholder="輸入機構名稱" />
                        </div>
                    </div>
                )}

                {placementType === 'Transfer' && (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">轉院類型</label>
                            <select value={transferType} onChange={e => setTransferType(e.target.value as any)} className="w-full text-sm p-2 border border-slate-200 rounded">
                                <option value="RCW">呼吸照護病房</option>
                                <option value="PAC">PAC 急性後期</option>
                                <option value="RehabWard">復健病房</option>
                                <option value="HospiceWard">安寧病房</option>
                                <option value="GeneralHospital">一般轉院</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">醫院/單位名稱</label>
                            <input type="text" value={transferName} onChange={e => setTransferName(e.target.value)} className="w-full p-2 border border-slate-200 rounded text-sm" placeholder="輸入醫院名稱" />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-slate-800 transition">
                    <i className="fas fa-save mr-2"></i> 儲存設定
                </button>
            </div>
        </div>
    );
};

export default DischargePlacementForm;
