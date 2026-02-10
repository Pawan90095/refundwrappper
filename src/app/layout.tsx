import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
    title: 'RefundGuard AI - Intelligent Fraud Detection',
    description: 'AI-powered refund analysis and fraud detection for e-commerce',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-slate-950">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
