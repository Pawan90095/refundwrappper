'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Shield, Loader2, Zap, AlertTriangle, User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { RiskGauge } from '@/components/RiskGauge';
import { DecisionCard } from '@/components/DecisionCard';
import { BreakdownPanel } from '@/components/BreakdownPanel';
import { RefundForm } from '@/components/RefundForm';
import { EmailGenerator } from '@/components/EmailGenerator';
import { HistoryPanel, HistoryItem } from '@/components/HistoryPanel';
import { SettingsPanel, MerchantSettings, defaultSettings } from '@/components/SettingsPanel';
import { RefundAnalysisInput, RefundAnalysisResult } from '@/lib/schemas/refund';
import { useSession, signOut } from "next-auth/react";

// Demo scenarios
const demoScenarios = {
    lowRisk: {
        name: '✅ Low Risk (Approve)',
        data: {
            refundAmount: 49.99,
            orderTotal: 49.99,
            refundReason: 'Item arrived damaged - the packaging was crushed and product has a crack',
            customerNote: 'I would like a refund please. Happy to send photos if needed. Thank you for your help!',
            orderDate: '2026-01-25',
            refundRequestDate: '2026-02-05',
            orderNumber: 'ORD-2026-001234',
            productNames: ['Ceramic Coffee Mug - Blue'],
            productCategories: ['Kitchen', 'Drinkware'],
            isDigitalProduct: false,
            customerEmail: 'sarah.johnson@example.com',
            customerName: 'Sarah Johnson',
            customerHistory: {
                total_orders: 12,
                total_refunds: 0,
                refund_rate: 0,
                avg_order_value: 65.00,
                account_age_days: 730,
                total_spent: 780.00,
                last_order_date: '2026-01-25',
                email_verified: true,
                phone_verified: true,
            },
            shippingAddress: { country: 'United States', city: 'Austin', zip: '78701' },
            billingAddress: { country: 'United States', city: 'Austin', zip: '78701' },
            isAddressMismatch: false,
            deliveryStatus: 'delivered' as const,
            deliveryDate: '2026-01-30',
            paymentMethod: 'credit_card' as const,
            isChargebackRisk: false,
            merchantPolicy: {
                refund_window_days: 30,
                max_refund_rate: 0.25,
                min_order_age_hours: 24,
                require_photo_proof: false,
                auto_approve_threshold: 25,
                auto_reject_threshold: 75,
            },
        },
    },

    mediumRisk: {
        name: '⚠️ Medium Risk (Flag)',
        data: {
            refundAmount: 189.99,
            orderTotal: 189.99,
            refundReason: 'Quality not as expected',
            customerNote: 'The product looks different from the pictures. Want full refund.',
            orderDate: '2026-01-10',
            refundRequestDate: '2026-02-07',
            orderNumber: 'ORD-2026-005678',
            productNames: ['Designer Handbag - Limited Edition'],
            productCategories: ['Fashion', 'Accessories'],
            isDigitalProduct: false,
            customerEmail: 'mike.chen@example.com',
            customerName: 'Mike Chen',
            customerHistory: {
                total_orders: 5,
                total_refunds: 2,
                refund_rate: 0.4,
                avg_order_value: 120.00,
                account_age_days: 90,
                total_spent: 600.00,
                email_verified: true,
                phone_verified: false,
            },
            shippingAddress: { country: 'United States', city: 'Los Angeles', zip: '90001' },
            billingAddress: { country: 'United States', city: 'San Diego', zip: '92101' },
            isAddressMismatch: true,
            deliveryStatus: 'delivered' as const,
            deliveryDate: '2026-01-15',
            paymentMethod: 'paypal' as const,
            isChargebackRisk: false,
            merchantPolicy: {
                refund_window_days: 30,
                max_refund_rate: 0.25,
                min_order_age_hours: 24,
                require_photo_proof: true,
                auto_approve_threshold: 25,
                auto_reject_threshold: 75,
            },
            previousRefundReasons: ['Did not like the color', 'Size was wrong'],
        },
    },

    highRisk: {
        name: '🚨 High Risk (Reject)',
        data: {
            refundAmount: 499.99,
            orderTotal: 499.99,
            refundReason: 'Changed my mind',
            customerNote: 'I want my money back NOW. If you dont refund I will dispute with my bank and leave bad reviews everywhere!',
            orderDate: '2026-02-08',
            refundRequestDate: '2026-02-09',
            orderNumber: 'ORD-2026-009999',
            productNames: ['Premium Wireless Headphones Pro'],
            productCategories: ['Electronics', 'Audio'],
            isDigitalProduct: false,
            customerEmail: 'newuser12345@tempmail.com',
            customerName: 'John Doe',
            customerHistory: {
                total_orders: 1,
                total_refunds: 0,
                refund_rate: 0,
                avg_order_value: 499.99,
                account_age_days: 2,
                total_spent: 499.99,
                email_verified: false,
                phone_verified: false,
            },
            shippingAddress: { country: 'United States', city: 'Miami', zip: '33101' },
            billingAddress: { country: 'Canada', city: 'Toronto', zip: 'M5V 1J9' },
            isAddressMismatch: true,
            deliveryStatus: 'in_transit' as const,
            paymentMethod: 'credit_card' as const,
            isChargebackRisk: true,
            merchantPolicy: {
                refund_window_days: 30,
                max_refund_rate: 0.25,
                min_order_age_hours: 48,
                require_photo_proof: false,
                auto_approve_threshold: 25,
                auto_reject_threshold: 75,
            },
            customerMessages: [
                { timestamp: '2026-02-09 10:00', message: 'I want a refund immediately!', sentiment: 'negative' as const },
                { timestamp: '2026-02-09 10:30', message: 'If I dont get refund I will chargeback and destroy your reputation', sentiment: 'threatening' as const },
            ],
        },
    },
};

