import { useCallback, useState, useEffect } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    type Edge,
    type Node,
    BackgroundVariant,
    useReactFlow,
    ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './CustomNodes';
import { apiRequest } from '../../services/api';
import { NodeType, type WorkflowDefinition } from '../../types/workflow.types';

/**
 * Workflow API Response
 */
interface WorkflowResponse {
    id: string;
    name: string;
    description?: string;
    definition: WorkflowDefinition;
    isPublished: boolean;
}

/**
 * 初始節點 (預設流程範本)
 */
const initialNodes: Node[] = [
    {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: '入院' },
    },
    {
        id: 'screening',
        type: 'stage',
        position: { x: 250, y: 100 },
        data: { label: '風險篩檢', description: 'AI 自動計算再入院風險', isMandatory: true },
    },
    {
        id: 'assessment',
        type: 'stage',
        position: { x: 250, y: 200 },
        data: { label: '跨團隊評估', description: '護理/社工/營養評估', isMandatory: true },
    },
    {
        id: 'planning',
        type: 'stage',
        position: { x: 250, y: 300 },
        data: { label: '出院計畫', description: '擬定安置方案', isMandatory: true },
    },
    {
        id: 'education',
        type: 'stage',
        position: { x: 250, y: 400 },
        data: { label: '衛教', description: '發送衛教資料給病患', isMandatory: false },
    },
    {
        id: 'end',
        type: 'end',
        position: { x: 250, y: 500 },
        data: { label: '出院' },
    },
];

/**
 * 初始邊線
 */
const initialEdges: Edge[] = [
    { id: 'e-start-screening', source: 'start', target: 'screening' },
    { id: 'e-screening-assessment', source: 'screening', target: 'assessment' },
    { id: 'e-assessment-planning', source: 'assessment', target: 'planning' },
    { id: 'e-planning-education', source: 'planning', target: 'education' },
    { id: 'e-education-end', source: 'education', target: 'end' },
];

/**
 * 流程編輯器元件
 */
/**
 * 流程編輯器內部元件
 */
