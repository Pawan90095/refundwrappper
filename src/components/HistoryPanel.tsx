'use client';

import React from 'react';
import { History, Trash2, ChevronRight, Calculator, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { RefundAnalysisInput, RefundAnalysisResult } from '@/lib/schemas/refund';

export interface HistoryItem {
    id: string;
    timestamp: string;
    input: RefundAnalysisInput;
    result: RefundAnalysisResult;
}

interface HistoryPanelProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    onClear: () => void;
}

export function HistoryPanel({ history, onSelect, onClear }: HistoryPanelProps) {
    if (history.length === 0) {
        return null;
    }

    return (
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 mt-8 overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                    <History className="w-5 h-5" />
                    <h3 className="font-semibold">Recent Analysis History</h3>
                </div>
                <button
                    onClick={onClear}
                    className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                    <Trash2 className="w-3 h-3" />
                    Clear History
                </button>
            </div>

            <div className="divide-y divide-slate-700/50 max-h-80 overflow-y-auto">
                {history.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${item.result.action === 'APPROVE' ? 'bg-green-500/10 text-green-400' : ''}
                ${item.result.action === 'REJECT' ? 'bg-red-500/10 text-red-400' : ''}
                ${item.result.action === 'FLAG' ? 'bg-amber-500/10 text-amber-400' : ''}
              `}>
                                {item.result.action === 'APPROVE' && <CheckCircle className="w-5 h-5" />}
                                {item.result.action === 'REJECT' && <XCircle className="w-5 h-5" />}
                                {item.result.action === 'FLAG' && <AlertTriangle className="w-5 h-5" />}
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-slate-200">{item.input.customerName || 'Customer'}</span>
                                    <span className="text-xs text-slate-500">•</span>
                                    <span className="text-xs text-slate-400">{item.input.orderNumber}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                    <span>${item.input.refundAmount.toFixed(2)}</span>
                                    <span className={`
                    ${item.result.risk_score > 70 ? 'text-red-400' : ''}
                    ${item.result.risk_score < 30 ? 'text-green-400' : ''}
                    ${item.result.risk_score >= 30 && item.result.risk_score <= 70 ? 'text-amber-400' : ''}
                  `}>
                                        Score: {item.result.risk_score}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    );
}
