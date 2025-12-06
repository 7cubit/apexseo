import { GRADIENTS, GradientStop } from './constants/gradients';

// Type definitions
export interface ClusterData {
    your_coverage_percentage: number;
    competitor_coverage_percentage?: number;
    gap_score?: number;
    [key: string]: any;
}

/**
 * Converts Hex string to RGB object.
 * @param hex Hex string (e.g., "#FFFFFF" or "FFFFFF")
 * @returns Object {r, g, b}
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
}

/**
 * Converts RGB values to Hex string.
 * @param r Red (0-255)
 * @param g Green (0-255)
 * @param b Blue (0-255)
 * @returns Hex string (e.g., "#FFFFFF")
 */
export function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

/**
 * Linear interpolation between two colors in RGB space.
 * @param rgb1 Start color [r, g, b]
 * @param rgb2 End color [r, g, b]
 * @param t Interpolation factor (0.0 - 1.0)
 * @returns Interpolated Hex color
 */
export function lerpRgb(rgb1: [number, number, number], rgb2: [number, number, number], t: number): string {
    const r = rgb1[0] + (rgb2[0] - rgb1[0]) * t;
    const g = rgb1[1] + (rgb2[1] - rgb1[1]) * t;
    const b = rgb1[2] + (rgb2[2] - rgb1[2]) * t;
    return rgbToHex(r, g, b);
}

/**
 * Converts HSL values to Hex string.
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 * @returns Hex string
 */
export function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * Converts Hex string to HSL object.
 * @param hex Hex string
 * @returns Object {h, s, l}
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
    const { r, g, b } = hexToRgb(hex);
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
            case gNorm: h = (bNorm - rNorm) / d + 2; break;
            case bNorm: h = (rNorm - gNorm) / d + 4; break;
        }
        h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Interpolates between multiple color stops.
 * @param colorStops Array of hex colors
 * @param normalizedValue Value between 0.0 and 1.0
 * @param colorSpace 'rgb' (default) or 'hsl'
 * @returns Interpolated Hex color
 */
export function interpolateColor(
    colorStops: string[],
    normalizedValue: number,
    colorSpace: 'rgb' | 'hsl' = 'rgb'
): string {
    if (colorStops.length < 2) return colorStops[0] || '#000000';

    // Clamp value
    const t = Math.max(0, Math.min(1, normalizedValue));

    // Find which segment we are in
    const segmentLength = 1 / (colorStops.length - 1);
    const segmentIndex = Math.floor(t / segmentLength);

    // Handle edge case where t = 1.0
    if (segmentIndex >= colorStops.length - 1) return colorStops[colorStops.length - 1];

    const startColor = colorStops[segmentIndex];
    const endColor = colorStops[segmentIndex + 1];

    // Calculate local t within the segment
    const localT = (t - (segmentIndex * segmentLength)) / segmentLength;

    if (colorSpace === 'rgb') {
        const c1 = hexToRgb(startColor);
        const c2 = hexToRgb(endColor);
        return lerpRgb([c1.r, c1.g, c1.b], [c2.r, c2.g, c2.b], localT);
    } else {
        // Simple HSL interpolation
        const h1 = hexToHsl(startColor);
        const h2 = hexToHsl(endColor);

        // Shortest path for hue
        let dH = h2.h - h1.h;
        if (dH > 180) dH -= 360;
        if (dH < -180) dH += 360;

        const h = (h1.h + dH * localT + 360) % 360;
        const s = h1.s + (h2.s - h1.s) * localT;
        const l = h1.l + (h2.l - h1.l) * localT;

        return hslToHex(h, s, l);
    }
}

/**
 * Gets a color from a defined gradient based on a value.
 * @param value The value to map
 * @param min Minimum expected value
 * @param max Maximum expected value
 * @param gradient Array of gradient stops {color, stop}
 * @returns Hex color
 */
export function getColorFromGradient(
    value: number,
    min: number,
    max: number,
    gradient: GradientStop[]
): string {
    // Normalize value to 0-1
    const range = max - min;
    const t = range === 0 ? 0 : (value - min) / range;
    const clampedT = Math.max(0, Math.min(1, t));

    // Find the two stops surrounding the value
    // Sort gradient by stop just in case
    const sortedGradient = [...gradient].sort((a, b) => a.stop - b.stop);

    // If before first stop
    if (clampedT <= sortedGradient[0].stop) return sortedGradient[0].color;
    // If after last stop
    if (clampedT >= sortedGradient[sortedGradient.length - 1].stop) return sortedGradient[sortedGradient.length - 1].color;

    // Find segment
    for (let i = 0; i < sortedGradient.length - 1; i++) {
        const start = sortedGradient[i];
        const end = sortedGradient[i + 1];

        if (clampedT >= start.stop && clampedT <= end.stop) {
            // Calculate local interpolation factor
            const segmentRange = end.stop - start.stop;
            const localT = (clampedT - start.stop) / segmentRange;

            const c1 = hexToRgb(start.color);
            const c2 = hexToRgb(end.color);
            return lerpRgb([c1.r, c1.g, c1.b], [c2.r, c2.g, c2.b], localT);
        }
    }

    return sortedGradient[0].color; // Should not reach here
}

/**
 * High-level helper to get color based on visualization mode.
 * @param cluster Cluster data object
 * @param mode Visualization mode
 * @returns Hex color
 */
export function getColorByMode(
    cluster: ClusterData,
    mode: 'YOUR_COVERAGE' | 'COMPETITOR_COVERAGE' | 'GAP_SCORE'
): string {
    switch (mode) {
        case 'YOUR_COVERAGE':
            return getColorFromGradient(
                cluster.your_coverage_percentage,
                0,
                100,
                GRADIENTS.YOUR_COVERAGE
            );
        case 'COMPETITOR_COVERAGE':
            return getColorFromGradient(
                cluster.competitor_coverage_percentage || 0,
                0,
                100,
                GRADIENTS.COMPETITOR_COVERAGE
            );
        case 'GAP_SCORE':
            return getColorFromGradient(
                cluster.gap_score || 0,
                0,
                1.0,
                GRADIENTS.GAP_SCORE
            );
        default:
            return '#CCCCCC';
    }
}
