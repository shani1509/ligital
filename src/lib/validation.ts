import { z } from 'zod';

// ─── Auth Schemas ───────────────────────────────────────

export const registerSchema = z.object({
  libraryName: z
    .string()
    .min(2, 'Library name must be at least 2 characters')
    .max(100, 'Library name must be under 100 characters')
    .trim(),
  ownerName: z
    .string()
    .min(2, 'Owner name must be at least 2 characters')
    .max(100, 'Owner name must be under 100 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be under 255 characters')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be under 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be under 15 digits')
    .regex(/^[+]?[\d\s-]+$/, 'Invalid phone number format'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address must be under 500 characters')
    .trim(),
  maxCapacity: z
    .number()
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(1000, 'Capacity cannot exceed 1000'),
  cfTurnstileToken: z.string().min(1, 'Turnstile validation is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
  cfTurnstileToken: z.string().min(1, 'Turnstile validation is required'),
});

// ─── Student Schemas ────────────────────────────────────

export const createStudentSchema = z.object({
  name: z
    .string()
    .min(2, 'Student name must be at least 2 characters')
    .max(100, 'Student name must be under 100 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .max(255)
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(10, 'Phone must be at least 10 digits')
    .max(15, 'Phone must be under 15 digits')
    .regex(/^[+]?[\d\s-]+$/, 'Invalid phone format'),
  address: z.string().max(500).optional().or(z.literal('')),
  seatNumber: z.number().int().positive().optional(),
  planId: z.string().uuid().optional().or(z.literal('')),
});

export const updateStudentSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().max(255).optional().or(z.literal('')),
  phone: z.string().min(10).max(15).optional(),
  address: z.string().max(500).optional().or(z.literal('')),
});

// ─── Plan Schemas ───────────────────────────────────────

export const createPlanSchema = z.object({
  name: z
    .string()
    .min(2, 'Plan name must be at least 2 characters')
    .max(100, 'Plan name must be under 100 characters')
    .trim(),
  durationDays: z
    .number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 day')
    .max(365, 'Duration cannot exceed 365 days'),
  pricePaise: z
    .number()
    .int('Price must be in paise (whole number)')
    .min(100, 'Price must be at least ₹1 (100 paise)')
    .max(10000000, 'Price cannot exceed ₹1,00,000'),
});

export const updatePlanSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  durationDays: z.number().int().min(1).max(365).optional(),
  pricePaise: z.number().int().min(100).max(10000000).optional(),
});

// ─── Subscription Schemas ───────────────────────────────

export const createSubscriptionSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  planId: z.string().uuid('Invalid plan ID'),
});

// ─── Billing Schemas ────────────────────────────────────

export const subscribeBillingSchema = z.object({
  planType: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY'], {
    message: 'Plan type must be MONTHLY, QUARTERLY, or YEARLY',
  }),
});

// ─── Settings Schemas ───────────────────────────────────

export const updateProfileSchema = z.object({
  libraryName: z.string().min(2).max(100).trim().optional(),
  ownerName: z.string().min(2).max(100).trim().optional(),
  phone: z.string().min(10).max(15).optional(),
  address: z.string().min(5).max(500).trim().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

// ─── Type Exports ───────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type SubscribeBillingInput = z.infer<typeof subscribeBillingSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
