"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteOnboardingSchema = exports.UpdateProfileSchema = exports.usernameValidator = void 0;
const zod_1 = require("zod");
const auth_validation_1 = require("./auth.validation");
exports.usernameValidator = zod_1.z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .toLowerCase();
exports.UpdateProfileSchema = zod_1.z.object({
    username: exports.usernameValidator.optional(),
    name: zod_1.z.string().min(1, 'Name is required').max(120, 'Name is too long').optional(),
    faith: zod_1.z.string().max(120, 'Faith name is too long').optional(),
    bio: zod_1.z.string().max(300, 'Bio is too long').optional(),
    avatar: zod_1.z.string().url('Avatar must be a valid URL').or(zod_1.z.string().length(0)).optional(),
    denomination: zod_1.z.string().max(120, 'Denomination is too long').optional(),
    contentFocus: zod_1.z.array(zod_1.z.string()).optional(),
    audiencePrefs: zod_1.z.array(zod_1.z.string()).optional(),
    role: auth_validation_1.RoleEnum.optional(),
    onboardingCompleted: zod_1.z.boolean().optional(),
});
exports.CompleteOnboardingSchema = zod_1.z
    .object({
    username: exports.usernameValidator,
    name: zod_1.z.string().min(1, 'Name is required').max(120, 'Name is too long'),
    faith: zod_1.z.string().min(1, 'Faith is required').max(120, 'Faith name is too long'),
    bio: zod_1.z.string().max(300, 'Bio is too long').optional(),
    avatar: zod_1.z.string().url('Avatar must be a valid URL').optional(),
    denomination: zod_1.z.string().max(120, 'Denomination is too long').optional(),
    role: auth_validation_1.RoleEnum,
    contentFocus: zod_1.z.array(zod_1.z.string()).optional(),
    audiencePrefs: zod_1.z.array(zod_1.z.string()).optional(),
    onboardingCompleted: zod_1.z.literal(true),
})
    .refine((data) => {
    if (data.role === 'leader') {
        return data.contentFocus && data.contentFocus.length > 0 && data.audiencePrefs && data.audiencePrefs.length > 0;
    }
    return true;
}, {
    message: 'Leaders must specify content focus and audience preferences',
    path: ['contentFocus'],
});
//# sourceMappingURL=user.validation.js.map