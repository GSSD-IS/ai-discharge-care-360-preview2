import { type Patient, CaseStatus, DischargeType, DepartmentRole } from "../types/template";
import { type Tenant, type User, UserRole } from "../types/saas";

// --- Mock Patients (Clinical Data) ---
export const initialPatients: Patient[] = [
    {
        id: "8821",
        name: "張曉明",
        age: 78,
        gender: "Male",
        department: "胸腔內科",
        bed: "702-1",
        admissionDate: "2023-11-05",
        expectedDischargeDate: "2023-11-28",
        cci: 4,
        adl: 65,
        riskScore: 85,
        status: CaseStatus.Screening,
        dischargeType: DischargeType.Home,
        primaryCaregiver: "張太太 (配偶)",
        primaryContact: "張大明 (子) 0912-345-678",
        preAdmissionResources: ["長照 2.0 (居家服務)", "輔具補助"],
        prepItems: [
            { label: "出院需求評估", status: "已完成", isCompleted: true },
            { label: "輔具申請", status: "審核中", isCompleted: false },
            { label: "家屬衛教", status: "待安排", isCompleted: false },
        ],
        assessments: [
            { role: DepartmentRole.Nurse, status: "評估中", lastNote: "氧氣使用依賴度評估中", updatedAt: "2023-11-25" },
            { role: DepartmentRole.SocialWorker, status: "已完成", lastNote: "已協助申請輔具補助", updatedAt: "2023-11-24" }
        ],
        matchedResources: [
            { id: 'r1', category: '輔具服務' as any, name: '永和輔具中心', contactPerson: '李專員', phone: '02-2929-1234', status: '待確認' as any, city: '新北市' }
        ],
        socialResources: {
            ltc: { active: true, level: 4 },
            homeNursing: { active: true, agency: '慈濟居家護理所' },
            respiratory: { status: 'None', stage: 0 },
            facility: { isResident: false, type: '' }
        },
        history: {
            diagnosis: ['COPD', 'Hypertension'],
            pastSurgeries: ['Appendectomy (2010)'],
            chronicConditions: ['Diabetes']
        }
    },
    {
        id: "8822",
        name: "林大同",
        age: 65,
        gender: "Male",
        department: "神經內科",
        bed: "705-2",
        admissionDate: "2023-10-15",
        expectedDischargeDate: "2023-12-05",
        cci: 6,
        adl: 30,
        riskScore: 92,
        status: CaseStatus.Preparing,
        dischargeType: DischargeType.CareHome,
        primaryCaregiver: "無 (獨居)",
        primaryContact: "林小美 (女) 0922-333-444",
        preAdmissionResources: [],
        prepItems: [
            { label: "機構媒合", status: "進行中", isCompleted: false },
            { label: "經濟評估", status: "已完成", isCompleted: true },
        ],
        assessments: [
            { role: DepartmentRole.SocialWorker, status: "評估中", lastNote: "養護機構空床洽詢中", updatedAt: "2023-11-26" }
        ],
        socialResources: {
            ltc: { active: true, level: 7 },
            homeNursing: { active: false, agency: '' },
            respiratory: { status: 'None', stage: 0 },
            facility: { isResident: true, type: '康寧養護中心' }
        }
    },
    {
        id: "8823",
        name: "王美利",
        age: 52,
        gender: "Female",
        department: "骨科",
        bed: "601-A",
        admissionDate: "2023-11-20",
        expectedDischargeDate: "2023-11-30",
        cci: 1,
        adl: 80,
        riskScore: 25,
        status: CaseStatus.Completed,
        dischargeType: DischargeType.Home,
        primaryCaregiver: "王先生 (子)",
        primaryContact: "王先生 0933-444-555",
        preAdmissionResources: [],
        prepItems: [
            { label: "傷口護理衛教", status: "已完成", isCompleted: true },
            { label: "拆線預約", status: "已完成", isCompleted: true },
        ],
        assessments: [
            { role: DepartmentRole.Nurse, status: "已完成", lastNote: "傷口癒合良好", updatedAt: "2023-11-28" }
        ]
    },
    {
        id: "8824",
        name: "陳阿土",
        age: 82,
        gender: "Male",
        department: "心臟內科",
        bed: "603-1",
        admissionDate: "2023-11-10",
        expectedDischargeDate: "2023-11-29",
        cci: 5,
        adl: 60,
        riskScore: 70,
        status: CaseStatus.Preparing,
        dischargeType: DischargeType.Home,
        primaryCaregiver: "陳太太",
        primaryContact: "0911-222-333",
        preAdmissionResources: ["居家醫療"],
        prepItems: [
            { label: "居家環境評估", status: "待安排", isCompleted: false }
        ],
        assessments: [
            { role: DepartmentRole.Physiotherapist, status: "評估中", lastNote: "建議居家復健", updatedAt: "2023-11-27" }
        ]
    }
];

// --- Mock SaaS Data (Tenants & Users) ---

