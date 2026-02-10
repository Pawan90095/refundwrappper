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
        <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 text-slate-900">
            <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 md:px-8">
                {/* Left rail */}
                <aside className="hidden h-[640px] w-16 flex-col justify-between rounded-3xl bg-white/80 p-4 shadow-lg shadow-slate-200/80 ring-1 ring-slate-100 md:flex">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div className="h-px w-8 bg-slate-200" />
                        <button className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-slate-50 shadow-sm">
                            <Zap className="h-4 w-4" />
                        </button>
                        <button className="flex h-9 w-9 items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-900">
                            <User className="h-4 w-4" />
                        </button>
                        <button className="flex h-9 w-9 items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-900">
                            <SettingsIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex h-9 w-9 items-center justify-center rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                        title="Sign out"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </aside>

                {/* Main content column */}
                <div className="flex-1 space-y-6">
                    {/* Top bar */}
                    <header className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                                Daily overview
                            </p>
                            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                                Hi there, ready to tame your refunds?
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {session?.user?.image && (
                                <Image
                                    src={session.user.image}
                                    alt={session.user.name || 'User'}
                                    width={40}
                                    height={40}
                                    className="hidden h-10 w-10 rounded-full border border-slate-200 object-cover shadow-sm sm:block"
                                />
                            )}
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 md:flex"
                            >
                                <SettingsIcon className="h-3.5 w-3.5" />
                                Policy settings
                            </button>
                        </div>
                    </header>

                    {/* Hero panel */}
                    <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
                        {/* Greeting + feature cards */}
                        <div className="space-y-5 rounded-3xl bg-white/90 p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100 md:p-8">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                                        Hi merchant, ready to reduce refund fraud?
                                    </h2>
                                    <p className="max-w-xl text-sm text-slate-500 md:text-base">
                                        Analyze refund requests in seconds, get clear risk scores, and send
                                        friendly, on-brand responses powered by AI.
                                    </p>
                                </div>
                                <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 md:inline-flex">
                                    Live • Groq Llama 3.3
                                </span>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="flex flex-col justify-between rounded-2xl bg-slate-900 text-slate-50 p-4 shadow-sm">
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                                            Fast start
                                        </p>
                                        <h3 className="text-sm font-semibold">
                                            Contribute cases, track risk, stay in control.
                                        </h3>
                                    </div>
                                    <p className="mt-3 text-xs text-slate-300">
                                        Paste a refund request or use a demo to see RefundGuard in action.
                                    </p>
                                </div>

                                <div className="flex flex-col justify-between rounded-2xl bg-sky-50 p-4 shadow-sm ring-1 ring-sky-100">
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600/80">
                                            Collaborate with AI
                                        </p>
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Get structured risk analysis &amp; decisions.
                                        </h3>
                                    </div>
                                    <p className="mt-3 text-xs text-sky-800/80">
                                        See why a refund looks safe, risky, or needs more info.
                                    </p>
                                </div>

                                <div className="flex flex-col justify-between rounded-2xl bg-amber-50 p-4 shadow-sm ring-1 ring-amber-100">
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700/90">
                                            Stay organized
                                        </p>
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Keep history &amp; send better emails.
                                        </h3>
                                    </div>
                                    <p className="mt-3 text-xs text-amber-800/80">
                                        Review the last 10 analyses and reuse proven responses.
                                    </p>
                                </div>
                            </div>

                            {/* Search-style input hint */}
                            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-500">
                                <span className="truncate">
                                    Example: &ldquo;Customer says package was never delivered but carrier shows
                                    delivered&rdquo;
                                </span>
                                <span className="hidden rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium text-slate-50 md:inline-flex">
                                    Paste case below to begin
                                </span>
                            </div>
                        </div>

                        {/* Assistant card */}
                        <div className="flex flex-col justify-between rounded-3xl bg-slate-900 text-slate-50 p-6 shadow-xl shadow-slate-900/40">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                                        RefundGuard assistant
                                    </p>
                                    <p className="mt-2 text-sm font-semibold">
                                        &ldquo;Hey! Need a second opinion on a tricky refund?&rdquo;
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 shadow-lg">
                                        <span className="text-2xl">🤖</span>
                                    </div>
                                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                                </div>
                            </div>
                            <div className="mt-6 space-y-3 text-xs text-slate-300">
                                <p>
                                    I&apos;ll score each refund 0–100, flag fraud patterns, and suggest an action that
                                    matches your policy.
                                </p>
                                <p>
                                    Start with a **real case**, or try a demo scenario. You can always tweak your policy
                                    in settings.
                                </p>
                            </div>
                            <div className="mt-6 flex flex-wrap gap-2">
                                <button
                                    onClick={() => loadDemo('lowRisk')}
                                    disabled={isLoading}
                                    className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900 hover:bg-white disabled:opacity-60"
                                >
                                    Low-risk demo
                                </button>
                                <button
                                    onClick={() => loadDemo('mediumRisk')}
                                    disabled={isLoading}
                                    className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-50 hover:bg-slate-700 disabled:opacity-60"
                                >
                                    Medium-risk demo
                                </button>
                                <button
                                    onClick={() => loadDemo('highRisk')}
                                    disabled={isLoading}
                                    className="rounded-full border border-slate-600 px-3 py-1 text-xs font-medium text-slate-50 hover:bg-slate-800/80 disabled:opacity-60"
                                >
                                    High-risk demo
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Analysis workspace */}
                    <section className="space-y-6 rounded-3xl bg-white/90 p-4 shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 md:p-6">
                        {/* Settings Panel (portal-style overlay) */}
                        <SettingsPanel
                            isOpen={isSettingsOpen}
                            onClose={() => setIsSettingsOpen(false)}
                            onSave={saveSettings}
                            currentSettings={settings}
                        />

                        {/* Manual Input Form */}
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                            <div>
                                <h3 className="mb-3 text-sm font-medium text-slate-700">
                                    1. Paste refund request details
                                </h3>
                                <RefundForm onAnalyze={analyzeRefund} isLoading={isLoading} />
                            </div>
                            <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                                <h3 className="text-sm font-medium text-slate-700">
                                    2. Or jump into a demo
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {Object.entries(demoScenarios).map(([key, scenario]) => (
                                        <button
                                            key={key}
                                            onClick={() => loadDemo(key as keyof typeof demoScenarios)}
                                            disabled={isLoading}
                                            className="flex flex-col rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:opacity-50"
                                        >
                                            <span className="mb-1 font-semibold">{scenario.name}</span>
                                            <span className="text-[11px] text-slate-500">
                                                ${scenario.data.refundAmount.toFixed(2)} •{' '}
                                                {scenario.data.customerHistory.total_orders} orders
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-10">
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-full border-4 border-slate-200" />
                                    <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                                </div>
                                <p className="mt-4 text-sm font-medium text-slate-700">Analyzing refund request…</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    AI is evaluating 7 risk dimensions against your current policy.
                                </p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                <AlertTriangle className="mt-0.5 h-4 w-4" />
                                <div>
                                    <p className="font-medium">Analysis failed</p>
                                    <p className="text-xs text-rose-700/90">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Results */}
                        {result && !isLoading && inputData && (
                            <div className="space-y-6">
                                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
                                    <div className="flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-6 text-slate-50">
                                        <RiskGauge score={result.risk_score} size={220} />
                                    </div>
                                    <div className="space-y-4">
                                        <DecisionCard
                                            action={result.action}
                                            confidence={result.confidence}
                                            fraudProbability={result.fraud_probability}
                                            recommendation={result.reasoning.recommendation}
                                        />
                                        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-slate-400" />
                                                <span className="font-medium text-slate-800">
                                                    {inputData.customerName}
                                                </span>
                                                <span className="text-slate-400">•</span>
                                                <span className="text-slate-500">
                                                    Order #{inputData.orderNumber}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-slate-600">
                                                Reason: {`"${inputData.refundReason}"`}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <BreakdownPanel
                                    scoreBreakdown={result.score_breakdown}
                                    redFlags={result.red_flags}
                                    greenFlags={result.green_flags}
                                    reasoning={result.reasoning}
                                    suggestedAction={result.suggested_action_for_merchant}
                                />

                                <EmailGenerator
                                    result={result}
                                    customerName={inputData?.customerName || 'Customer'}
                                />
                            </div>
                        )}

                        {/* History Panel */}
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <HistoryPanel
                                history={history}
                                onSelect={loadHistoryItem}
                                onClear={clearHistory}
                            />
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="pb-2 pt-2 text-xs text-slate-400">
                        <p>
                            Powered by Groq (Llama 3.3) • RefundGuard AI helps you approve good customers faster and
                            catch suspicious patterns earlier.
                        </p>
                    </footer>
                </div>
            </div>
        </main>
    );
}
