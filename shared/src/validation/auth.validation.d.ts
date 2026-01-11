import { z } from 'zod';
export declare const RoleEnum: z.ZodEnum<["worshiper", "leader"]>;
export declare const emailRegex: RegExp;
export declare const emailValidator: z.ZodString;
export declare const passwordValidator: z.ZodString;
export declare const sixDigitCodeValidator: z.ZodString;
export declare const CheckEmailSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const RequestSignupSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodDefault<z.ZodOptional<z.ZodEnum<["worshiper", "leader"]>>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: "worshiper" | "leader";
}, {
    email: string;
    role?: "worshiper" | "leader" | undefined;
}>;
export declare const VerifySignupCodeSchema: z.ZodObject<{
    email: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    code: string;
}, {
    email: string;
    code: string;
}>;
export declare const SetPasswordSchema: z.ZodObject<{
    signupToken: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["worshiper", "leader"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    signupToken: string;
    password: string;
    name: string;
    role?: "worshiper" | "leader" | undefined;
}, {
    email: string;
    signupToken: string;
    password: string;
    name: string;
    role?: "worshiper" | "leader" | undefined;
}>;
export declare const PasswordLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const VerifyMagicSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodString;
    token: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    code?: string | undefined;
    token?: string | undefined;
}, {
    email: string;
    code?: string | undefined;
    token?: string | undefined;
}>, {
    email: string;
    code?: string | undefined;
    token?: string | undefined;
}, {
    email: string;
    code?: string | undefined;
    token?: string | undefined;
}>;
export declare const MagicLinkPayloadSchema: z.ZodObject<{
    token: z.ZodString;
    email: z.ZodString;
    code: z.ZodString;
    env: z.ZodOptional<z.ZodEnum<["dev", "prod"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    code: string;
    token: string;
    env?: "dev" | "prod" | undefined;
}, {
    email: string;
    code: string;
    token: string;
    env?: "dev" | "prod" | undefined;
}>;
export declare const RefreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type CheckEmailInput = z.infer<typeof CheckEmailSchema>;
export type RequestSignupInput = z.infer<typeof RequestSignupSchema>;
export type VerifySignupCodeInput = z.infer<typeof VerifySignupCodeSchema>;
export type SetPasswordInput = z.infer<typeof SetPasswordSchema>;
export type PasswordLoginInput = z.infer<typeof PasswordLoginSchema>;
export type VerifyMagicInput = z.infer<typeof VerifyMagicSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type MagicLinkPayloadInput = z.infer<typeof MagicLinkPayloadSchema>;
