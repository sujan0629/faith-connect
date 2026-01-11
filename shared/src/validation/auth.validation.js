"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenSchema = exports.MagicLinkPayloadSchema = exports.VerifyMagicSchema = exports.PasswordLoginSchema = exports.SetPasswordSchema = exports.VerifySignupCodeSchema = exports.RequestSignupSchema = exports.CheckEmailSchema = exports.sixDigitCodeValidator = exports.passwordValidator = exports.emailValidator = exports.emailRegex = exports.RoleEnum = void 0;
const zod_1 = require("zod");
exports.RoleEnum = zod_1.z.enum(['worshiper', 'leader']);
exports.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
exports.emailValidator = zod_1.z.string().email('Invalid email address').toLowerCase();
exports.passwordValidator = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');
exports.sixDigitCodeValidator = zod_1.z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric');
exports.CheckEmailSchema = zod_1.z.object({
    email: exports.emailValidator,
});
exports.RequestSignupSchema = zod_1.z.object({
    email: exports.emailValidator,
    role: exports.RoleEnum.optional().default('worshiper'),
});
exports.VerifySignupCodeSchema = zod_1.z.object({
    email: exports.emailValidator,
    code: exports.sixDigitCodeValidator,
});
exports.SetPasswordSchema = zod_1.z.object({
    signupToken: zod_1.z.string().min(1, 'Signup token is required'),
    email: exports.emailValidator,
    password: exports.passwordValidator,
    name: zod_1.z.string().min(1, 'Name is required').max(120, 'Name is too long'),
    role: exports.RoleEnum.optional(),
});
exports.PasswordLoginSchema = zod_1.z.object({
    email: exports.emailValidator,
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.VerifyMagicSchema = zod_1.z.object({
    email: exports.emailValidator,
    token: zod_1.z.string().min(1, 'Magic token is required').optional(),
    code: exports.sixDigitCodeValidator.optional(),
}).refine((data) => data.token || data.code, {
    message: 'Token or code is required',
    path: ['token'],
});
exports.MagicLinkPayloadSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    email: exports.emailValidator,
    code: exports.sixDigitCodeValidator,
    env: zod_1.z.enum(['dev', 'prod']).optional(),
});
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
//# sourceMappingURL=auth.validation.js.map