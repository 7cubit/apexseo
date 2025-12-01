"use client";

import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTheme } from 'next-themes';

interface GraphViewProps {
    initialNodes: Node[];
    initialEdges: Edge[];
}

export function GraphView({ initialNodes, initialEdges }: GraphViewProps) {
    const { theme } = useTheme();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const nodeColor = (node: Node) => {
        switch (node.data.clusterId) {
            case 'cluster_0': return '#ef4444';
            case 'cluster_1': return '#f97316';
            case 'cluster_2': return '#eab308';
            case 'cluster_3': return '#22c55e';
            case 'cluster_4': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    return (
        <div className="h-[600px] w-full border rounded-lg bg-background">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color={theme === 'dark' ? '#333' : '#ddd'} gap={16} />
                <Controls />
                <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
            </ReactFlow>
        </div>
    );
}
