import { Role } from '../types/user.types';
export interface UpdateProfileDto {
    username?: string;
    name?: string;
    faith?: string;
    bio?: string;
    avatar?: string;
    denomination?: string;
    contentFocus?: string[];
    audiencePrefs?: string[];
    role?: Role;
    onboardingCompleted?: boolean;
}
