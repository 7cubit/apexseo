import {
    hexToRgb,
    rgbToHex,
    lerpRgb,
    hslToHex,
    hexToHsl,
    interpolateColor,
    getColorFromGradient,
    getColorByMode
} from '../lib/colorUtils';
import { GRADIENTS } from '../lib/constants/gradients';

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        process.exit(1);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

function assertColor(actual: string, expected: string, message: string) {
    if (actual.toUpperCase() !== expected.toUpperCase()) {
        console.error(`❌ FAILED: ${message}. Expected ${expected}, got ${actual}`);
        process.exit(1);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

console.log("=== Testing Color Utils ===\n");

// 1. Hex <-> RGB
const rgb = hexToRgb('#FFFFFF');
assert(rgb.r === 255 && rgb.g === 255 && rgb.b === 255, "hexToRgb('#FFFFFF')");
const hex = rgbToHex(255, 0, 0);
assertColor(hex, '#FF0000', "rgbToHex(255, 0, 0)");

// 2. Lerp RGB
const mid = lerpRgb([0, 0, 0], [255, 255, 255], 0.5);
assertColor(mid, '#808080', "lerpRgb black to white at 0.5");

// 3. Hex <-> HSL
const hsl = hexToHsl('#FF0000'); // Red
assert(hsl.h === 0 && hsl.s === 100 && hsl.l === 50, "hexToHsl('#FF0000')");
const hexFromHsl = hslToHex(0, 100, 50);
assertColor(hexFromHsl, '#FF0000', "hslToHex(0, 100, 50)");

// 4. Interpolate Color (Simple)
const interp = interpolateColor(['#000000', '#FFFFFF'], 0.5);
assertColor(interp, '#808080', "interpolateColor black->white at 0.5");

// 5. Get Color From Gradient (Custom)
const gradient = [
    { color: '#000000', stop: 0 },
    { color: '#FFFFFF', stop: 1 }
];
const gradColor = getColorFromGradient(0.5, 0, 1, gradient);
assertColor(gradColor, '#808080', "getColorFromGradient 0.5");

// 6. Get Color By Mode (Your Coverage)
// Gradient: White (0) -> Purple (1)
// At 0% coverage -> White
const c1 = getColorByMode({ your_coverage_percentage: 0 }, 'YOUR_COVERAGE');
assertColor(c1, '#FFFFFF', "YOUR_COVERAGE at 0%");

// At 100% coverage -> Dark Purple #581C87
const c2 = getColorByMode({ your_coverage_percentage: 100 }, 'YOUR_COVERAGE');
assertColor(c2, '#581C87', "YOUR_COVERAGE at 100%");

// 7. Get Color By Mode (Gap Score)
// Gradient: Green (0) -> Yellow (0.5) -> Red (1.0)
const g1 = getColorByMode({ gap_score: 0, your_coverage_percentage: 0 }, 'GAP_SCORE');
assertColor(g1, '#22C55E', "GAP_SCORE at 0 (Green)");

const g2 = getColorByMode({ gap_score: 0.5, your_coverage_percentage: 0 }, 'GAP_SCORE');
assertColor(g2, '#EAB308', "GAP_SCORE at 0.5 (Yellow)");

const g3 = getColorByMode({ gap_score: 1.0, your_coverage_percentage: 0 }, 'GAP_SCORE');
assertColor(g3, '#EF4444', "GAP_SCORE at 1.0 (Red)");

console.log("\n=== All Tests Passed ===");
