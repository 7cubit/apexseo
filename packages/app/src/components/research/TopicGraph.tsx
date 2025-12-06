'use client';

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    Handle,
    Position,
    NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TopicMap, TopicCluster } from '@/lib/TopicalMapService';
import { Sparkles, FileText, TrendingUp, AlertCircle, Zap } from 'lucide-react';

// --- Custom Nodes ---

// 1. The "Sun" / Seed Node (Pulsing Gradient)
const SeedNode = ({ data }: NodeProps) => {
    return (
        <div className="relative group z-50">
            <div className="absolute -inset-8 bg-purple-500/20 rounded-full blur-2xl animate-pulse group-hover:bg-purple-500/30 transition-all" />
            <div className="relative flex flex-col items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-gray-900 to-black border-4 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.4)] transition-transform hover:scale-105">
                <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-3 !h-3 !opacity-0" />
                <Sparkles className="w-8 h-8 text-purple-400 mb-2 animate-spin-slow" />
                <div className="text-center px-2">
                    <div className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-1">Core Topic</div>
                    <div className="font-bold text-white text-lg leading-tight drop-shadow-md">{data.label}</div>
                </div>
            </div>
        </div>
    );
};

// 2. The "Hexagon" Cluster Node (Surfer Style)
const HexagonNode = ({ data }: NodeProps) => {
    const isCovered = data.status === 'Fully Covered';
    // Surfer uses purple for covered, gray/outline for not covered
    const fillColor = isCovered ? '#8b5cf6' : '#1f2937';
    const strokeColor = isCovered ? '#a78bfa' : '#4b5563';

    return (
        <div className="relative w-[160px] h-[140px] flex items-center justify-center group transition-all duration-300 hover:scale-110 cursor-pointer">
            <Handle type="target" position={Position.Center} className="!bg-transparent !border-none" />

            {/* SVG Hexagon */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-xl" style={{ filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.5))' }}>
                <path
                    d="M50 0 L93.3 25 V75 L50 100 L6.7 75 V25 Z"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="2"
                    className="transition-colors duration-300 group-hover:stroke-white"
                />
            </svg>

            {/* Content */}
            <div className="relative z-10 text-center px-3 pointer-events-none">
                <div className="font-bold text-white text-xs line-clamp-2 mb-2 leading-tight drop-shadow-md">{data.label}</div>

                {/* Mini Metrics */}
                <div className="flex items-center justify-center gap-2">
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] text-gray-300 uppercase">KD</span>
                        <span className={`text-[10px] font-bold ${data.difficulty > 60 ? 'text-red-300' : 'text-green-300'}`}>{data.difficulty}</span>
                    </div>
                    <div className="w-px h-4 bg-white/20" />
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] text-gray-300 uppercase">Vol</span>
                        <span className="text-[10px] font-bold text-white">{data.volume >= 1000 ? (data.volume / 1000).toFixed(1) + 'k' : data.volume}</span>
                    </div>
                </div>
            </div>

            {/* "GAP" Badge (Surfer Style: "Not Covered") */}
            {data.status === 'Not Covered' && (
                <div className="absolute -top-3 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-red-400 z-20 animate-bounce-slow">
                    GAP
                </div>
            )}

            {/* Competitor Coverage Indicator (Mini Hexagons) */}
            <div className="absolute -bottom-2 flex gap-0.5 justify-center w-full">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < (data.competitorCoverage / 33) ? 'bg-orange-400' : 'bg-gray-700'}`} />
                ))}
            </div>

            <Handle type="source" position={Position.Center} className="!bg-transparent !border-none" />
        </div>
    );
};

const nodeTypes = {
    seed: SeedNode,
    cluster: HexagonNode,
};

interface TopicGraphProps {
    data: TopicMap | null;
    onNodeClick: (node: any) => void;
}

export function TopicGraph({ data, onNodeClick }: TopicGraphProps) {
    const { initialNodes, initialEdges } = useMemo(() => {
        if (!data) return { initialNodes: [], initialEdges: [] };

        const nodes: Node[] = [];
        const edges: Edge[] = [];
        const centerX = 0;
        const centerY = 0;

        // 1. Seed Node
        nodes.push({
            id: 'root',
            type: 'seed',
            data: { label: data.seedKeyword },
            position: { x: centerX, y: centerY },
        });

        // 2. Clusters (Radar Layout)
        // Sort clusters by semantic relevance (mocked by index here) or difficulty
        // We'll create 2 rings: Inner (High Relevance/Low Diff), Outer (Lower Relevance/High Diff)

        const innerRing = data.clusters.slice(0, Math.ceil(data.clusters.length / 3));
        const outerRing = data.clusters.slice(Math.ceil(data.clusters.length / 3));

        const placeRing = (items: TopicCluster[], radius: number, startAngle: number = 0) => {
            items.forEach((cluster, i) => {
                const angle = startAngle + (i / items.length) * 2 * Math.PI;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);

                nodes.push({
                    id: cluster.id,
                    type: 'cluster',
                    data: {
                        label: cluster.name,
                        volume: cluster.searchVolume,
                        difficulty: cluster.difficulty,
                        contentType: cluster.contentType,
                        status: cluster.status,
                        competitorCoverage: cluster.competitorCoverage || 0,
                        raw: cluster
                    },
                    position: { x: x - 80, y: y - 70 } // Center offset
                });

                edges.push({
                    id: `e-root-${cluster.id}`,
                    source: 'root',
                    target: cluster.id,
                    type: 'default',
                    style: { stroke: '#4b5563', strokeWidth: 1, opacity: 0.3 },
                });
            });
        };

        placeRing(innerRing, 350);
        placeRing(outerRing, 650, Math.PI / 4); // Offset angle for visual interest

        return { initialNodes: nodes, initialEdges: edges };
    }, [data]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    React.useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    return (
        <div className="w-full h-full min-h-[600px] bg-[#0B0E14] relative overflow-hidden">
            {/* Radar Rings (Background) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="absolute w-[700px] h-[700px] border border-purple-500/30 rounded-full" />
                <div className="absolute w-[1300px] h-[1300px] border border-purple-500/20 rounded-full border-dashed" />
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={(_, node) => onNodeClick(node)}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.2}
                maxZoom={2}
                defaultEdgeOptions={{ type: 'default', animated: false }}
                proOptions={{ hideAttribution: true }}
            >
                <Controls className="!bg-gray-800 !border-gray-700 !fill-gray-400" />
                <Background color="#333" gap={40} size={1} className="opacity-10" />
            </ReactFlow>
        </div>
    );
}
