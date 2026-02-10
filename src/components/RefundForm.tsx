'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Shield } from 'lucide-react';
import { RefundAnalysisInput } from '@/lib/schemas/refund';

// Simplified schema
const FormSchema = z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    refundAmount: z.number().min(0.01, 'Amount > 0'),
    orderTotal: z.number().min(0.01, 'Total > 0'),
    reason: z.string().min(1, 'Reason required'),
    customerNote: z.string().optional(),
    customerSegment: z.enum(['New', 'Regular', 'VIP', 'High Risk']),
    items: z.string().min(1, 'Product required'),
    addressMismatch: z.boolean().default(false),
});

type FormData = z.infer<typeof FormSchema>;

interface RefundFormProps {
    onAnalyze: (data: RefundAnalysisInput) => Promise<void>;
    isLoading: boolean;
}

export function RefundForm({ onAnalyze, isLoading }: RefundFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            refundAmount: 0,
            orderTotal: 0,
            addressMismatch: false,
        }
    });

    const onSubmit = (data: FormData) => {
        // Map to full input
        const now = new Date();
        const orderDate = new Date();
        orderDate.setDate(now.getDate() - 14);

        const fullInput: RefundAnalysisInput = {
            refundAmount: data.refundAmount,
            orderTotal: data.orderTotal,
            refundReason: data.reason,
            customerNote: data.customerNote || '',
            orderDate: orderDate.toISOString(),
            refundRequestDate: now.toISOString(),
            orderNumber: data.orderId,
            productNames: [data.items],
            productCategories: ['General'],
            customerEmail: 'customer@example.com',
            customerName: 'Customer',
            customerHistory: {
                total_orders: data.customerSegment === 'New' ? 1 : 10,
                total_refunds: data.customerSegment === 'High Risk' ? 5 : 0,
                refund_rate: data.customerSegment === 'High Risk' ? 0.5 : 0,
                avg_order_value: data.orderTotal,
                account_age_days: data.customerSegment === 'New' ? 14 : 365,
                total_spent: data.orderTotal * 10,
                email_verified: true,
                phone_verified: true,
            },
            isAddressMismatch: data.addressMismatch,
            deliveryStatus: 'delivered',
            merchantPolicy: {
                refund_window_days: 30,
                max_refund_rate: 0.1,
                min_order_age_hours: 24,
                require_photo_proof: false,
                auto_approve_threshold: 20,
                auto_reject_threshold: 80,
            }
        };
        onAnalyze(fullInput);
    };

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4 text-white">
                <Shield className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold">Manual Analysis</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Order ID</label>
                        <input {...register('orderId')} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" placeholder="ORD-123" />
                        {errors.orderId && <p className="text-red-400 text-xs">{errors.orderId.message}</p>}
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Product</label>
                        <input {...register('items')} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Product Name" />
                        {errors.items && <p className="text-red-400 text-xs">{errors.items.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Refund Amount ($)</label>
                        <input type="number" step="0.01" {...register('refundAmount', { valueAsNumber: true })} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
                        {errors.refundAmount && <p className="text-red-400 text-xs">{errors.refundAmount.message}</p>}
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Order Total ($)</label>
                        <input type="number" step="0.01" {...register('orderTotal', { valueAsNumber: true })} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
                        {errors.orderTotal && <p className="text-red-400 text-xs">{errors.orderTotal.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="text-xs text-slate-400 block mb-1">Reason</label>
                    <select {...register('reason')} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm">
                        <option value="Quality not as expected">Quality not as expected</option>
                        <option value="Item arrived damaged">Item arrived damaged</option>
                        <option value="Changed my mind">Changed my mind</option>
                        <option value="Did not receive item">Did not receive item</option>
                        <option value="Ordered by mistake">Ordered by mistake</option>
                    </select>
                </div>

                <div>
                    <label className="text-xs text-slate-400 block mb-1">Customer Note</label>
                    <textarea {...register('customerNote')} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" rows={2} placeholder="Optional customer message" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Customer Segment</label>
                        <select {...register('customerSegment')} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm ">
                            <option value="New">New Customer</option>
                            <option value="Regular">Regular</option>
                            <option value="VIP">VIP</option>
                            <option value="High Risk">High Risk</option>
                        </select>
                    </div>
                    <div className="pt-6">
                        <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
                            <input type="checkbox" {...register('addressMismatch')} className="bg-slate-900 border-slate-700 text-blue-500 rounded focus:ring-blue-500" />
                            Address Mismatch
                        </label>
                    </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded flex justify-center items-center gap-2 disabled:opacity-50 transition-colors">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isLoading ? 'Analyzing...' : 'Analyze Refund'}
                </button>
            </form>
        </div>
    );
}
