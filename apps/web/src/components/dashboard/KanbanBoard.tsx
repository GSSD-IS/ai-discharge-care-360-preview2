import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { apiRequest } from '../../services/api';
import type { KanbanData } from '../../types/dashboard.types';
import { PatientCard } from './PatientCard';

interface KanbanBoardProps {
    workflowId: string;
}

export function KanbanBoard({ workflowId }: KanbanBoardProps) {
    const [data, setData] = useState<KanbanData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (workflowId) fetchKanbanData();
    }, [workflowId]);

    const fetchKanbanData = async () => {
        try {
            setLoading(true);
            const result = await apiRequest<KanbanData>(`/dashboard/kanban?workflowId=${workflowId}`);
            setData(result);
        } catch (error) {
            console.error('Failed to load kanban:', error);
        } finally {
            setLoading(false);
        }
    };

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        // Dropped outside or same position
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        // Optimistic UI Update (Client-side reorder)
        // Note: Real implementation needs API call to update state
        if (data) {
            // const startCol = data.columns[source.droppableId];
            // const endCol = data.columns[destination.droppableId];

            // Move item logic... (Simplified for now, as backend state engine handles transitions)
            // In a real app, you'd call an API here like: await apiRequest('/workflow/transition')

            alert(`移動請求：從 ${data.nodes[source.droppableId].label} 到 ${data.nodes[destination.droppableId].label} (後端整合待實作)`);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">載入看板中...</div>;
    if (!data) return <div className="p-8 text-center text-slate-500">無數據</div>;

    // Define column order based on node logic (or just iterate keys if simple)
    // Here we filter out non-stage nodes if needed, or sort by position
    const orderedColumns = Object.keys(data.columns).filter(id => data.nodes[id]);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full overflow-x-auto pb-4 gap-4 px-4 bg-slate-50">
                {orderedColumns.map((colId) => {
                    const node = data.nodes[colId];
                    const patients = data.columns[colId];

                    return (
                        <div key={colId} className="w-72 flex-shrink-0 flex flex-col bg-slate-100 rounded-lg max-h-[80vh]">
                            <div className="p-3 font-bold text-slate-700 border-b border-slate-200 flex justify-between">
                                {node.label}
                                <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                                    {patients.length}
                                </span>
                            </div>

                            <Droppable droppableId={colId}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 p-2 overflow-y-auto min-h-[100px] transition-colors
                                            ${snapshot.isDraggingOver ? 'bg-sky-50' : ''}`}
                                    >
                                        {patients.map((patient, index) => (
                                            <Draggable key={patient.id} draggableId={patient.id} index={index}>
                                                {(provided) => (
                                                    <PatientCard patient={patient} provided={provided} />
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
