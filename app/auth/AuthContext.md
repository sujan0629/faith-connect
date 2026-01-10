# Authentication Flow

### Overview
The app uses an intelligent authentication flow that handles both login and new user registration. The flow branches based on whether the email exists in the backend.

### Flow Steps

#### Path 1: Existing User (Email Found in Backend)

1. **Login Page** (`/auth/login`)
   - User enters their email address
   - App checks if email exists in backend
   - **Email found**: Sends magic link to email
   - Navigates to Email Sent Screen

2. **Email Sent Screen** (`/auth/EmailSentScreen`)
   - Displays confirmation that magic link was sent
   - **Option A**: User verifies magic link via email → Direct login
   - **Option B**: User clicks "Enter password instead" → Navigate to Password Login Screen

3. **Password Login Screen** (Alternative)
   - User enters password
   - Validates credentials
   - Direct login to app

#### Path 2: New User (Email Not Found in Backend)

1. **Login Page** (`/auth/login`)
   - User enters their email address
   - App checks if email exists in backend
   - **Email not found**: Shows alert "This email isn't registered - Do you want to register?"
   - If user selects YES → Sends verification code to email
   - Navigates to Verification Code Screen

2. **Verification Code Screen** (`/auth/VerifyCodeScreen`)
   - User enters the 6-digit verification code from email
   - Validates the code
   - Proceeds to Set Password Screen

3. **Set Password Screen** (`/auth/SetPasswordScreen`)
   - User creates a secure password
   - Account is created in backend
   - Redirects to Onboarding

4. **Onboarding** (`/onboarding/profile`)
   - User completes profile setup
   - Account setup complete - User is registered

### Key Features

- **Backend Email Validation**: Checks if email exists before determining flow
- **Smart Alerts**: Prompts new users to register instead of error messages
- **Dual Authentication**: Supports both magic links and password-based login
- **Unified Entry Point**: Single login screen handles both login and signup logic

### Components Used

- `login.tsx`: Main entry point with email validation and backend check
- `EmailSentScreen.tsx`: Magic link confirmation and password login option
- `VerifyCodeScreen.tsx`: Code verification for new user registration
- `SetPasswordScreen.tsx`: Password creation for new accounts
- `PasswordLoginScreen.tsx`: Password-based login for existing users

### Navigation

Uses Expo Router for navigation with proper parameter passing between screens.

---

© 2026 FaithConnect. All rights reserved.
