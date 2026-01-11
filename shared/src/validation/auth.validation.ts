import { z } from 'zod';

// Role enum
export const RoleEnum = z.enum(['worshiper', 'leader']);

// Email validation regex (RFC 5322 simplified)
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Common validators
export const emailValidator = z.string().email('Invalid email address').toLowerCase();
export const passwordValidator = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.max(100, 'Password is too long')
	.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
	.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
	.regex(/[0-9]/, 'Password must contain at least one number');

export const sixDigitCodeValidator = z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric');

// Auth schemas
export const CheckEmailSchema = z.object({
	email: emailValidator,
});

export const RequestSignupSchema = z.object({
	email: emailValidator,
	role: RoleEnum.optional().default('worshiper'),
});

export const VerifySignupCodeSchema = z.object({
	email: emailValidator,
	code: sixDigitCodeValidator,
});

export const SetPasswordSchema = z.object({
	signupToken: z.string().min(1, 'Signup token is required'),
	email: emailValidator,
	password: passwordValidator,
	name: z.string().min(1, 'Name is required').max(120, 'Name is too long'),
	role: RoleEnum.optional(),
});

export const PasswordLoginSchema = z.object({
	email: emailValidator,
	password: z.string().min(1, 'Password is required'),
});

export const VerifyMagicSchema = z.object({
	email: emailValidator,
	token: z.string().min(1, 'Magic token is required').optional(),
	code: sixDigitCodeValidator.optional(),
}).refine((data) => data.token || data.code, {
	message: 'Token or code is required',
	path: ['token'],
});

// Magic link payload embedded in redirect URLs
export const MagicLinkPayloadSchema = z.object({
	token: z.string().min(1),
	email: emailValidator,
	code: sixDigitCodeValidator,
	env: z.enum(['dev', 'prod']).optional(),
});

export const RefreshTokenSchema = z.object({
	refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Type exports
export type CheckEmailInput = z.infer<typeof CheckEmailSchema>;
export type RequestSignupInput = z.infer<typeof RequestSignupSchema>;
export type VerifySignupCodeInput = z.infer<typeof VerifySignupCodeSchema>;
export type SetPasswordInput = z.infer<typeof SetPasswordSchema>;
export type PasswordLoginInput = z.infer<typeof PasswordLoginSchema>;
export type VerifyMagicInput = z.infer<typeof VerifyMagicSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type MagicLinkPayloadInput = z.infer<typeof MagicLinkPayloadSchema>;
