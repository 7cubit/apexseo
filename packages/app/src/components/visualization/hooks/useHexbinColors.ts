import { useCallback } from 'react';
import { getColorByMode, ClusterData } from '../../../lib/colorUtils';

export type VisualizationMode = 'YOUR_COVERAGE' | 'COMPETITOR_COVERAGE' | 'GAP_SCORE';

export function useHexbinColors() {
    const getHexColor = useCallback((
        cluster: ClusterData,
        mode: VisualizationMode,
        selectedCompetitor?: string
    ) => {
        // If mode is COMPETITOR_COVERAGE but we need a specific competitor,
        // we might need to look up that competitor's coverage in the cluster data.
        // Assuming cluster data has a 'competitors' array or similar if we were doing deep lookup,
        // but based on the prompt's ClusterHexbinData, we have `competitor_coverage_percentage`.
        // If the backend pre-calculates the "selected competitor" into that field, we are good.
        // Otherwise, we might need logic here. 
        // For now, we assume `cluster.competitor_coverage_percentage` reflects the *relevant* competitor.

        return getColorByMode(cluster, mode);
    }, []);

    return { getHexColor };
}
