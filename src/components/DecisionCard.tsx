'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';

interface DecisionCardProps {
    action: 'APPROVE' | 'REJECT' | 'FLAG';
    confidence: number;
    fraudProbability: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendation: string;
}

export function DecisionCard({ action, confidence, fraudProbability, recommendation }: DecisionCardProps) {
    const getActionStyles = () => {
        switch (action) {
            case 'APPROVE':
                return {
                    bg: 'bg-gradient-to-br from-green-500/20 to-green-600/10',
                    border: 'border-green-500/50',
                    icon: <CheckCircle className="w-16 h-16 text-green-400" />,
                    title: 'APPROVED',
                    titleColor: 'text-green-400',
                };
            case 'REJECT':
                return {
                    bg: 'bg-gradient-to-br from-red-500/20 to-red-600/10',
                    border: 'border-red-500/50',
                    icon: <XCircle className="w-16 h-16 text-red-400" />,
                    title: 'REJECTED',
                    titleColor: 'text-red-400',
                };
            case 'FLAG':
                return {
                    bg: 'bg-gradient-to-br from-yellow-500/20 to-orange-600/10',
                    border: 'border-yellow-500/50',
                    icon: <AlertTriangle className="w-16 h-16 text-yellow-400" />,
                    title: 'FLAGGED FOR REVIEW',
                    titleColor: 'text-yellow-400',
                };
        }
    };

    const styles = getActionStyles();

    return (
        <div className={`rounded-2xl border-2 ${styles.border} ${styles.bg} p-6 backdrop-blur-sm`}>
            <div className="flex items-center gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                    {styles.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h2 className={`text-3xl font-bold ${styles.titleColor} mb-2`}>
                        {styles.title}
                    </h2>

                    <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300 text-sm">
                                Confidence: <strong className="text-white">{(confidence * 100).toFixed(0)}%</strong>
                            </span>
                        </div>

                        <div className={`px-2 py-0.5 rounded text-xs font-bold ${fraudProbability === 'LOW' ? 'bg-green-500/20 text-green-400' :
                                fraudProbability === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                    fraudProbability === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                        'bg-red-500/20 text-red-400'
                            }`}>
                            {fraudProbability} FRAUD RISK
                        </div>
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed">
                        {recommendation}
                    </p>
                </div>
            </div>
        </div>
    );
}
