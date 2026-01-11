# Authentication Flow

### Overview
The app uses a unified authentication flow with magic links + verification codes. Both login and signup paths use the same email verification mechanism - users receive a magic link in their email with an included 6-digit code. They can either click the link or manually enter the code.

### Unified Flow (Both Login & Signup)

1. **Login Page** (`/auth/login`)
   - User enters their email address
   - App sends email to backend via `check-email` endpoint
   - Backend checks if account exists:
     - **Existing User (active)**: Sends magic link
     - **Pending User**: Sends magic link (for signup completion)
     - **New User (not found)**: Creates pending account & sends magic link

2. **Email Sent Screen** (`/auth/EmailSentScreen`)
   - Displays confirmation magic link was sent
   - Shows email address
   - **Button**: "Open your Email App" - helps user navigate to email
   - **Secondary Option**: "Enter verification code instead"
     - For signup: "Enter verification code instead"
     - For login: "Enter password instead"

3. **Verification Code Screen** (`/auth/VerifyCodeScreen`) - Optional Path
   - User manually enters the 6-digit code from email
   - Calls `verify-signup` endpoint (for signup) or `verify-magic` (for login)
   - For **signup users**: Returns `signupToken`
   - For **login users**: Returns `accessToken` + `refreshToken` → Direct login

4. **Magic Link Path** (Default)
   - User clicks magic link in email
   - App opens deep link: `exp://192.168.1.175:8081/--/magic-login?token=XXX&email=XXX&code=XXX&env=dev`
   - Mobile app intercepts and verifies magic token/code
   - For **signup users**: Returns `signupToken` → Set Password Screen
   - For **login users**: Returns tokens → Direct login

5. **Set Password Screen** (Signup Only) (`/auth/SetPasswordScreen`)
   - User creates secure password
   - Validates password requirements:
     - ≥8 characters
     - ≥1 uppercase letter
     - ≥1 lowercase letter
     - ≥1 number
   - Calls `set-password` endpoint with `signupToken`
   - Account is activated in backend
   - User is authenticated
   - Redirects to onboarding

6. **Onboarding** (`/onboarding/profile`)
   - User completes profile setup (name, role, avatar, etc.)
   - Account setup complete

7. **Home Screen** (`/(tabs)/home`)
   - User logged in and fully onboarded

### Key Features

- **Unified Magic Link Approach**: Both login and signup use the same magic link + code mechanism
- **Dual Input Methods**: Users can click link OR enter code manually
- **Smart Backend Logic**: Automatically creates pending account for new emails
- **Email with Code**: Magic link emails include 6-digit code for manual entry
- **Deep Link Support**: Magic links open app directly with Expo
- **Password Protection**: Signup requires secure password creation
- **Token Types**:
  - `accessToken`: Used for API requests
  - `refreshToken`: Used to get new access tokens
  - `signupToken`: Used during signup to set password

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/check-email` | POST | Check if email exists, send magic link |
| `/auth/verify-magic` | POST | Verify magic link token/code (login) |
| `/auth/verify-signup` | POST | Verify code for signup flow |
| `/auth/set-password` | POST | Complete signup with password |
| `/auth/password-login` | POST | Password-based login |
| `/auth/refresh` | POST | Refresh access token |

### Components Used

- `login.tsx`: Email entry and check-email endpoint
- `EmailSentScreen.tsx`: Magic link confirmation UI
- `VerifyCodeScreen.tsx`: Manual code entry for both paths
- `SetPasswordScreen.tsx`: Password creation (signup only)
- `PasswordLoginScreen.tsx`: Password login (fallback)

### Navigation Flow Diagram

```
Login Page
    ↓
Check Email (POST /auth/check-email)
    ├─ Existing User → Send Magic Link
    ├─ Pending User → Send Magic Link  
    └─ New User → Create Account + Send Magic Link
    ↓
Email Sent Screen
    ├─ Path A: Click Magic Link
    │   ├─ Verify Magic (POST /auth/verify-magic)
    │   ├─ If Signup: signupToken → Set Password
    │   └─ If Login: tokens → Home
    │
    └─ Path B: Enter Code Manually
        ├─ Verify Code (POST /auth/verify-signup)
        ├─ If Signup: signupToken → Set Password
        └─ If Login: tokens → Home

Set Password Screen (Signup Only)
    ↓
Set Password (POST /auth/set-password)
    ↓
Onboarding Profile
    ↓
Home Screen
```

---

© 2026 FaithConnect. All rights reserved.