function WorkflowEditorContent({ workflowId }: { workflowId?: string }) {
    const [nodes, setNodes, onNodesChange] = useNodesState(workflowId ? [] : initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(workflowId ? [] : initialEdges);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [workflowName, setWorkflowName] = useState('出院準備流程');
    const [currentWorkflowId, setCurrentWorkflowId] = useState<string | undefined>(workflowId);

    // New state for form list
    const [availableForms, setAvailableForms] = useState<{ id: string; name: string }[]>([]);

    const { screenToFlowPosition } = useReactFlow();

    // 載入表單列表
    useEffect(() => {
        const fetchForms = async () => {
            try {
                const forms = await apiRequest<{ id: string; name: string }[]>('/forms');
                setAvailableForms(forms);
            } catch (error) {
                console.error('無法載入表單列表', error);
            }
        };
        fetchForms();
    }, []);

    // 載入既有流程
    useEffect(() => {
        if (workflowId) {
            loadWorkflow(workflowId);
        }
    }, [workflowId]);

    const loadWorkflow = async (id: string) => {
        try {
            const workflow = await apiRequest<WorkflowResponse>(`/workflows/${id}`);
            setWorkflowName(workflow.name);
            setCurrentWorkflowId(workflow.id);

            // 轉換為 React Flow 格式
            const loadedNodes: Node[] = workflow.definition.nodes.map((n) => ({
                id: n.id,
                type: n.type.toLowerCase(),
                position: n.position,
                data: {
                    label: n.label,
                    description: n.description,
                    isMandatory: n.isMandatory || false,
                    formId: n.formId,
                },
            }));

            const loadedEdges: Edge[] = workflow.definition.edges.map((e) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                label: e.label,
            }));

            setNodes(loadedNodes);
            setEdges(loadedEdges);
        } catch (error) {
            console.error('載入流程失敗:', error);
            alert(`載入流程失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
        }
    };

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    /**
     * 必經節點驗證
     */
    const validateMandatoryNodes = (): { isValid: boolean; issues: string[] } => {
        const issues: string[] = [];

        // 檢查是否有起始節點
        const startNodes = nodes.filter((n) => n.type === 'start');
        if (startNodes.length === 0) {
            issues.push('流程缺少起始節點');
        } else if (startNodes.length > 1) {
            issues.push('流程只能有一個起始節點');
        }

        // 檢查是否有結束節點
        const endNodes = nodes.filter((n) => n.type === 'end');
        if (endNodes.length === 0) {
            issues.push('流程缺少結束節點');
        }

        // 檢查必經節點是否有連接
        const mandatoryNodes = nodes.filter((n) => (n.data as any).isMandatory);
        for (const mNode of mandatoryNodes) {
            const hasIncoming = edges.some((e) => e.target === mNode.id);
            const hasOutgoing = edges.some((e) => e.source === mNode.id);
            if (!hasIncoming || !hasOutgoing) {
                issues.push(`必經節點 「${(mNode.data as any).label}」 缺少連接`);
            }
        }

        return { isValid: issues.length === 0, issues };
    };

    const handleSave = async () => {
        // 先驗證
        const validation = validateMandatoryNodes();
        if (!validation.isValid) {
            alert('流程驗證失敗:\n' + validation.issues.join('\n'));
            return;
        }

        const startNode = nodes.find((n) => n.type === 'start');
        const endNodes = nodes.filter((n) => n.type === 'end');

        const workflow = {
            name: workflowName,
            description: '由流程設計器產生的流程',
            definition: {
                version: 1,
                name: workflowName,
                nodes: nodes.map((n) => ({
                    id: n.id,
                    type: (n.type?.toUpperCase() as NodeType),
                    label: (n.data as any).label,
                    description: (n.data as any).description,
                    isMandatory: (n.data as any).isMandatory || false,
                    formId: (n.data as any).formId,
                    position: n.position,
                })),
                edges: edges.map((e) => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    label: e.label,
                })),
                startNodeId: startNode?.id || 'start',
                endNodeIds: endNodes.map((n) => n.id),
            },
        };

        try {
            const result = await apiRequest(currentWorkflowId ? `/workflows/${currentWorkflowId}` : '/workflows', {
                method: currentWorkflowId ? 'PUT' : 'POST',
                body: JSON.stringify(workflow),
            });
            console.log('儲存成功:', result);
            alert('流程已順利儲存至後端');
        } catch (error) {
            console.error('儲存失敗:', error);
            alert(`儲存失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
        }
    };

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const nodeType = event.dataTransfer.getData('nodeType');

            // check if the dropped element is valid
            if (typeof nodeType === 'undefined' || !nodeType) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: `node-${Date.now()}`,
                type: nodeType,
                position,
                data: { label: `新${nodeType === 'stage' ? '階段' : '節點'}` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    return (
        <div className="h-screen w-full flex flex-col bg-slate-100">
            {/* 工具列 */}
            <div className="bg-white shadow-md p-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-800">流程設計器</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                        儲存流程
                    </button>
                </div>
            </div>

            {/* 主要編輯區 */}
            <div className="flex-1 flex">
                {/* 節點面板 */}
                <div className="w-48 bg-white border-r border-slate-200 p-4">
                    <h3 className="font-bold text-slate-700 mb-3">節點類型</h3>
                    <div className="space-y-2">
                        <div
                            className="p-2 bg-green-100 border border-green-300 rounded cursor-move text-center text-sm"
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('nodeType', 'start')}
                        >
                            🟢 起始
                        </div>
                        <div
                            className="p-2 bg-sky-100 border border-sky-300 rounded cursor-move text-center text-sm"
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('nodeType', 'stage')}
                        >
                            📋 階段
                        </div>
                        <div
                            className="p-2 bg-amber-100 border border-amber-300 rounded cursor-move text-center text-sm"
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('nodeType', 'condition')}
                        >
                            ⚡ 條件
                        </div>
                        <div
                            className="p-2 bg-purple-100 border border-purple-300 rounded cursor-move text-center text-sm"
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('nodeType', 'action')}
                        >
                            🔔 動作
                        </div>
                        <div
                            className="p-2 bg-red-100 border border-red-300 rounded cursor-move text-center text-sm"
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('nodeType', 'end')}
                        >
                            🔴 結束
                        </div>
                    </div>
                </div>

                {/* React Flow 畫布 */}
                <div className="flex-1">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                    >
                        <Controls />
                        <MiniMap />
                        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                    </ReactFlow>
                </div>

                {/* 屬性面板 */}
                {selectedNode && (
                    <div className="w-64 bg-white border-l border-slate-200 p-4">
                        <h3 className="font-bold text-slate-700 mb-3">節點屬性</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-slate-600 mb-1">ID</label>
                                <input
                                    type="text"
                                    value={selectedNode.id}
                                    disabled
                                    className="w-full px-2 py-1 border rounded bg-slate-100 text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-600 mb-1">標籤</label>
                                <input
                                    type="text"
                                    value={(selectedNode.data as any)?.label || ''}
                                    onChange={(e) => {
                                        setNodes((nds) =>
                                            nds.map((n) =>
                                                n.id === selectedNode.id
                                                    ? { ...n, data: { ...n.data, label: e.target.value } }
                                                    : n,
                                            ),
                                        );
                                    }}
                                    className="w-full px-2 py-1 border rounded"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={(selectedNode.data as any)?.isMandatory || false}
                                        onChange={(e) => {
                                            setNodes((nds) =>
                                                nds.map((n) =>
                                                    n.id === selectedNode.id
                                                        ? { ...n, data: { ...n.data, isMandatory: e.target.checked } }
                                                        : n,
                                                ),
                                            );
                                        }}
                                    />
                                    必經節點
                                </label>
                            </div>

                            {/* 表單綁定選擇器 */}
                            {(selectedNode.type === 'stage') && (
                                <div>
                                    <label className="block text-sm text-slate-600 mb-1">綁定表單</label>
                                    <select
                                        value={(selectedNode.data as any)?.formId || ''}
                                        onChange={(e) => {
                                            setNodes((nds) =>
                                                nds.map((n) =>
                                                    n.id === selectedNode.id
                                                        ? { ...n, data: { ...n.data, formId: e.target.value || undefined } }
                                                        : n,
                                                ),
                                            );
                                        }}
                                        className="w-full px-2 py-1 border rounded bg-white"
                                    >
                                        <option value="">-- 無 --</option>
                                        {availableForms.map((form) => (
                                            <option key={form.id} value={form.id}>
                                                {form.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * 流程編輯器元件 (含 Provider)
 */
export function WorkflowEditor({ workflowId }: { workflowId?: string }) {
    return (
        <ReactFlowProvider>
            <WorkflowEditorContent workflowId={workflowId} />
        </ReactFlowProvider>
    );
}
