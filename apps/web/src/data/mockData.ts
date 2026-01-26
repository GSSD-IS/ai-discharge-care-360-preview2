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
        ]
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
        ]
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
        id: 't1',
        name: '臺大醫院',
        subdomain: 'ntuh',
        themeColor: '#1e40af', // blue-800
        status: 'Active'
    },
    {
        id: 't2',
        name: '長庚紀念醫院',
        subdomain: 'cgmh',
        themeColor: '#b91c1c', // red-700
        status: 'Active'
    },
    {
        id: 't3',
        name: '康寧醫院 (試用)',
        subdomain: 'kangning',
        themeColor: '#059669', // emerald-600
        status: 'Trial'
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
    }
];
