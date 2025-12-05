import React, { useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTheme } from '@/components/theme-provider';

// Mock Data for the Graph
const initialNodes: Node[] = [
    { id: '1', position: { x: 250, y: 0 }, data: { label: 'Home (95)' }, style: { background: '#3B82F6', color: 'white', border: 'none', width: 100, borderRadius: '50%', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' } },
    { id: '2', position: { x: 100, y: 150 }, data: { label: 'Blog (80)' }, style: { background: '#10B981', color: 'white', border: 'none', width: 80, borderRadius: '50%', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
    { id: '3', position: { x: 400, y: 150 }, data: { label: 'Pricing (85)' }, style: { background: '#10B981', color: 'white', border: 'none', width: 80, borderRadius: '50%', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
    { id: '4', position: { x: 50, y: 300 }, data: { label: 'Post 1' }, style: { background: '#6B7280', color: 'white', border: 'none', width: 60, borderRadius: '50%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' } },
    { id: '5', position: { x: 150, y: 300 }, data: { label: 'Post 2' }, style: { background: '#6B7280', color: 'white', border: 'none', width: 60, borderRadius: '50%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' } },
    { id: '6', position: { x: 350, y: 300 }, data: { label: 'Orphan' }, style: { background: '#EF4444', color: 'white', border: 'none', width: 60, borderRadius: '50%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' } },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#94a3b8' } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#94a3b8' } },
    { id: 'e2-4', source: '2', target: '4', style: { stroke: '#94a3b8' } },
    { id: 'e2-5', source: '2', target: '5', style: { stroke: '#94a3b8' } },
    // Orphan node 6 has no connections
];

export const LinkGraph: React.FC = () => {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div className="h-[400px] w-full bg-gray-50 dark:bg-[#0F1219] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color={isDark ? '#374151' : '#cbd5e1'} gap={16} />
                <Controls className="bg-white dark:bg-[#1A1F2B] border-gray-200 dark:border-gray-800 fill-gray-500 dark:fill-gray-400" />
                <MiniMap
                    nodeStrokeColor={(n) => {
                        if (n.style?.background) return n.style.background as string;
                        return '#eee';
                    }}
                    nodeColor={(n) => {
                        if (n.style?.background) return n.style.background as string;
                        return '#fff';
                    }}
                    className="bg-white dark:bg-[#1A1F2B] border border-gray-200 dark:border-gray-800"
                    maskColor={isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(240, 240, 240, 0.7)'}
                />
            </ReactFlow>
        </div>
    );
};
