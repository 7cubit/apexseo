/**
 * Generates the SVG path data for a regular hexagon.
 * @param cx Center X coordinate
 * @param cy Center Y coordinate
 * @param r Radius (distance from center to corner)
 * @returns SVG path string (d attribute)
 */
export function generateHexagonPath(cx: number, cy: number, r: number): string {
    const angles = [0, 60, 120, 180, 240, 300];
    const points = angles.map(angle => {
        const rad = (angle * Math.PI) / 180;
        // Pointy top orientation:
        // x = cx + r * cos(rad - 30deg)
        // y = cy + r * sin(rad - 30deg)

        // Flat top orientation (standard for hexbins usually, but let's stick to prompt or standard)
        // Prompt doesn't specify orientation, but "pointy top" is common for radial layouts.
        // Let's use standard trig:
        return [
            cx + r * Math.cos(rad),
            cy + r * Math.sin(rad)
        ];
    });

    return `M ${points[0][0]} ${points[0][1]} ` +
        points.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ') +
        ' Z';
}

export interface HexbinLayoutNode {
    x: number;
    y: number;
    r: number;
    clusterId: string;
}

/**
 * Calculates the position of a hexagon based on semantic distance and angle.
 * @param distance Semantic distance (0-1)
 * @param angleDegrees Radial angle in degrees (0-360)
 * @param volume Total search volume (for sizing)
 * @param centerX SVG center X
 * @param centerY SVG center Y
 * @param maxRadius Maximum layout radius (e.g. 300px)
 * @returns {x, y, r}
 */
export function calculateHexagonPosition(
    distance: number,
    angleDegrees: number,
    volume: number,
    centerX: number,
    centerY: number,
    maxRadius: number = 300
): { x: number; y: number; r: number } {
    // Convert angle to radians
    // Subtract 90 degrees (PI/2) to make 0 degrees start at 12 o'clock if desired, 
    // or keep standard math (0 = 3 o'clock). Let's use standard math.
    const rad = (angleDegrees * Math.PI) / 180;

    const x = centerX + (distance * maxRadius) * Math.cos(rad);
    const y = centerY + (distance * maxRadius) * Math.sin(rad);

    // Size calculation: Area ~ Volume
    // Area of hex = (3*sqrt(3)/2) * r^2
    // We want r ~ sqrt(Volume)
    // Scale factor needs tuning. 
    // Let's assume max volume 500,000 -> r = 40px
    // r = sqrt(500000) * k = 40 => 707 * k = 40 => k ~ 0.05
    // Let's use a log scale or sqrt scale as requested: "sqrt(total_volume / π) * 0.8"
    const r = Math.sqrt(Math.max(0, volume) / Math.PI) * 0.8;

    // Clamp radius to reasonable min/max
    const clampedR = Math.max(10, Math.min(r, 60));

    return { x, y, r: clampedR };
}
