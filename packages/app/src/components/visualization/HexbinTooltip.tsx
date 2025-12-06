import React from 'react';
import { ClusterData } from '../../lib/colorUtils';

interface HexbinTooltipProps {
    data: ClusterData | null;
    x: number;
    y: number;
    visible: boolean;
}

export const HexbinTooltip: React.FC<HexbinTooltipProps> = ({ data, x, y, visible }) => {
    if (!visible || !data) return null;

    return (
        <div
            className="absolute z-50 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 pointer-events-none transition-opacity duration-200"
            style={{
                left: x + 20,
                top: y - 20,
                opacity: visible ? 1 : 0,
                minWidth: '200px'
            }}
        >
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">
                {data.cluster_name}
            </h3>

            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                    <span>Volume:</span>
                    <span className="font-medium">{data.total_volume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Difficulty:</span>
                    <span className="font-medium">{data.avg_difficulty?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                <div className="flex justify-between">
                    <span>Your Coverage:</span>
                    <span className="font-medium text-purple-600">{data.your_coverage_percentage.toFixed(1)}%</span>
                </div>
                {data.gap_score !== undefined && (
                    <div className="flex justify-between">
                        <span>Gap Score:</span>
                        <span className={`font-medium ${getGapColorClass(data.gap_score)}`}>
                            {data.gap_score.toFixed(2)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

function getGapColorClass(score: number): string {
    if (score > 0.7) return 'text-red-500';
    if (score > 0.4) return 'text-yellow-500';
    return 'text-green-500';
}