export default function Home() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<RefundAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [inputData, setInputData] = useState<RefundAnalysisInput | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [settings, setSettings] = useState<MerchantSettings>(defaultSettings);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Load history & settings on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('refundAnalysisHistory');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Failed to parse history', e);
            }
        }

        const savedSettings = localStorage.getItem('merchantSettings');
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (e) {
                console.error('Failed to parse settings', e);
            }
        }
    }, []);

    // Save history
    const addToHistory = (input: RefundAnalysisInput, result: RefundAnalysisResult) => {
        const newItem: HistoryItem = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            input,
            result
        };

        const updatedHistory = [newItem, ...history].slice(0, 10); // Keep last 10
        setHistory(updatedHistory);
        localStorage.setItem('refundAnalysisHistory', JSON.stringify(updatedHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('refundAnalysisHistory');
    };

    // Save settings
    const saveSettings = (newSettings: MerchantSettings) => {
        setSettings(newSettings);
        localStorage.setItem('merchantSettings', JSON.stringify(newSettings));
    };

    const loadHistoryItem = (item: HistoryItem) => {
        setInputData(item.input);
        setResult(item.result);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const analyzeRefund = async (data: RefundAnalysisInput) => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        // Override with current settings
        const dataWithSettings = {
            ...data,
            merchantPolicy: settings
        };

        setInputData(dataWithSettings); // Store input (with settings) for display

        try {
            const response = await fetch('/api/analyze-refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataWithSettings),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Analysis failed');
            }

            setResult(responseData.data);
            addToHistory(dataWithSettings, responseData.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const loadDemo = (key: keyof typeof demoScenarios) => {
        analyzeRefund(demoScenarios[key].data);
    };

    return (
        <main className="min-h-screen p-8 bg-slate-950 text-slate-200 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 relative">
                    {/* User Controls */}
                    <div className="absolute right-0 top-0 flex items-center gap-3">
                        {session?.user?.image && (
                            <Image
                                src={session.user.image}
                                alt={session.user.name || "User"}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full border border-slate-700 hidden sm:block"
                            />
                        )}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                            title="Settings"
                        >
                            <SettingsIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => signOut()}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="inline-flex items-center gap-3 mb-4">
                        <Shield className="w-12 h-12 text-green-400" />
                        <h1 className="text-4xl font-bold text-white">RefundGuard AI</h1>
                    </div>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Intelligent fraud detection powered by Groq (Llama 3.3). Analyze refund requests in seconds with
                        AI-powered risk scoring and actionable recommendations.
                    </p>
                </div>

                {/* Settings Panel */}
                <SettingsPanel
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    onSave={saveSettings}
                    currentSettings={settings}
                />

                {/* Manual Input Form */}
                <RefundForm onAnalyze={analyzeRefund} isLoading={isLoading} />

                {/* Demo Scenario Buttons */}
                <div className="mb-8">
                    <h2 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Or Try a Demo Scenario
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {Object.entries(demoScenarios).map(([key, scenario]) => (
                            <button
                                key={key}
                                onClick={() => loadDemo(key as keyof typeof demoScenarios)}
                                disabled={isLoading}
                                className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="font-semibold text-white mb-1">{scenario.name}</div>
                                <div className="text-sm text-slate-400">
                                    ${scenario.data.refundAmount.toFixed(2)} • {scenario.data.customerHistory.total_orders} orders
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-slate-700 rounded-full"></div>
                            <div className="absolute inset-0 w-20 h-20 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="mt-6 text-slate-300 text-lg">Analyzing refund request...</p>
                        <p className="text-slate-500 text-sm mt-2">AI is evaluating 7 risk dimensions</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 mb-8">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                            <div>
                                <h3 className="text-red-400 font-semibold">Analysis Failed</h3>
                                <p className="text-slate-300 text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {result && !isLoading && inputData && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Top Row: Gauge + Decision */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 flex items-center justify-center">
                                <RiskGauge score={result.risk_score} size={250} />
                            </div>
                            <div className="flex flex-col justify-center">
                                <DecisionCard
                                    action={result.action}
                                    confidence={result.confidence}
                                    fraudProbability={result.fraud_probability}
                                    recommendation={result.reasoning.recommendation}
                                />
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
                            <div className="flex items-center gap-3 text-slate-300">
                                <User className="w-5 h-5 text-slate-400" />
                                <span className="font-medium">
                                    {inputData.customerName}
                                </span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-400">
                                    Order #{inputData.orderNumber}
                                </span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-400">
                                    Reason: {`"${inputData.refundReason}"`}
                                </span>
                            </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <BreakdownPanel
                            scoreBreakdown={result.score_breakdown}
                            redFlags={result.red_flags}
                            greenFlags={result.green_flags}
                            reasoning={result.reasoning}
                            suggestedAction={result.suggested_action_for_merchant}
                        />

                        {/* Email Response Generator */}
                        <EmailGenerator
                            result={result}
                            customerName={inputData?.customerName || 'Customer'}
                        />
                    </div>
                )}

                {/* History Panel */}
                <HistoryPanel
                    history={history}
                    onSelect={loadHistoryItem}
                    onClear={clearHistory}
                />

                {/* Footer */}
                <footer className="mt-16 text-center text-slate-500 text-sm">
                    <p>Powered by Groq (Llama 3.3) • Built for intelligent fraud detection</p>
                </footer>
            </div>
        </main>
    );
}
