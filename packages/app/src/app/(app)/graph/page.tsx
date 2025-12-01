"use client";

import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/graph/Sidebar";

// Custom node styles could be added here
const nodeTypes = {};

export default function GraphPage() {
    const searchParams = useSearchParams();
    const projectUrl = searchParams.get("project") || "example.com";
    const projectId = projectUrl.replace(/[^a-z0-9]/g, "-"); // Simple ID generation

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/graph`);
                const data = await res.json();

                // Enhance nodes with size based on TSPR
                const enhancedNodes = data.nodes.map((node: any) => {
                    const tspr = node.data.tspr || 0;
                    // Scale TSPR to size: sqrt(tspr * factor) + minSize
                    // Assuming TSPR is roughly 0-1 (or small probability), we scale it up.
                    // If TSPR is 0.01 -> sqrt(100) = 10 + 20 = 30px
                    // If TSPR is 0.1 -> sqrt(1000) = 31 + 20 = 51px
                    const size = Math.max(20, Math.sqrt(tspr * 10000) + 20);

                    return {
                        ...node,
                        style: {
                            width: size,
                            height: size,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #777',
                            fontSize: size < 40 ? '0px' : '10px', // Hide text on small nodes
                            textAlign: 'center',
                            backgroundColor: getClusterColor(node.data.cluster),
                            overflow: 'hidden',
                            color: '#fff',
                            textShadow: '0px 0px 2px #000'
                        },
                        title: `URL: ${node.data.url}\nTSPR: ${tspr.toFixed(4)}\nPR: ${(node.data.pr || 0).toFixed(4)}\nCluster: ${node.data.cluster}`
                    };
                });

                // Fetch recommendations
                const recRes = await fetch(`/api/projects/${projectId}/links`);
                const recData = await recRes.json();
                const recommendations = recData.suggestions || [];

                // Add recommendation edges
                const recEdges = recommendations.slice(0, 50).map((rec: any) => ({
                    id: `rec-${rec.from_page_id}-${rec.to_page_id}`,
                    source: rec.from_page_id, // Assuming page_id matches node id (which is url or page_id?)
                    // Wait, node IDs in graph are URLs. API returns page_ids.
                    // We need to map page_ids to URLs or ensure consistency.
                    // In PageRepository.getTsprResults, we return page_id and url.
                    // In Graph API, we return nodes with id=url.
                    // Let's assume page_id is URL for now or we need to look it up.
                    // Actually, let's update Graph API to return page_id as ID or map it here.
                    // For simplicity, let's assume page_id is the URL in this project context or we use the URL from the node data.
                    // But wait, the link suggestion API returns page_ids.
                    // Let's map them if possible.
                    target: rec.to_page_id,
                    label: 'Recommended',
                    type: 'default',
                    animated: true,
                    style: { stroke: '#4ade80', strokeDasharray: '5,5' },
                    data: { score: rec.score }
                }));

                // The node IDs are now page_id.
                // The recommendations use from_page_id and to_page_id.
                // So we can match directly.

                const validRecEdges = recEdges.filter((e: any) =>
                    data.nodes.some((n: any) => n.id === e.source) &&
                    data.nodes.some((n: any) => n.id === e.target)
                );

                setNodes(enhancedNodes);
                setEdges([...data.edges, ...validRecEdges]);
            } catch (error) {
                console.error("Failed to fetch graph data:", error);
            }
        };

        if (projectId) {
            fetchGraph();
        }
    }, [projectId, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    };

    const closeSidebar = () => {
        setSelectedNode(null);
    };

    return (
        <div className="h-screen w-full relative bg-[#0B0E14]">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background color="#333" gap={16} />
                <Controls />
                <Panel position="top-left" className="bg-[#151923]/90 p-4 rounded-lg shadow-xl border border-gray-800 text-white">
                    <h3 className="font-bold mb-2">Project: {projectUrl}</h3>
                    <div className="text-xs space-y-2">
                        <div className="font-semibold text-gray-400">Clusters</div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div> Cluster 0
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div> Cluster 1
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div> Cluster 2
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-700">
                            <div className="font-semibold text-gray-400">Node Size</div>
                            <div>Proportional to TSPR Authority</div>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>

            {selectedNode && (
                <Sidebar node={selectedNode} onClose={closeSidebar} />
            )}
        </div>
    );
}

function getClusterColor(id: number | undefined) {
    if (id === undefined) return '#ffffff';
    const colors = ["#3b82f6", "#22c55e", "#ef4444", "#eab308", "#a855f7", "#ec4899", "#6366f1"];
    return colors[id % colors.length];
}
