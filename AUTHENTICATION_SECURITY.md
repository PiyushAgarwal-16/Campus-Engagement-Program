# Authentication Security

## Overview
The Campus Engagement Platform implements strict authentication controls to ensure only authorized users can access the system.

## Authentication Rules

### 1. Firebase Authentication (Primary)
- **Real Firebase Users Only**: Users must have valid accounts in your Firebase project
- **No Random Emails**: Random email addresses will be rejected
- **Proper Password Validation**: Passwords must meet Firebase security requirements
- **Account Verification**: Only verified Firebase accounts can sign in

### 2. Demo Account (Fallback)
- **Single Demo Account**: Only `demo@university.edu` with password `demo123`
- **Limited Scope**: Demo mode is only available when Firebase is unavailable
- **Network Failure Only**: Demo fallback only triggers on specific Firebase errors:
  - `auth/network-request-failed`
  - `auth/invalid-api-key`
  - `auth/auth-domain-config-required`
  - `auth/operation-not-allowed`

### 3. Security Measures

#### Rejected Authentication Attempts
- Random email addresses
- Wrong passwords for existing accounts
- Unregistered email addresses
- Weak passwords (less than 6 characters)
- Invalid email formats

#### Logging and Monitoring
- All authentication attempts are logged to console
- Successful and failed logins are tracked
- User authorization is validated on every state change

#### Browser Security
- Local storage is cleared for unauthorized users
- Session management prevents unauthorized access
- Automatic logout on authentication failures

## Implementation Details

### AuthContext Security Features
```javascript
// Only allows specific demo account or real Firebase users
const isAuthorizedUser = (user) => {
  if (!user) return false;
  
  // Allow demo user
  if (user.email === 'demo@university.edu' && user.id === 'demo-user-123') {
    return true;
  }
  
  // Allow Firebase users (they have proper uid from Firebase)
  if (user.id && user.id !== 'demo-user-123' && user.email) {
    return true;
  }
  
  return false;
};
```

### Login Validation
- Email format validation using regex
- Password strength requirements
- Duplicate password confirmation for signup
- Input sanitization and validation

### Error Handling
- Specific error messages for different failure types
- No information leakage about existing accounts
- Rate limiting protection (Firebase built-in)
- Network error handling

## Testing Authentication

### Valid Test Cases
1. **Real Firebase User**: Create account through Firebase console or signup form
2. **Demo Account**: Use `demo@university.edu` / `demo123` when Firebase is unavailable

### Invalid Test Cases (Should Be Rejected)
1. **Random Email**: `test@example.com` with any password
2. **Wrong Password**: Correct email with incorrect password
3. **Weak Password**: Password less than 6 characters
4. **Invalid Email**: Malformed email addresses
5. **Empty Fields**: Missing email or password

## Firebase Setup Requirements

To ensure proper security:

1. **Authentication Methods**: Enable Email/Password in Firebase Console
2. **Security Rules**: Configure appropriate Firestore security rules
3. **Domain Authorization**: Add your domain to authorized domains
4. **API Key Protection**: Keep Firebase config secure

## Troubleshooting

### If Random Emails Are Being Accepted
1. Check Firebase Console for unexpected user registrations
2. Verify Firebase authentication is properly configured
3. Check browser console for authentication logs
4. Ensure Firebase security rules are restrictive
5. Clear browser cache and localStorage

### Common Issues
- **Network Problems**: May trigger demo mode fallback
- **Firebase Misconfiguration**: Could cause authentication bypass
- **Browser Caching**: Old authentication state might persist
- **Security Rules**: Overly permissive Firestore rules

## Monitoring and Alerts

Monitor the browser console for these log messages:
- `Firebase login successful for: [email]`
- `Firebase login failed: [error]`
- `Authentication rejected for: [email]`
- `Authorized Firebase user set: [email]`
- `Unauthorized Firebase user rejected: [email]`

Any unexpected authentication successes should be investigated immediately.
