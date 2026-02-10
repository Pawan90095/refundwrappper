// API Route: POST /api/analyze-refund
import { NextRequest, NextResponse } from 'next/server';
import { RefundAnalysisInputSchema } from '@/lib/schemas/refund';
import { analyzeRefund } from '@/lib/ai/refund-analyzer';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate input
        const validatedInput = RefundAnalysisInputSchema.parse(body);

        // Analyze refund with AI
        const result = await analyzeRefund(validatedInput);

        // Return result
        return NextResponse.json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error('API Error:', error);

        // Handle validation errors
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request data',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                },
                { status: 400 }
            );
        }

        // Handle other errors
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            },
            { status: 500 }
        );
    }
}

// Health check
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        service: 'RefundGuard AI',
        version: '1.0.0',
    });
}
