export interface GradientStop {
    color: string;
    stop: number;
}

export const GRADIENTS = {
    // White to Dark Purple (0-100%)
    YOUR_COVERAGE: [
        { color: '#FFFFFF', stop: 0 },
        { color: '#E9D5FF', stop: 0.3 }, // Light Purple
        { color: '#9333EA', stop: 0.7 }, // Purple-600
        { color: '#581C87', stop: 1.0 }  // Purple-900
    ] as GradientStop[],

    // Same as Your Coverage for now, maybe different hue later
    COMPETITOR_COVERAGE: [
        { color: '#FFFFFF', stop: 0 },
        { color: '#FECACA', stop: 0.3 }, // Red-200
        { color: '#DC2626', stop: 0.7 }, // Red-600
        { color: '#7F1D1D', stop: 1.0 }  // Red-900
    ] as GradientStop[],

    // Traffic Light: Green -> Yellow -> Red
    // Note: Gap Score 0 = Good (No Gap), 1 = Bad (Huge Gap)? 
    // Wait, the prompt says:
    // GAP_SCORE: green (0-0.4) → yellow (0.4-0.7) → red (0.7-1.0)
    // Usually "Gap Score" means "Opportunity". 
    // If Gap Score is "Opportunity", then High Score (1.0) = High Opportunity = Red (Urgent)?
    // Or High Score = Good Coverage?
    // Prompt says: "gap_score > 0.75 THEN 'HIGH' // Red: Big opportunity"
    // So 1.0 is Red (High Opportunity/Gap). 0.0 is Green (No Gap/Owned).
    GAP_SCORE: [
        { color: '#22C55E', stop: 0 },    // Green-500 (Low Gap/Owned)
        { color: '#EAB308', stop: 0.5 },  // Yellow-500 (Medium Gap)
        { color: '#EF4444', stop: 1.0 }   // Red-500 (High Gap)
    ] as GradientStop[]
};
