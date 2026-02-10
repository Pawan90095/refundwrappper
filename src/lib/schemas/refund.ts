// Zod schemas for refund analysis validation
import { z } from 'zod';

// Customer history schema
export const CustomerHistorySchema = z.object({
    total_orders: z.number().min(0),
    total_refunds: z.number().min(0),
    refund_rate: z.number().min(0).max(1),
    avg_order_value: z.number().min(0),
    account_age_days: z.number().min(0),
    total_spent: z.number().min(0),
    last_order_date: z.string().optional(),
    email_verified: z.boolean(),
    phone_verified: z.boolean(),
});

// Address schema
export const AddressSchema = z.object({
    country: z.string(),
    city: z.string(),
    zip: z.string(),
});

// Customer message schema
export const CustomerMessageSchema = z.object({
    timestamp: z.string(),
    message: z.string(),
    sentiment: z.enum(['positive', 'neutral', 'negative', 'threatening']).optional(),
});

// Merchant policy schema
export const MerchantPolicySchema = z.object({
    refund_window_days: z.number().min(1),
    max_refund_rate: z.number().min(0).max(1),
    min_order_age_hours: z.number().min(0),
    require_photo_proof: z.boolean(),
    policy_text: z.string().optional(),
    auto_approve_threshold: z.number().min(0).max(100),
    auto_reject_threshold: z.number().min(0).max(100),
    allowed_reasons: z.array(z.string()).optional(),
    blocked_reasons: z.array(z.string()).optional(),
});

// Main refund analysis input schema
export const RefundAnalysisInputSchema = z.object({
    // Order & Refund Details
    refundAmount: z.number().min(0),
    orderTotal: z.number().min(0),
    refundReason: z.string().min(1),
    customerNote: z.string().optional(),
    orderDate: z.string(),
    refundRequestDate: z.string(),
    orderNumber: z.string(),

    // Product Information
    productNames: z.array(z.string()).min(1),
    productCategories: z.array(z.string()).optional(),
    productImages: z.array(z.string()).optional(),
    productPrices: z.array(z.number()).optional(),
    isDigitalProduct: z.boolean().optional(),

    // Customer Profile
    customerEmail: z.string().email(),
    customerName: z.string(),
    customerHistory: CustomerHistorySchema,

    // Shipping & Location
    shippingAddress: AddressSchema.optional(),
    billingAddress: AddressSchema.optional(),
    isAddressMismatch: z.boolean().optional(),
    trackingNumber: z.string().optional(),
    deliveryStatus: z.enum(['delivered', 'in_transit', 'pending', 'failed']).optional(),
    deliveryDate: z.string().optional(),

    // Payment Information
    paymentMethod: z.enum(['credit_card', 'paypal', 'apple_pay', 'shop_pay', 'other']).optional(),
    isChargebackRisk: z.boolean().optional(),

    // Merchant Policy
    merchantPolicy: MerchantPolicySchema,

    // Additional Context
    customerMessages: z.array(CustomerMessageSchema).optional(),
    previousRefundReasons: z.array(z.string()).optional(),
    seasonalContext: z.enum(['holiday', 'black_friday', 'regular']).optional(),
});

// Score breakdown schema
export const ScoreBreakdownSchema = z.object({
    window_compliance: z.number().min(0).max(15),
    sentiment: z.number().min(0).max(15),
    fraud_patterns: z.number().min(0).max(35),
    reason_validity: z.number().min(0).max(20),
    financial_risk: z.number().min(0).max(10),
    delivery_verification: z.number().min(0).max(10),
    evidence: z.number().min(0).max(5),
    adjustments: z.number(),
});

// Reasoning schema
export const ReasoningSchema = z.object({
    window_compliance: z.string(),
    sentiment_analysis: z.string(),
    fraud_indicators: z.array(z.string()),
    reason_validity: z.string(),
    financial_assessment: z.string(),
    delivery_status: z.string(),
    evidence_provided: z.string(),
    recommendation: z.string(),
});

// Suggested action schema
export const SuggestedActionSchema = z.object({
    primary: z.enum(['APPROVE', 'REJECT', 'REQUEST_MORE_INFO']),
    alternative: z.string(),
    talking_points: z.array(z.string()),
});

// Policy compliance schema
export const PolicyComplianceSchema = z.object({
    within_refund_window: z.boolean(),
    meets_minimum_age: z.boolean(),
    has_required_evidence: z.boolean(),
    reason_allowed: z.boolean(),
});

// AI Analysis result schema
export const RefundAnalysisResultSchema = z.object({
    action: z.enum(['APPROVE', 'REJECT', 'FLAG']),
    risk_score: z.number().min(0).max(100),
    confidence: z.number().min(0).max(1),
    score_breakdown: ScoreBreakdownSchema,
    reasoning: ReasoningSchema,
    red_flags: z.array(z.string()),
    green_flags: z.array(z.string()),
    suggested_action_for_merchant: SuggestedActionSchema,
    fraud_probability: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    customer_segment: z.enum(['new_customer', 'regular', 'high_value', 'serial_refunder', 'one_time_buyer']),
    historical_context: z.string(),
    policy_compliance: PolicyComplianceSchema,
});

// Type exports
export type RefundAnalysisInput = z.infer<typeof RefundAnalysisInputSchema>;
export type RefundAnalysisResult = z.infer<typeof RefundAnalysisResultSchema>;
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;
export type CustomerHistory = z.infer<typeof CustomerHistorySchema>;
export type MerchantPolicy = z.infer<typeof MerchantPolicySchema>;
