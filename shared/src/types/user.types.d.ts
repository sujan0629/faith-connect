export type Role = 'worshiper' | 'leader';
export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    username?: string;
    role: Role;
    faith?: string;
    bio?: string;
    avatar?: string;
    hasProfile: boolean;
    onboardingCompleted?: boolean;
    denomination?: string;
    contentFocus?: string[];
    audiencePrefs?: string[];
    createdAt?: string;
    updatedAt?: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface AuthResponse {
    user: UserProfile;
    accessToken: string;
    refreshToken: string;
}
