// Groq AI Service for Refund Analysis
import Groq from 'groq-sdk';
import { RefundAnalysisInput, RefundAnalysisResult, RefundAnalysisResultSchema } from '../schemas/refund';
import { buildRefundAnalysisPrompt } from './refund-analysis-prompt';

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
});

export interface AnalyzeRefundOptions {
    model?: string;
    temperature?: number;
}

export async function analyzeRefund(
    input: RefundAnalysisInput,
    options: AnalyzeRefundOptions = {}
): Promise<RefundAnalysisResult> {
    const {
        model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature = 0.1, // Low temperature for consistent, deterministic responses
    } = options;

    // Build the analysis prompt
    const prompt = buildRefundAnalysisPrompt(input);

    try {
        // Generate content using Groq (OpenAI-compatible)
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are an advanced fraud detection AI. Analyze the refund request and output valid JSON only.'
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: model,
            temperature: temperature,
            max_tokens: 4096,
            top_p: 1,
            stream: false,
            response_format: { type: 'json_object' }, // Enforce JSON mode
        });

        const text = chatCompletion.choices[0]?.message?.content || '';

        // Parse JSON response
        let jsonResponse: unknown;
        try {
            // Clean up response - just in case Llama adds markdown despite json_object mode
            let cleanedText = text.trim();
            if (cleanedText.startsWith('```json')) {
                cleanedText = cleanedText.slice(7);
            }
            if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.slice(3);
            }
            if (cleanedText.endsWith('```')) {
                cleanedText = cleanedText.slice(0, -3);
            }
            jsonResponse = JSON.parse(cleanedText.trim());
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', text);
            throw new Error('AI returned invalid JSON response');
        }

        // Validate against schema
        const validatedResult = RefundAnalysisResultSchema.parse(jsonResponse);
        return validatedResult;

    } catch (error) {
        console.error('Error analyzing refund:', error);

        // Return a safe fallback for FLAG action
        if (error instanceof Error && (error.message.includes('JSON') || error.message.includes('parse'))) {
            return createFallbackResult(input, 'AI response parsing failed - manual review required');
        }

        throw error;
    }
}

// Create a fallback result for when AI fails
function createFallbackResult(input: RefundAnalysisInput, reason: string): RefundAnalysisResult {
    return {
        action: 'FLAG',
        risk_score: 50,
        confidence: 0.3,
        score_breakdown: {
            window_compliance: 5,
            sentiment: 5,
            fraud_patterns: 15,
            reason_validity: 10,
            financial_risk: 5,
            delivery_verification: 5,
            evidence: 2,
            adjustments: 0,
        },
        reasoning: {
            window_compliance: 'Unable to fully analyze - flagged for manual review',
            sentiment_analysis: 'Unable to analyze sentiment',
            fraud_indicators: [reason],
            reason_validity: 'Requires manual verification',
            financial_assessment: `Refund amount: $${input.refundAmount}`,
            delivery_status: input.deliveryStatus || 'Unknown',
            evidence_provided: 'Unable to verify',
            recommendation: 'Manual review required due to analysis failure',
        },
        red_flags: [...(input.previousRefundReasons || []).map(r => `Previous refund: ${r}`), reason],
        green_flags: [],
        suggested_action_for_merchant: {
            primary: 'REQUEST_MORE_INFO',
            alternative: 'Contact customer for more details',
            talking_points: [
                'We are reviewing your refund request',
                'A team member will follow up shortly',
            ],
        },
        fraud_probability: 'MEDIUM',
        customer_segment: 'regular',
        historical_context: 'Analysis incomplete - manual review needed',
        policy_compliance: {
            within_refund_window: true,
            meets_minimum_age: true,
            has_required_evidence: false,
            reason_allowed: true,
        },
    };
}

// Export types
export type { RefundAnalysisInput, RefundAnalysisResult };
