# FaithConnect Backend (NestJS)

NestJS + MongoDB backend implementing the auth and onboarding flow from AuthContext.md and context-app.md. It supports magic links, password signup/login, Resend emails, Cloudinary uploads, and JWT access/refresh tokens.

## Quick start

1. Copy `.env.example` to `.env` and fill secrets.
2. Install deps: `npm install`.
3. Run dev server: `npm run start:dev` (API on `http://localhost:3000/api`).
4. Health check: `GET /api/health`.

## Environment

- `MONGODB_URI` (defaults to `mongodb://localhost:27017/faithconnect` if unset)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- `MAGIC_TOKEN_TTL_MINUTES`, `SIGNUP_CODE_TTL_MINUTES`
- `RESEND_API_KEY`, `EMAIL_FROM`, `MAGIC_LINK_URL`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Auth flow endpoints

- **POST /api/auth/check-email** — Existing user → sends magic link. Pending signup → resends verification code. Unknown email → `status: not-found` (prompt user to register).
- **POST /api/auth/request-signup** — Body `{ email, role? }`; creates/keeps pending user, emails 6-digit code.
- **POST /api/auth/verify-signup** — Body `{ email, code }`; verifies code and returns `signupToken` (30m).
- **POST /api/auth/set-password** — Body `{ email, signupToken, password, name?, role? }`; activates account and returns `{ user, accessToken, refreshToken }`.
- **POST /api/auth/password-login** — Body `{ email, password }`; tokens + user.
- **POST /api/auth/verify-magic** — Body `{ email, token }` (token from email link); tokens + user.
- **POST /api/auth/refresh** — Body `{ refreshToken }`; returns fresh tokens (checks stored hash).

## Profile endpoints (Bearer access token)

- **GET /api/users/me** — Current user profile.
- **PATCH /api/users/me** — Update onboarding/profile fields: `name`, `faith`, `bio`, `avatar`, `denomination`, `contentFocus[]`, `audiencePrefs[]`, `role`. Sets `hasProfile=true`.

## Uploads (Bearer access token)

- **POST /api/uploads** — `multipart/form-data` with `file` (memory upload). Optional body `folder`. Uses Cloudinary (`resource_type: auto`) and returns `url`, `publicId`, dimensions, format.

## Screen wiring tips

- **Login screen**: call `/auth/check-email`. If `magic-link-sent` → EmailSent screen. If `signup-incomplete` → send to VerifyCode screen. If `not-found` → prompt and then call `/auth/request-signup`.
- **VerifyCode screen**: submit code to `/auth/verify-signup`, keep `signupToken` for the SetPassword screen.
- **SetPassword screen**: call `/auth/set-password` with the stored `signupToken`.
- **PasswordLogin screen**: call `/auth/password-login`.
- **Magic link email**: uses `MAGIC_LINK_URL?token=...&email=...`; open link then call `/auth/verify-magic` with token/email.
- Keep `accessToken` + `refreshToken`; refresh via `/auth/refresh`.

## Notes

- Emails and uploads log a warning and skip if credentials are missing (Resend/Cloudinary).
- JWT secrets fallback to dev defaults; set real secrets before deploying.
