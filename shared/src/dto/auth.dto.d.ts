import { Role } from '../types/user.types';
export interface CheckEmailDto {
    email: string;
}
export interface RequestSignupDto {
    email: string;
    role?: Role;
}
export interface VerifySignupCodeDto {
    email: string;
    code: string;
}
export interface SetPasswordDto {
    email: string;
    password: string;
}
export interface PasswordLoginDto {
    email: string;
    password: string;
}
export interface VerifyMagicDto {
    email: string;
    token?: string;
    code?: string;
}
export interface RefreshTokenDto {
    refreshToken: string;
}
