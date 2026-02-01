import React, { useState, useEffect } from 'react';
import { type Patient } from '../../types/template';

interface DischargeTodoSidebarProps {
    activePatient: Patient | undefined;
}

export const DischargeTodoSidebar: React.FC<DischargeTodoSidebarProps> = ({ activePatient }) => {
    // Manual To-Do List State
    const [manualTodos, setManualTodos] = useState<{ id: string, text: string, date: string, time: string, location: string, relatedPerson: string, target: string, isCompleted: boolean }[]>([
        { id: '1', text: '跨團隊討論會議', date: '2023-12-01', time: '10:00', location: '護理站', relatedPerson: '01A-01 王大明', target: '團隊成員', isCompleted: false },
        { id: '2', text: '確認輔具是否已送達家中', date: '2023-12-01', time: '14:00', location: '案家', relatedPerson: '01A-01 王大明', target: '家屬', isCompleted: false }
    ]);
    const [newItem, setNewItem] = useState({ text: '', date: '', time: '', location: '', relatedPerson: '', target: '' });

    // Auto-fill relatedPerson when activePatient changes or initially
    useEffect(() => {
        if (activePatient) {
            setNewItem(prev => ({ ...prev, relatedPerson: `${activePatient.bed} ${activePatient.name}` }));
        }
    }, [activePatient]);

    const handleAddTodo = () => {
        if (!newItem.text.trim()) return;
        setManualTodos(prev => [...prev, {
            id: Date.now().toString(),
            text: newItem.text,
            date: newItem.date,
            time: newItem.time,
            location: newItem.location,
            relatedPerson: newItem.relatedPerson,
            target: newItem.target,
            isCompleted: false
        }]);
        // Reset but keep relatedPerson populated
        setNewItem({
            text: '', date: '', time: '', location: '', relatedPerson: activePatient ? `${activePatient.bed} ${activePatient.name}` : '', target: ''
        });
    };

    const handleToggleTodo = (id: string) => {
        setManualTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    };

    const handleDeleteTodo = (id: string) => {
        setManualTodos(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-6">
            <h4 className="text-lg font-bold flex items-center gap-2 text-slate-800 mb-4 border-b border-slate-100 pb-4">
                <i className="fas fa-clipboard-check text-sky-500"></i>
                待辦事項 (To-Do)
            </h4>

            <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 mb-6">
                <div className="space-y-2">
                    <input
                        type="text"
                        value={newItem.text}
                        onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
                        placeholder="事項內容..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newItem.relatedPerson}
                            onChange={(e) => setNewItem({ ...newItem, relatedPerson: e.target.value })}
                            placeholder="關係人..."
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                        />
                        <input
                            type="text"
                            value={newItem.target}
                            onChange={(e) => setNewItem({ ...newItem, target: e.target.value })}
                            placeholder="對象..."
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                        />
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={newItem.date}
                            onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                        />
                        <input
                            type="time"
                            value={newItem.time}
                            onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                        />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newItem.location}
                            onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                            placeholder="地點..."
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                        />
                        <button
                            onClick={handleAddTodo}
                            className="bg-sky-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-sky-700 transition"
                        >
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {manualTodos.map(todo => (
                    <div key={todo.id} className={`p-3 rounded-xl border transition-all ${todo.isCompleted ? 'bg-slate-50 border-transparent' : 'bg-white border-slate-100 hover:border-sky-200 hover:shadow-sm'}`}>
                        <div className="flex items-start gap-3">
                            <button
                                onClick={() => handleToggleTodo(todo.id)}
                                className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${todo.isCompleted ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-300 bg-white hover:border-sky-400'}`}
                            >
                                {todo.isCompleted && <i className="fas fa-check text-xs"></i>}
                            </button>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold mb-1 leading-tight ${todo.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                    {todo.text}
                                </p>

                                <div className="text-[10px] text-slate-400 space-y-1">
                                    <div className="flex flex-wrap gap-2">
                                        {todo.relatedPerson && (
                                            <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-1 rounded">
                                                <i className="fas fa-user-tag text-sky-400 w-3 text-center"></i>
                                                <span className="truncate">{todo.relatedPerson}</span>
                                            </div>
                                        )}
                                        {todo.target && (
                                            <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-1 rounded">
                                                <i className="fas fa-bullseye text-sky-400 w-3 text-center"></i>
                                                <span className="truncate">{todo.target}</span>
                                            </div>
                                        )}
                                    </div>

                                    {(todo.date || todo.time) && (
                                        <div className="flex items-center gap-1.5">
                                            <i className="fas fa-clock text-sky-400 w-3 text-center"></i>
                                            <span>{todo.date} {todo.time}</span>
                                        </div>
                                    )}
                                    {todo.location && (
                                        <div className="flex items-center gap-1.5">
                                            <i className="fas fa-map-marker-alt text-sky-400 w-3 text-center"></i>
                                            <span className="truncate">{todo.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteTodo(todo.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors self-start"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                ))}
                {manualTodos.length === 0 && (
                    <div className="text-center py-8 text-slate-300 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
                        尚無待辦事項
                    </div>
                )}
            </div>
        </div>
    );
};
