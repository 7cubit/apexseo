'use client';

import React from 'react';

interface CircularProgressRingProps {
    score: number;
}

export function CircularProgressRing({ score }: CircularProgressRingProps) {
    const normalizedScore = Math.min(100, Math.max(0, score));
    const radius = 32;
    const stroke = 4;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

    // Smooth color transition: red -> orange -> green
    let strokeColor = '#EF4444'; // red-500
    if (score >= 50 && score < 75) strokeColor = '#F59E0B'; // amber-500
    if (score >= 75) strokeColor = '#10B981'; // green-500

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg className="transform -rotate-90" width="80" height="80">
                {/* Background Track */}
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={stroke}
                    className="text-border"
                />
                {/* Score Progress */}
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{score}</span>
                <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Score</span>
            </div>
        </div>
    );
}
