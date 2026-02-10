'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, X, RotateCcw } from 'lucide-react';

export interface MerchantSettings {
    refund_window_days: number;
    max_refund_rate: number;
    min_order_age_hours: number;
    require_photo_proof: boolean;
    auto_approve_threshold: number;
    auto_reject_threshold: number;
}

export const defaultSettings: MerchantSettings = {
    refund_window_days: 30,
    max_refund_rate: 0.10, // 10%
    min_order_age_hours: 24,
    require_photo_proof: true,
    auto_approve_threshold: 20,
    auto_reject_threshold: 80,
};

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: MerchantSettings) => void;
    currentSettings: MerchantSettings;
}

export function SettingsPanel({ isOpen, onClose, onSave, currentSettings }: SettingsPanelProps) {
    const [localSettings, setLocalSettings] = useState<MerchantSettings>(currentSettings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalSettings(currentSettings);
    }, [currentSettings, isOpen]);

    const handleChange = (key: keyof MerchantSettings, value: number | boolean) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
        setIsSaved(false);
    };

    const handleSave = () => {
        onSave(localSettings);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
        setTimeout(onClose, 500);
    };

    const handleReset = () => {
        setLocalSettings(defaultSettings);
        setIsSaved(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end transition-all">
            <div className="w-full max-w-md bg-slate-900 border-l border-slate-700 h-full p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <Settings className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Policy Settings</h2>
                            <p className="text-slate-400 text-sm">Configure AI decision rules</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Return Window */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300">
                            Return Window (Days)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="7"
                                max="90"
                                step="1"
                                value={localSettings.refund_window_days}
                                onChange={(e) => handleChange('refund_window_days', parseInt(e.target.value))}
                                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <span className="w-12 text-right font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                                {localSettings.refund_window_days}d
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">Refunds requested after this period will be flagged or rejected.</p>
                    </div>

                    <hr className="border-slate-800" />

                    {/* Photo Proof */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Require Photo Proof</label>
                            <p className="text-xs text-slate-500">
                                For {`"Damaged"`} or {`"Wrong Item"`} claims.
                            </p>
                        </div>
                        <button
                            onClick={() => handleChange('require_photo_proof', !localSettings.require_photo_proof)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.require_photo_proof ? 'bg-blue-600' : 'bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${localSettings.require_photo_proof ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <hr className="border-slate-800" />

                    {/* Auto-Approve Threshold */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300">
                            Auto-Approve Risk Score
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0"
                                max="50"
                                step="5"
                                value={localSettings.auto_approve_threshold}
                                onChange={(e) => handleChange('auto_approve_threshold', parseInt(e.target.value))}
                                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                            <span className="w-12 text-right font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded">
                                &lt;{localSettings.auto_approve_threshold}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">Analysis with score below {localSettings.auto_approve_threshold} will be recommended for Approval.</p>
                    </div>

                    {/* Auto-Reject Threshold */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300">
                            Auto-Reject Risk Score
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="50"
                                max="100"
                                step="5"
                                value={localSettings.auto_reject_threshold}
                                onChange={(e) => handleChange('auto_reject_threshold', parseInt(e.target.value))}
                                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                            <span className="w-12 text-right font-mono text-red-400 bg-red-500/10 px-2 py-1 rounded">
                                &gt;{localSettings.auto_reject_threshold}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">Analysis with score above {localSettings.auto_reject_threshold} will be recommended for Rejection.</p>
                    </div>

                    <hr className="border-slate-800" />

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={handleReset}
                            className="flex-1 py-3 px-4 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {isSaved ? 'Saved!' : 'Save Settings'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