export const mockTenants: Tenant[] = [
    {
        id: 't1', name: '臺大醫院', subdomain: 'ntuh', themeColor: '#1e40af', status: 'Active',
        plan: 'Enterprise', userCount: 450, renewalDate: '2026-12-31',
        config: { features: { ai: true, pac: true } }
    },
    {
        id: 't2', name: '長庚紀念醫院', subdomain: 'cgmh', themeColor: '#b91c1c', status: 'Active',
        plan: 'Enterprise', userCount: 380, renewalDate: '2026-11-20',
        config: { features: { ai: true, pac: true } }
    },
    {
        id: 't3', name: '康寧醫院 (試用)', subdomain: 'kangning', themeColor: '#059669', status: 'Trial',
        plan: 'Basic', userCount: 15, renewalDate: '2026-02-15',
        config: { features: { ai: false, pac: false } }
    },
    {
        id: 't4', name: '板橋中興醫院', subdomain: 'ban-ch', themeColor: '#d97706', status: 'Active',
        plan: 'Pro', userCount: 85, renewalDate: '2026-06-30'
    },
    {
        id: 't5', name: '永和耕莘醫院', subdomain: 'cth', themeColor: '#7c3aed', status: 'Active',
        plan: 'Pro', userCount: 120, renewalDate: '2026-08-15'
    },
    {
        id: 't6', name: '雙和醫院', subdomain: 'shh', themeColor: '#0891b2', status: 'Active',
        plan: 'Enterprise', userCount: 200, renewalDate: '2026-10-01'
    },
    {
        id: 't7', name: '馬偕紀念醫院', subdomain: 'mmh', themeColor: '#15803d', status: 'Active',
        plan: 'Enterprise', userCount: 320, renewalDate: '2027-01-01'
    },
    {
        id: 't8', name: '新光醫院', subdomain: 'skh', themeColor: '#be185d', status: 'Suspended',
        plan: 'Pro', userCount: 95, renewalDate: '2025-12-31'
    },
    {
        id: 't9', name: '國泰綜合醫院', subdomain: 'cgh', themeColor: '#0f766e', status: 'Active',
        plan: 'Enterprise', userCount: 280, renewalDate: '2026-09-15'
    },
    {
        id: 't10', name: '亞東紀念醫院', subdomain: 'femh', themeColor: '#ea580c', status: 'Active',
        plan: 'Enterprise', userCount: 310, renewalDate: '2026-07-20'
    },
    {
        id: 't11', name: '台北慈濟醫院', subdomain: 'tzuchi', themeColor: '#047857', status: 'Active',
        plan: 'Pro', userCount: 150, renewalDate: '2026-05-10'
    },
    {
        id: 't12', name: '耕莘安康院區', subdomain: 'cth-ak', themeColor: '#6d28d9', status: 'Trial',
        plan: 'Basic', userCount: 20, renewalDate: '2026-03-01'
    },
    {
        id: 't13', name: '恩主公醫院', subdomain: 'ech', themeColor: '#b45309', status: 'Active',
        plan: 'Pro', userCount: 110, renewalDate: '2026-04-15'
    },
    {
        id: 't14', name: '振興醫院', subdomain: 'chgh', themeColor: '#0369a1', status: 'Active',
        plan: 'Enterprise', userCount: 220, renewalDate: '2026-08-30'
    },
    {
        id: 't15', name: '萬芳醫院', subdomain: 'wf', themeColor: '#16a34a', status: 'Active',
        plan: 'Pro', userCount: 180, renewalDate: '2026-06-15'
    },
    {
        id: 't16', name: '北醫附醫', subdomain: 'tmu', themeColor: '#dc2626', status: 'Active',
        plan: 'Enterprise', userCount: 290, renewalDate: '2026-11-10'
    },
    {
        id: 't17', name: '聯合醫院中興院區', subdomain: 'tpe-ch', themeColor: '#4f46e5', status: 'Active',
        plan: 'Pro', userCount: 130, renewalDate: '2026-05-20'
    },
    {
        id: 't18', name: '聯合醫院仁愛院區', subdomain: 'tpe-ja', themeColor: '#ca8a04', status: 'Active',
        plan: 'Pro', userCount: 125, renewalDate: '2026-05-20'
    },
    {
        id: 't19', name: '聯合醫院和平院區', subdomain: 'tpe-hp', themeColor: '#0891b2', status: 'Suspended',
        plan: 'Basic', userCount: 80, renewalDate: '2025-11-30'
    },
    {
        id: 't20', name: '台大癌醫中心', subdomain: 'ntucc', themeColor: '#9f1239', status: 'Active',
        plan: 'Enterprise', userCount: 160, renewalDate: '2026-12-15'
    }
];

export const mockUsers: User[] = [
    {
        id: 'u1',
        email: 'admin@care360.com',
        name: 'Platform Admin',
        role: UserRole.SuperAdmin,
        tenantId: 'platform'
    },
    {
        id: 'u2',
        email: 'nurse@ntuh.com',
        name: '林護理師',
        role: UserRole.Nurse,
        tenantId: 't1'
    },
    {
        id: 'u3',
        email: 'admin@ntuh.com',
        name: '臺大管理者',
        role: UserRole.TenantAdmin,
        tenantId: 't1'
    },
    {
        id: 'u4',
        email: 'nurse@cgmh.com',
        name: '陳專員',
        role: UserRole.Nurse,
        tenantId: 't2'
    },
    {
        id: 'u5',
        email: 'dr@ntuh.com',
        name: '王醫師',
        role: UserRole.Doctor,
        tenantId: 't1'
    },
    {
        id: 'u6',
        email: 'cm@ltc.gov.tw',
        name: '張長照個管',
        role: UserRole.Nurse,
        tenantId: 't1'
    },
    {
        id: 'u7',
        email: 'hn@homecare.com',
        name: '李居家護理師',
        role: UserRole.Nurse,
        tenantId: 't1'
    }
];
