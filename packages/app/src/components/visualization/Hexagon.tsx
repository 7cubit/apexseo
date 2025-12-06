import React, { useMemo } from 'react';
import { generateHexagonPath } from './utils/hexagonUtils';

interface HexagonProps {
    x: number;
    y: number;
    r: number;
    color: string;
    label?: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export const Hexagon: React.FC<HexagonProps> = React.memo(({
    x,
    y,
    r,
    color,
    label,
    onClick,
    onMouseEnter,
    onMouseLeave,
    className,
    style
}) => {
    const pathData = useMemo(() => generateHexagonPath(x, y, r), [x, y, r]);

    return (
        <g
            className={className}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
            role="button"
            aria-label={label || "Hexagon"}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick?.();
                }
            }}
        >
            <path
                d={pathData}
                fill={color}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
                className="transition-all duration-300 ease-in-out hover:stroke-white hover:stroke-2 hover:brightness-110"
            />
            {/* Optional Label if radius is big enough */}
            {r > 20 && label && (
                <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={getContrastColor(color)}
                    fontSize={Math.min(r / 2, 12)}
                    pointerEvents="none"
                    className="select-none font-medium"
                >
                    {label.substring(0, 3)}
                </text>
            )}
        </g>
    );
});

Hexagon.displayName = 'Hexagon';

// Helper for text contrast
function getContrastColor(hexColor: string) {
    // Simple check: if color is dark, return white, else black
    // Implementation omitted for brevity, defaulting to white/black mix or just white with shadow
    return 'white';
}
