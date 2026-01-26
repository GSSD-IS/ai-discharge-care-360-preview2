import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NodeType } from '../../types/workflow.types';

/**
 * 自訂節點資料結構
 */
interface CustomNodeData {
    label: string;
    description?: string;
    isMandatory?: boolean;
    formId?: string;
    nodeType: NodeType;
}

/**
 * 起始節點元件
 */
export const StartNode = memo(({ data }: NodeProps) => {
    const nodeData = data as unknown as CustomNodeData;
    return (
        <div className="px-4 py-2 shadow-md rounded-full bg-green-500 text-white border-2 border-green-700">
            <div className="font-bold text-sm">{nodeData.label || '開始'}</div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-700" />
        </div>
    );
});
StartNode.displayName = 'StartNode';

/**
 * 階段節點元件 (主要任務節點)
 */
export const StageNode = memo(({ data }: NodeProps) => {
    const nodeData = data as unknown as CustomNodeData;
    return (
        <div className={`px-4 py-3 shadow-lg rounded-lg bg-white border-2 ${nodeData.isMandatory ? 'border-red-500' : 'border-sky-500'} min-w-[150px]`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-500" />

            <div className="flex items-center gap-2">
                {nodeData.isMandatory && (
                    <span className="text-red-500 font-bold">*</span>
                )}
                <div className="font-bold text-slate-800">{nodeData.label}</div>
            </div>

            {nodeData.description && (
                <div className="text-xs text-slate-500 mt-1">{nodeData.description}</div>
            )}

            {nodeData.formId && (
                <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    📝 已綁定表單
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-sky-500" />
        </div>
    );
});
StageNode.displayName = 'StageNode';

/**
 * 條件節點元件 (菱形)
 */
export const ConditionNode = memo(({ data }: NodeProps) => {
    const nodeData = data as unknown as CustomNodeData;
    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-500" />

            <div className="w-24 h-24 bg-amber-100 border-2 border-amber-500 shadow-md rotate-45 flex items-center justify-center">
                <div className="-rotate-45 text-center">
                    <div className="font-bold text-amber-800 text-sm">{nodeData.label || '條件'}</div>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} id="yes" className="w-3 h-3 bg-green-500" />
            <Handle type="source" position={Position.Right} id="no" className="w-3 h-3 bg-red-500" style={{ top: '50%' }} />
        </div>
    );
});
ConditionNode.displayName = 'ConditionNode';

/**
 * 動作節點元件 (圓角矩形)
 */
export const ActionNode = memo(({ data }: NodeProps) => {
    const nodeData = data as unknown as CustomNodeData;
    return (
        <div className="px-4 py-2 shadow-md rounded-xl bg-purple-100 border-2 border-purple-500">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-500" />

            <div className="font-bold text-purple-800">{nodeData.label}</div>
            {nodeData.description && (
                <div className="text-xs text-purple-600 mt-1">{nodeData.description}</div>
            )}

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500" />
        </div>
    );
});
ActionNode.displayName = 'ActionNode';

/**
 * 結束節點元件
 */
export const EndNode = memo(({ data }: NodeProps) => {
    const nodeData = data as unknown as CustomNodeData;
    return (
        <div className="px-4 py-2 shadow-md rounded-full bg-red-500 text-white border-2 border-red-700">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-red-700" />
            <div className="font-bold text-sm">{nodeData.label || '結束'}</div>
        </div>
    );
});
EndNode.displayName = 'EndNode';

/**
 * 節點類型對應元件
 */
export const nodeTypes = {
    start: StartNode,
    stage: StageNode,
    condition: ConditionNode,
    action: ActionNode,
    end: EndNode,
};
