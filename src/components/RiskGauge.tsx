'use client';

import React from 'react';

interface RiskGaugeProps {
    score: number;
    size?: number;
}

export function RiskGauge({ score, size = 200 }: RiskGaugeProps) {
    // Calculate color based on score
    const getColor = (score: number) => {
        if (score <= 25) return { primary: '#22c55e', secondary: '#bbf7d0', label: 'LOW RISK' };
        if (score <= 50) return { primary: '#f59e0b', secondary: '#fef3c7', label: 'MEDIUM RISK' };
        if (score <= 75) return { primary: '#f97316', secondary: '#fed7aa', label: 'HIGH RISK' };
        return { primary: '#ef4444', secondary: '#fee2e2', label: 'CRITICAL' };
    };

    const colors = getColor(score);

    // SVG arc calculation
    const radius = 90;
    const circumference = Math.PI * radius; // Half circle
    const progress = (score / 100) * circumference;
    const dashOffset = circumference - progress;

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size * 0.6} viewBox="0 0 200 120" className="overflow-visible">
                {/* Background arc */}
                <path
                    d="M 10 110 A 90 90 0 0 1 190 110"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="12"
                    strokeLinecap="round"
                />

                {/* Progress arc */}
                <path
                    d="M 10 110 A 90 90 0 0 1 190 110"
                    fill="none"
                    stroke={colors.primary}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 8px ${colors.primary})` }}
                />

                {/* Score text */}
                <text
                    x="100"
                    y="85"
                    textAnchor="middle"
                    className="fill-white text-4xl font-bold"
                    style={{ fontSize: '48px' }}
                >
                    {score}
                </text>

                <text
                    x="100"
                    y="108"
                    textAnchor="middle"
                    className="fill-slate-400 text-sm font-medium"
                    style={{ fontSize: '12px' }}
                >
                    /100
                </text>
            </svg>

            {/* Risk label */}
            <div
                className="mt-2 px-4 py-1 rounded-full text-sm font-bold tracking-wider"
                style={{ backgroundColor: colors.secondary, color: colors.primary }}
            >
                {colors.label}
            </div>
        </div>
    );
}
