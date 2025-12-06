import React from 'react';
import { VisualizationMode } from './hooks/useHexbinColors';
import { GRADIENTS } from '../../lib/constants/gradients';

interface HexbinLegendProps {
    selectedMode: VisualizationMode;
    onModeChange: (mode: VisualizationMode) => void;
}

export const HexbinLegend: React.FC<HexbinLegendProps> = ({ selectedMode, onModeChange }) => {
    const modes: { id: VisualizationMode; label: string }[] = [
        { id: 'YOUR_COVERAGE', label: 'Your Coverage' },
        { id: 'COMPETITOR_COVERAGE', label: 'Competitor Coverage' },
        { id: 'GAP_SCORE', label: 'Gap Opportunity' }
    ];

    const currentGradient = GRADIENTS[selectedMode];

    return (
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
            {/* Mode Selector */}
            <div className="flex space-x-2 mb-4">
                {modes.map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${selectedMode === mode.id
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>

            {/* Gradient Legend */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Low</span>
                    <span>High</span>
                </div>
                <div
                    className="h-3 w-full rounded-full shadow-inner"
                    style={{
                        background: `linear-gradient(to right, ${currentGradient.map(s => `${s.color} ${s.stop * 100}%`).join(', ')})`
                    }}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    {selectedMode === 'GAP_SCORE' ? (
                        <>
                            <span>Owned</span>
                            <span>Opportunity</span>
                        </>
                    ) : (
                        <>
                            <span>0%</span>
                            <span>100%</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
