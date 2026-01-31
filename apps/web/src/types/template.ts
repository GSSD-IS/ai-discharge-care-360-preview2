export const CaseStatus = {
    Screening: '篩檢中',
    Preparing: '準備中',
    FollowUp: '追蹤中',
    Completed: '已結案'
} as const;

export type CaseStatus = typeof CaseStatus[keyof typeof CaseStatus];

export const DischargeType = {
    CareHome: '機構轉銜',
    Home: '返家照護',
    Transfer: '轉院轉銜'
} as const;

export type DischargeType = typeof DischargeType[keyof typeof DischargeType];

export const DepartmentRole = {
    Nurse: '護理',
    SocialWorker: '社工',
    Nutritionist: '營養',
    Physiotherapist: '復健',
    Pharmacist: '藥劑',
    Doctor: '醫師'
} as const;

export type DepartmentRole = typeof DepartmentRole[keyof typeof DepartmentRole];

export const ResourceCategory = {
    LongTermCare: '長照服務-照管中心',
    HomeNursing: '居家護理-居家護理所',
    HomeRespiratory: '居家呼吸4階-居家呼吸治療所',
    AssistiveTech: '輔具服務-輔具中心',
    Rehabilitation: '居家復健-復健診所',
    Other: '其他-聯絡人手動輸入'
} as const;

export type ResourceCategory = typeof ResourceCategory[keyof typeof ResourceCategory];

export interface MatchedResource {
    id: string;
    category: ResourceCategory;
    name: string;
    contactPerson: string;
    phone: string;
    status: '已聯繫' | '媒合成功' | '待確認';
    city?: string;
    note?: string;
}

export interface PrepItem {
    label: string;
    status: string;
    isCompleted: boolean;
    isHighRisk?: boolean; // Added based on potential usage
}

export interface DeptAssessment {
    role: DepartmentRole;
    status: '待評估' | '評估中' | '已完成';
    lastNote: string;
    updatedAt: string;
}

export interface CoordinationTask {
    id: string;
    patientId: string;
    patientName: string;
    bed: string;
    dept: DepartmentRole;
    title: string;
    priority: 'High' | 'Medium' | 'Low';
    deadline: string;
    status: 'Pending' | 'Ongoing' | 'Done';
}

export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female';
    department: string;
    bed: string;
    diagnosis?: string;
    riskScore: number;
    status: CaseStatus;
    admissionDate: string;
    expectedDischargeDate: string;
    cci: number;
    adl: number;
    dischargeType?: DischargeType;
    prepItems?: PrepItem[];
    assessments?: DeptAssessment[];
    preAdmissionResources?: string[];
    matchedResources?: MatchedResource[];
    primaryCaregiver?: string;
    primaryContact?: string;
    dischargePlacement?: DischargePlacement;
}

export interface FollowUpRecord {
    patientId: string;
    callDate: string;
    responder: string;
    recentVisit?: {
        type: 'ER' | 'OPD';
        date: string;
        details: string;
    };
    qa: { question: string; answer: string; details: string }[];
    summaryNote: string;
}

export interface ResourceItem {
    id: string;
    category: string;
    name: string;
    address: string;
    phone: string;
    tags: string[];
    type: 'Institution' | 'Home';
}

export interface EducationContent {
    id: string;
    category: 'Wound' | 'Nasogastric' | 'Nutrition' | 'Activity' | 'Other';
    title: string;
    text: string;
    videoUrl?: string;
    isAiGenerated: boolean;
}

// Team Communication
export interface TeamMember {
    id: string;
    name: string;
    role: string;
    dept: DepartmentRole | string;
    isOnline: boolean;
    avatar?: string;
    joinedAt?: string;
}

export interface Message {
    id: string;
    sender: string;
    role: string;
    dept: DepartmentRole;
    content: string;
    timestamp: string;
}

export interface EducationModule {
    id: string;
    title: string;
    description: string;
    progress: number;
    type: 'Video' | 'Document';
}

// --- Discharge Placement Types ---

export type CaregiverType = 'Family' | 'PrivateNurse' | 'ForeignCaregiver' | 'Other';
export type MedicalDevice = 'Suction' | 'OxygenGen' | 'Ventilator' | 'Oximeter' | 'Other';
export type GeneralDevice = 'Wheelchair' | 'Walker' | 'Crutches' | 'CommodeChair' | 'ShowerChair' | 'Other';
export type TransportType = 'Self' | 'AccessibleCar' | 'Ambulance';
export type TubeCareType = 'HomeNursing' | 'OPD';

export interface HomeCarePrep {
    caregiver: CaregiverType;
    medicalDevices: MedicalDevice[];
    generalDevices: GeneralDevice[];
    transport: TransportType;
    tubeCare: TubeCareType;
    otherDeviceNote?: string;
}

export interface FacilityPrep {
    type: 'NursingHome' | 'CareCenter';
    name: string;
    status: 'Searching' | 'Examining' | 'Waiting';
}

export interface TransferPrep {
    type: 'RCW' | 'PAC' | 'RehabWard' | 'HospiceWard' | 'GeneralHospital';
    name: string;
}

export type PlacementType =
    | 'Home'
    | 'RCW' // 呼吸照護 (Respiratory Care Ward - 4階) -> In text user said "轉介呼吸4階" which usually means RCW or Home Respiratory. Context implies external unit.
    | 'HomeHospice'
    | 'Facility'
    | 'Transfer';

export interface DischargePlacement {
    type: PlacementType;
    // 1-1. 返家
    homeCare?: HomeCarePrep;
    // 1-2. 轉介呼吸4階 (Unit Name)
    rcwUnitName?: string;
    // 1-3. 轉介居家安寧 (Unit Name)
    homeHospiceUnitName?: string;
    // 2-1. 機構
    facility?: FacilityPrep;
    // 2-2. 轉院
    transfer?: TransferPrep;
}
