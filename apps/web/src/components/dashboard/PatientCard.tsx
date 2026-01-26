import type { KanbanPatient } from '../../types/dashboard.types';

interface PatientCardProps {
    patient: KanbanPatient;
    provided: any; // DraggableProvided from dnd
}

export function PatientCard({ patient, provided }: PatientCardProps) {
    const riskColor = {
        HIGH: 'bg-red-100 text-red-800 border-red-200',
        MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
        LOW: 'bg-green-100 text-green-800 border-green-200',
    };

    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 mb-2 hover:shadow-md transition-shadow relative"
        >
            {/* 必經警示標籤 */}
            {patient.hasAlert && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    ! {patient.alertMessage}
                </div>
            )}

            <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-slate-800">{patient.name}</div>
                <div className="text-xs text-slate-400">{patient.mrn}</div>
            </div>

            <div className="flex items-center gap-2 mb-2">
                {patient.riskLevel && (
                    <span className={`text-xs px-2 py-0.5 rounded border ${riskColor[patient.riskLevel]}`}>
                        {patient.riskLevel} ({patient.riskScore})
                    </span>
                )}
            </div>

            <div className="text-xs text-slate-400">
                入院: {new Date(patient.admissionDate).toLocaleDateString()}
            </div>
        </div>
    );
}
