'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ScoreBreakdown {
    window_compliance: number;
    sentiment: number;
    fraud_patterns: number;
    reason_validity: number;
    financial_risk: number;
    delivery_verification: number;
    evidence: number;
    adjustments: number;
}

interface BreakdownPanelProps {
    scoreBreakdown: ScoreBreakdown;
    redFlags: string[];
    greenFlags: string[];
    reasoning: {
        window_compliance: string;
        sentiment_analysis: string;
        fraud_indicators: string[];
        reason_validity: string;
        financial_assessment: string;
        delivery_status: string;
        evidence_provided: string;
        recommendation: string;
    };
    suggestedAction: {
        primary: string;
        alternative: string;
        talking_points: string[];
    };
}

const dimensionLabels: Record<keyof Omit<ScoreBreakdown, 'adjustments'>, { label: string; max: number }> = {
    window_compliance: { label: 'Refund Window', max: 15 },
    sentiment: { label: 'Customer Sentiment', max: 15 },
    fraud_patterns: { label: 'Fraud Patterns', max: 35 },
    reason_validity: { label: 'Reason Validity', max: 20 },
    financial_risk: { label: 'Financial Risk', max: 10 },
    delivery_verification: { label: 'Delivery Status', max: 10 },
    evidence: { label: 'Evidence Provided', max: 5 },
};

export function BreakdownPanel({
    scoreBreakdown,
    redFlags,
    greenFlags,
    reasoning,
    suggestedAction
}: BreakdownPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header - Always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            >
                <span className="text-lg font-semibold text-white">Detailed Analysis</span>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
            </button>

            {/* Expandable content */}
            {isExpanded && (
                <div className="px-6 pb-6 space-y-6">
                    {/* Score Breakdown Grid */}
                    <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Score Breakdown</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(dimensionLabels).map(([key, { label, max }]) => {
                                const score = scoreBreakdown[key as keyof typeof dimensionLabels];
                                const percentage = (score / max) * 100;
                                return (
                                    <div key={key} className="bg-slate-900/50 rounded-lg p-3">
                                        <div className="text-xs text-slate-400 mb-1">{label}</div>
                                        <div className="flex items-end gap-1">
                                            <span className="text-xl font-bold text-white">{score}</span>
                                            <span className="text-xs text-slate-500 mb-1">/{max}</span>
                                        </div>
                                        <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${percentage > 70 ? 'bg-red-500' :
                                                        percentage > 40 ? 'bg-yellow-500' :
                                                            'bg-green-500'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Adjustments */}
                            <div className="bg-slate-900/50 rounded-lg p-3">
                                <div className="text-xs text-slate-400 mb-1">Adjustments</div>
                                <div className={`text-xl font-bold ${scoreBreakdown.adjustments < 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {scoreBreakdown.adjustments > 0 ? '+' : ''}{scoreBreakdown.adjustments}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Red & Green Flags */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Red Flags */}
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <h3 className="flex items-center gap-2 text-red-400 font-medium mb-3">
                                <AlertTriangle className="w-4 h-4" />
                                Red Flags ({redFlags.length})
                            </h3>
                            <ul className="space-y-2">
                                {redFlags.map((flag, i) => (
                                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                        <span className="text-red-400 mt-1">•</span>
                                        {flag}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Green Flags */}
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                            <h3 className="flex items-center gap-2 text-green-400 font-medium mb-3">
                                <CheckCircle2 className="w-4 h-4" />
                                Green Flags ({greenFlags.length})
                            </h3>
                            <ul className="space-y-2">
                                {greenFlags.map((flag, i) => (
                                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                        <span className="text-green-400 mt-1">•</span>
                                        {flag}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Merchant Recommendations */}
                    <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                        <h3 className="text-white font-medium mb-3">Merchant Action</h3>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                                {suggestedAction.primary}
                            </span>
                            {suggestedAction.alternative && (
                                <span className="text-slate-400 text-sm">
                                    or {suggestedAction.alternative}
                                </span>
                            )}
                        </div>

                        {suggestedAction.talking_points.length > 0 && (
                            <div>
                                <div className="text-xs text-slate-500 mb-2">Suggested Response:</div>
                                {suggestedAction.talking_points.map((point, i) => (
                                    <p key={i} className="text-sm text-slate-300 italic mb-1">"{point}"</p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
