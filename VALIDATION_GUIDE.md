# Applying Zod Validation to Remaining Forms

This guide shows how to add real-time validation to other forms in the mobile app.

## Pattern to Follow

### 1. Import Schema and Hook

```typescript
import { PasswordLoginSchema } from '@faithconnect/shared';
import { useZodValidation } from '../../hooks/useZodValidation';
```

### 2. Initialize Validation

```typescript
const { errors, validateField, validate } = useZodValidation(PasswordLoginSchema);
```

### 3. Add Field Validation

```typescript
const handleEmailChange = (text: string) => {
  setEmail(text);
  if (text.length > 0) {
    validateField('email', text);
  }
};
```

### 4. Show Errors in UI

```tsx
<TextField
  value={email}
  onChangeText={handleEmailChange}
/>
{errors.email && (
  <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
)}
```

### 5. Validate Before Submit

```typescript
const handleSubmit = () => {
  if (!validate({ email, password })) {
    Toast.show({ 
      type: 'error', 
      text1: 'Validation error', 
      text2: 'Please fix the errors above' 
    });
    return;
  }
  
  // Proceed with API call
};
```

---

## Example: Password Login Screen

**File**: `mobile/app/auth/PasswordLoginScreen.tsx`

```typescript
import React, { useState } from 'react';
import { PasswordLoginSchema } from '@faithconnect/shared';
import { useZodValidation } from '../../hooks/useZodValidation';

export default function PasswordLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { errors, validateField, validate } = useZodValidation(PasswordLoginSchema);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateField('email', text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (text.length > 0) {
      validateField('password', text);
    }
  };

  const handleLogin = async () => {
    // Validate all fields
    if (!validate({ email, password })) {
      Toast.show({ type: 'error', text1: 'Invalid input' });
      return;
    }

    // Proceed with login
    try {
      const response = await api.post('/auth/password-login', { email, password });
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <View>
      <TextField
        label="Email"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
      />
      {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}

      <TextField
        label="Password"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
      />
      {errors.password && <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>}

      <Button onPress={handleLogin}>Log In</Button>
    </View>
  );
}
```

---

## Example: Onboarding Username Step

**File**: `mobile/app/onboarding/profile.tsx` (Step 1)

```typescript
import { usernameValidator } from '@faithconnect/shared';
import { useZodValidation } from '../../hooks/useZodValidation';

// For single field validation, you can use the validator directly
const UsernameSchema = z.object({ username: usernameValidator });

export default function OnboardingProfile() {
  const [username, setUsername] = useState('');
  const { errors, validateField } = useZodValidation(UsernameSchema);

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    validateField('username', text);
  };

  const handleNext = () => {
    const error = validateField('username', username);
    if (error) {
      Toast.show({ type: 'error', text1: 'Invalid username', text2: error });
      return;
    }
    // Proceed to next step
  };

  return (
    <View>
      <TextField
        label="Choose a username"
        value={username}
        onChangeText={handleUsernameChange}
        autoCapitalize="none"
      />
      {errors.username && (
        <Text className="text-red-500 text-xs mt-1">{errors.username}</Text>
      )}
      {!errors.username && username.length >= 3 && (
        <Text className="text-green-500 text-xs mt-1">✓ Username looks good!</Text>
      )}
    </View>
  );
}
```

---

## Example: Set Password Screen

**File**: `mobile/app/auth/SetPasswordScreen.tsx`

```typescript
import { SetPasswordSchema } from '@faithconnect/shared';
import { useZodValidation } from '../../hooks/useZodValidation';

export default function SetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { errors, validateField } = useZodValidation(SetPasswordSchema);

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validateField('password', text);
  };

  return (
    <View>
      <TextField
        label="Create password"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
      />
      {errors.password && (
        <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
      )}
      
      {/* Password strength indicator */}
      {password.length > 0 && !errors.password && (
        <View className="mt-2">
          <Text className="text-green-500 text-xs">✓ Strong password</Text>
        </View>
      )}
    </View>
  );
}
```

---

## Available Schemas

### Auth Schemas
```typescript
import {
  CheckEmailSchema,
  RequestSignupSchema,
  VerifySignupCodeSchema,
  SetPasswordSchema,
  PasswordLoginSchema,
  VerifyMagicSchema,
  RefreshTokenSchema,
} from '@faithconnect/shared';
```

### User Schemas
```typescript
import {
  UpdateProfileSchema,
  CompleteOnboardingSchema,
} from '@faithconnect/shared';
```

### Individual Validators
```typescript
import {
  emailValidator,
  passwordValidator,
  usernameValidator,
  sixDigitCodeValidator,
} from '@faithconnect/shared';
```

---

## Advanced: Custom Schema for Complex Forms

If you have a multi-step form with conditional fields:

```typescript
import { z } from 'zod';
import { usernameValidator, emailValidator } from '@faithconnect/shared';

// Custom schema combining multiple validators
const OnboardingStep1Schema = z.object({
  username: usernameValidator,
  email: emailValidator,
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
});

const { errors, validate } = useZodValidation(OnboardingStep1Schema);
```

---

## Tips

### 1. Debounced Validation (for expensive checks)

```typescript
import { debounce } from 'lodash'; // or write your own

const debouncedValidate = debounce((field, value) => {
  validateField(field, value);
}, 300);

const handleUsernameChange = (text: string) => {
  setUsername(text);
  debouncedValidate('username', text);
};
```

### 2. Validate on Blur (less aggressive)

```tsx
<TextField
  value={email}
  onChangeText={setEmail}
  onBlur={() => validateField('email', email)}
/>
```

### 3. Show All Errors on Submit

```typescript
const handleSubmit = () => {
  const isValid = validate({ email, password, username, ... });
  
  if (!isValid) {
    // All errors are now in the `errors` object
    // The hook automatically displays them if you render error messages
    Toast.show({ type: 'error', text1: 'Please fix validation errors' });
    return;
  }
  
  // Proceed with API call
};
```

### 4. Clear Errors on Input

The hook automatically clears field errors when validation passes, but you can manually clear:

```typescript
const { clearError, clearAllErrors } = useZodValidation(schema);

// Clear specific field
clearError('email');

// Clear all errors (e.g., when resetting form)
clearAllErrors();
```

---

## Testing Validation

### In Backend
The backend automatically validates using the same Zod schemas:

```bash
# Test with invalid email
curl -X POST http://localhost:3000/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email": "not-an-email"}'

# Response:
{
  "statusCode": 400,
  "message": ["Invalid email address"],
  "error": "Bad Request"
}
```

### In Mobile
Type an invalid email in the login screen:
- Should see error message in real-time
- Submit button should validate before API call
- Error messages match backend exactly

---

## Summary

**Pattern**:
1. Import schema from `@faithconnect/shared`
2. Use `useZodValidation(schema)` hook
3. Call `validateField` on change
4. Show `errors.fieldName` in UI
5. Call `validate(data)` before submit

**Benefits**:
- ✅ Real-time feedback
- ✅ Same validation as backend
- ✅ Type-safe
- ✅ Consistent error messages
- ✅ Less code duplication

Apply this pattern to all forms for a polished, production-ready UX.
