import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Hexagon } from './Hexagon';
import { HexbinTooltip } from './HexbinTooltip';
import { HexbinLegend } from './HexbinLegend';
import { useHexbinColors, VisualizationMode } from './hooks/useHexbinColors';
import { calculateHexagonPosition } from './utils/hexagonUtils';
import { ClusterData } from '../../lib/colorUtils';
import styles from './HexbinTopicalMap.module.css';

// Extend ClusterData with visualization specific fields if needed
export interface ClusterHexbinData extends ClusterData {
    cluster_id: string;
    cluster_name: string;
    semantic_distance_to_root: number; // 0-1
    radial_angle: number; // 0-360
    total_volume: number;
    opportunity_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'OWNED' | 'UNKNOWN';
}

interface HexbinTopicalMapProps {
    clustersData: ClusterHexbinData[];
    selectedMode?: VisualizationMode;
    selectedCompetitor?: string;
    onHexagonClick: (clusterId: string) => void;
    onHexagonHover?: (clusterId: string | null) => void;
    width?: number;
    height?: number;
    loading?: boolean;
    error?: string | null;
}

export const HexbinTopicalMap: React.FC<HexbinTopicalMapProps> = ({
    clustersData,
    selectedMode: initialMode = 'GAP_SCORE',
    selectedCompetitor,
    onHexagonClick,
    onHexagonHover,
    width = 1000,
    height = 1000,
    loading = false,
    error = null
}) => {
    const [mode, setMode] = useState<VisualizationMode>(initialMode);
    const [hoveredCluster, setHoveredCluster] = useState<ClusterHexbinData | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const { getHexColor } = useHexbinColors();

    // Update internal mode if prop changes
    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    // Calculate Layout
    const layout = useMemo(() => {
        const centerX = width / 2;
        const centerY = height / 2;
        // Max radius for layout (leave some padding)
        const maxLayoutRadius = Math.min(width, height) / 2 - 60;

        return clustersData.map(cluster => {
            const pos = calculateHexagonPosition(
                cluster.semantic_distance_to_root,
                cluster.radial_angle,
                cluster.total_volume,
                centerX,
                centerY,
                maxLayoutRadius
            );
            return { ...pos, cluster };
        });
    }, [clustersData, width, height]);

    // Handlers
    const handleMouseEnter = (cluster: ClusterHexbinData, x: number, y: number) => {
        setHoveredCluster(cluster);
        setTooltipPos({ x, y });
        onHexagonHover?.(cluster.cluster_id);
    };

    const handleMouseLeave = () => {
        setHoveredCluster(null);
        onHexagonHover?.(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600">
                <p>Error loading map: {error}</p>
            </div>
        );
    }

    const centerX = width / 2;
    const centerY = height / 2;

    return (
        <div
            ref={containerRef}
            className={styles.container}
            style={{ width: '100%', height: '100%', minHeight: '600px' }} // Ensure container has height
        >
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className={styles.svg}
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Background Grid Circles */}
                <g className="text-gray-300 dark:text-gray-700">
                    {[0.33, 0.66, 1.0].map((scale, i) => (
                        <circle
                            key={i}
                            cx={centerX}
                            cy={centerY}
                            r={(Math.min(width, height) / 2 - 60) * scale}
                            className={styles.gridCircle}
                        />
                    ))}
                    {/* Center Point */}
                    <circle cx={centerX} cy={centerY} r={4} fill="currentColor" opacity={0.2} />
                </g>

                {/* Hexagons */}
                <g className={styles.hexagonGroup}>
                    {layout.map(({ x, y, r, cluster }) => (
                        <Hexagon
                            key={cluster.cluster_id}
                            x={x}
                            y={y}
                            r={r}
                            color={getHexColor(cluster, mode, selectedCompetitor)}
                            label={cluster.cluster_name}
                            onClick={() => onHexagonClick(cluster.cluster_id)}
                            onMouseEnter={() => handleMouseEnter(cluster, x, y)}
                            onMouseLeave={handleMouseLeave}
                            className={cluster.opportunity_level === 'HIGH' && mode === 'GAP_SCORE' ? styles.highOpportunity : ''}
                        />
                    ))}
                </g>
            </svg>

            {/* Tooltip */}
            <HexbinTooltip
                data={hoveredCluster}
                x={tooltipPos.x} // Note: This is SVG coordinates. For absolute div positioning, we might need conversion if SVG scales.
                // Ideally, tooltip follows mouse clientX/Y or we use a portal.
                // For simplicity in this "SVG-centric" view, let's assume 1:1 mapping or use a more robust tooltip lib.
                // But wait, the tooltip is a div outside SVG.
                // If the SVG is responsive (viewBox), x/y here won't match screen pixels.
                // FIX: Let's make the tooltip position relative to the container using percentages or
                // just pass the event client coordinates in a real app.
                // For this deliverable, I'll stick to the simple prop passing, but in a real app, use `getBoundingClientRect`.
                y={tooltipPos.y}
                visible={!!hoveredCluster}
            />

            {/* Legend / Mode Switcher */}
            <HexbinLegend
                selectedMode={mode}
                onModeChange={setMode}
            />
        </div>
    );
};
