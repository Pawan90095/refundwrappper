'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { RefundAnalysisResult } from '@/lib/schemas/refund';

interface EmailGeneratorProps {
    result: RefundAnalysisResult;
    customerName: string;
}

export function EmailGenerator({ result, customerName }: EmailGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [emailBody, setEmailBody] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (result) {
            generateEmail();
        }
    }, [result, customerName]);

    const generateEmail = () => {
        let subject = '';
        let body = '';

        const firstName = customerName.split(' ')[0] || 'Customer';

        if (result.action === 'APPROVE') {
            subject = `Update on your refund request`;
            body = `Hi ${firstName},

We have good news regarding your refund request.

After reviewing your case, we have approved your refund of $${result.score_breakdown.financial_risk > 0 ? 'the requested amount' : 'the full amount'}. You should see this appear on your original payment method within 5-10 business days.

We apologize for any inconvenience caused. We value your business and hope to serve you better next time.

Best regards,
The Customer Service Team`;
        } else if (result.action === 'REJECT') {
            subject = `Update on your refund request`;
            body = `Hi ${firstName},

Thank you for contacting us regarding your order.

We have carefully reviewed your refund request. Unfortunately, we are unable to approve it at this time due to the following reason(s):

${result.suggested_action_for_merchant.talking_points.map(point => `• ${point}`).join('\n')}

${result.suggested_action_for_merchant.alternative ? `\nHowever, we would like to offer: ${result.suggested_action_for_merchant.alternative}` : ''}

If you have any additional information that might help us reconsider, please let us know.

Best regards,
The Customer Service Team`;
        } else {
            // FLAG / REQUEST_MORE_INFO
            subject = `Action required: Your refund request`;
            body = `Hi ${firstName},

Thank you for your refund request.

We are currently reviewing your case, but we need a bit more information to proceed. Could you please provide:

${result.suggested_action_for_merchant.talking_points.map(point => `• ${point}`).join('\n')}

Once we receive this, we will be able to finalize your request immediately.

Best regards,
The Customer Service Team`;
        }

        setEmailBody(body);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(emailBody);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden mt-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-slate-200">AI Response Draft</h3>
                        <p className="text-sm text-slate-500">
                            {isOpen ? 'Click to collapse' : 'Click to view suggested email response'}
                        </p>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>

            {isOpen && (
                <div className="p-4 pt-0 animate-in slide-in-from-top-2 duration-200">
                    <div className="relative">
                        <textarea
                            readOnly
                            value={emailBody}
                            className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-300 text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                            onClick={copyToClipboard}
                            className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md transition-colors text-slate-400 hover:text-white"
                            title="Copy to clipboard"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="mt-3 flex gap-2 text-xs text-slate-500">
                        <p>💡 Tip: You can edit this draft before sending.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
