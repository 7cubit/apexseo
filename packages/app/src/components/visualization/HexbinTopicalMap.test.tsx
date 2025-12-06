import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HexbinTopicalMap, ClusterHexbinData } from './HexbinTopicalMap';

// Mock data
const mockClusters: ClusterHexbinData[] = [
    {
        cluster_id: 'c1',
        cluster_name: 'Cluster 1',
        semantic_distance_to_root: 0.5,
        radial_angle: 45,
        total_volume: 10000,
        your_coverage_percentage: 80,
        gap_score: 0.2,
        opportunity_level: 'OWNED',
        your_coverage_count: 10,
        your_avg_position: 5,
        your_total_traffic_estimate: 5000,
        competitor_authority_score: 50,
        competitor_coverage_count: 5,
        competitor_avg_position: 10,
        competitor_total_traffic_estimate: 2000
    },
    {
        cluster_id: 'c2',
        cluster_name: 'Cluster 2',
        semantic_distance_to_root: 0.8,
        radial_angle: 180,
        total_volume: 50000,
        your_coverage_percentage: 10,
        gap_score: 0.9,
        opportunity_level: 'HIGH',
        your_coverage_count: 1,
        your_avg_position: 50,
        your_total_traffic_estimate: 100,
        competitor_authority_score: 80,
        competitor_coverage_count: 20,
        competitor_avg_position: 3,
        competitor_total_traffic_estimate: 15000
    }
];

describe('HexbinTopicalMap', () => {
    it('renders without crashing', () => {
        render(
            <HexbinTopicalMap
                clustersData={mockClusters}
                onHexagonClick={() => { }}
            />
        );
        expect(screen.getByText('Cluster 1')).toBeInTheDocument();
        expect(screen.getByText('Cluster 2')).toBeInTheDocument();
    });

    it('handles loading state', () => {
        render(
            <HexbinTopicalMap
                clustersData={[]}
                onHexagonClick={() => { }}
                loading={true}
            />
        );
        // Check for spinner or loading container
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('handles error state', () => {
        render(
            <HexbinTopicalMap
                clustersData={[]}
                onHexagonClick={() => { }}
                error="Failed to load"
            />
        );
        expect(screen.getByText('Error loading map: Failed to load')).toBeInTheDocument();
    });

    it('triggers click handler', () => {
        const handleClick = vi.fn();
        render(
            <HexbinTopicalMap
                clustersData={mockClusters}
                onHexagonClick={handleClick}
            />
        );

        const hex1 = screen.getByLabelText('Cluster 1');
        fireEvent.click(hex1);
        expect(handleClick).toHaveBeenCalledWith('c1');
    });

    it('switches modes', () => {
        render(
            <HexbinTopicalMap
                clustersData={mockClusters}
                onHexagonClick={() => { }}
            />
        );

        const gapBtn = screen.getByText('Gap Opportunity');
        fireEvent.click(gapBtn);
        // We can't easily check internal state, but we can check if the button style changed
        // or if the hexagon colors updated (snapshot testing would be better here).
        expect(gapBtn).toHaveClass('bg-purple-600');
    });
});
