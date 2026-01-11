import { z } from 'zod';
import { RoleEnum } from './auth.validation';

// Username validation
export const usernameValidator = z
	.string()
	.min(3, 'Username must be at least 3 characters')
	.max(30, 'Username must be at most 30 characters')
	.regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
	.toLowerCase();

// User profile schemas
export const UpdateProfileSchema = z.object({
	username: usernameValidator.optional(),
	name: z.string().min(1, 'Name is required').max(120, 'Name is too long').optional(),
	faith: z.string().max(120, 'Faith name is too long').optional(),
	bio: z.string().max(300, 'Bio is too long').optional(),
	avatar: z.string().url('Avatar must be a valid URL').or(z.string().length(0)).optional(),
	denomination: z.string().max(120, 'Denomination is too long').optional(),
	contentFocus: z.array(z.string()).optional(),
	audiencePrefs: z.array(z.string()).optional(),
	role: RoleEnum.optional(),
	onboardingCompleted: z.boolean().optional(),
});

// Onboarding specific schema (stricter requirements)
export const CompleteOnboardingSchema = z
	.object({
		username: usernameValidator,
		name: z.string().min(1, 'Name is required').max(120, 'Name is too long'),
		faith: z.string().min(1, 'Faith is required').max(120, 'Faith name is too long'),
		bio: z.string().max(300, 'Bio is too long').optional(),
		avatar: z.string().url('Avatar must be a valid URL').optional(),
		denomination: z.string().max(120, 'Denomination is too long').optional(),
		role: RoleEnum,
		// Leader-specific fields
		contentFocus: z.array(z.string()).optional(),
		audiencePrefs: z.array(z.string()).optional(),
		onboardingCompleted: z.literal(true),
	})
	.refine(
		(data) => {
			// Leaders must have contentFocus and audiencePrefs
			if (data.role === 'leader') {
				return data.contentFocus && data.contentFocus.length > 0 && data.audiencePrefs && data.audiencePrefs.length > 0;
			}
			return true;
		},
		{
			message: 'Leaders must specify content focus and audience preferences',
			path: ['contentFocus'],
		},
	);

// Type exports
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type CompleteOnboardingInput = z.infer<typeof CompleteOnboardingSchema>;
