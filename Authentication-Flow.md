# Authentication, Login & Dashboard Flow

This document provides a detailed temporal explanation of how authentication works across the admin area, including login, logout, and dashboard access.

## Core Components

1. **Auth Context (`auth-context.tsx`)**: Global state provider for authentication
2. **Login Page (`/admin/login/page.tsx`)**: Entry point for authentication
3. **Dashboard Page (`/admin/dashboard/page.tsx`)**: Protected area requiring authentication
4. **Supabase Client**: Backend authentication provider
5. **Next.js Middleware**: Route protection for admin pages

## Authentication States

Auth states are managed by the `useAuth` hook, which provides:
- `user`: The authenticated user object (null when not authenticated)
- `session`: The current session data (null when not authenticated)
- `isLoading`: Boolean indicating if auth state is being determined
- `signIn`: Function to authenticate users
- `signOut`: Function to end a session

## Temporal Flow: Login to Dashboard

### 1. Initial Page Load (Login)

**Time T0**: User navigates to `/admin/login`
- `LoginPage` component renders
- `useAuth` hook initializes
- Auth context begins checking for existing session via `getSession()`
- `isLoading` is `true` in auth context
- Login form is displayed to user

**Time T1**: Auth context completes initialization
- `useAuth.isLoading` becomes `false`
- If a valid session exists, `useAuth.user` and `useAuth.session` are populated
- `useEffect` in `LoginPage` checks if `user` exists
- If `user` exists, redirect to dashboard is triggered
- If no user exists, login form remains accessible

### 2. Authentication Attempt

**Time T2**: User submits login form
- `onSubmit` handler is triggered
- `isLoading` state in login component becomes `true`
- Login button shows loading state
- `signIn(email, password)` is called from auth context

**Time T3**: Auth context processes login attempt
- Auth context calls `supabaseClient.auth.signInWithPassword()`
- Supabase validates credentials
- If credentials are invalid, error is returned
- If credentials are valid, Supabase:
  1. Creates a new session
  2. Sets auth cookies in browser
  3. Returns user and session data

**Time T4**: Login component processes auth result
- If error, display error message and set `isLoading` to `false`
- If successful:
  1. Sets `auth_success=true` cookie as marker
  2. Calls `router.push('/admin/dashboard')`
  3. Browser begins navigation to dashboard

### 3. Critical Transition: Login → Dashboard

**Time T5**: Browser begins loading dashboard page
- `DashboardPage` component starts rendering
- `useAuth` hook is initialized again in this component
- Auth context state is preserved (it's global)
- **Race condition potential**: Auth context update from login might still be processing

**Time T6**: Dashboard auth check
- Dashboard component's first `useEffect` runs
- Checks `isAuthLoading` from auth context
- If `isAuthLoading` is `true`, dashboard waits and shows loading indicator
- Prevents premature auth decisions during context updates

**Time T7**: Auth context completes loading
- `isAuthLoading` becomes `false`
- Dashboard checks for recently logged-in state via `auth_success` cookie
- If cookie exists, it's cleared and dashboard will wait for auth state update
- Checks if `user` and `session` exist in auth context

**Time T8**: Dashboard proceeds based on auth state
- If authenticated (user and session exist):
  1. Marks initial auth check as complete via `setCheckedInitialAuth(true)`
  2. Begins fetching dashboard data
- If not authenticated and no recent login cookie:
  1. Redirects back to login page
- If not authenticated but recent login cookie exists:
  1. Waits for auth context to update (avoids redirect loop)

**Time T9**: Dashboard data loading
- If authenticated, dashboard requests data from Supabase
- Multiple requests run in parallel for different data types
- Loading indicator is displayed

**Time T10**: Dashboard rendering complete
- Data is received and processed
- State is updated with counts and recent activities
- Full dashboard is rendered

## Middleware Protection

In addition to client-side auth checks, Next.js middleware provides server-side protection:

**Time T0**: User attempts to access any `/admin/*` route
- Middleware intercepts the request before page rendering begins
- Checks for presence of Supabase auth cookies
- If no valid auth cookies, redirects to login page
- If valid auth cookies exist, allows the request to proceed

The middleware implementation pattern:

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create middleware Supabase client
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Get session
  const { data: { session } } = await supabase.auth.getSession();

  // Check if accessing admin routes
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/admin/login';

  // Handle auth logic
  if (isAdminRoute && !isLoginRoute && !session) {
    // Redirect to login if accessing admin route without session
    const redirectUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  // Specify routes to run middleware on
  matcher: ['/admin/:path*'],
};
```

## Logout Flow

**Time T0**: User initiates logout
- `signOut()` function from auth context is called

**Time T1**: Auth context processes logout
- Calls `supabaseClient.auth.signOut()`
- Supabase clears auth cookies
- Auth context sets `user` and `session` to `null`

**Time T2**: Application responds to auth change
- Components using `useAuth` detect the change
- Protected routes check auth state and redirect
- Dashboard redirects to login page

## Potential Issues and Solutions

### Race Conditions

**Issue**: Auth state updates may not be instant after login/logout.
**Solution**:
- `isLoading` state in auth context to delay decisions
- `auth_success` cookie to mark recent login
- `checkedInitialAuth` state to track completion of auth checks

### Redirect Loops

**Issue**: Dashboard redirecting to login, which redirects back to dashboard.
**Solution**:
- Check for `auth_success` cookie after login
- Only redirect if no user/session AND no recent login evidence
- Separate loading states for auth checks vs. data loading

### Session Expiration

**Issue**: Supabase session may expire during use.
**Solution**:
- Auth context subscribes to `onAuthStateChange` events
- Dashboard responds to auth state changes
- Auto-redirect to login when session becomes invalid

## Implementation Details

### Cookie Management

The system uses two types of cookies:
1. **Supabase Auth Cookies**: Managed by Supabase, contains encrypted session data
2. **Temporary Marker Cookies**: 
   - `auth_success=true`: Set on successful login, short TTL (60 seconds)
   - `dashboard_visited=true`: Helps prevent redirect issues

### Logging

Console logs are added at critical points to aid debugging:
- Auth state changes
- Redirect decisions
- Session validation events

### Loading States

Multiple loading states are used:
- `isAuthLoading`: Auth context determining status
- `isDataLoading`: Dashboard fetching data
- `checkedInitialAuth`: Authentication verification complete

## Authentication Security

1. **PKCE Flow**: Supabase uses PKCE (Proof Key for Code Exchange) for secure auth
2. **Token Management**: Access and refresh tokens handled by Supabase client
3. **Session Storage**: Sessions stored in HTTP-only cookies
4. **Auto Refresh**: Tokens automatically refreshed when needed

## Advanced Security Considerations

### 1. Brute Force Protection

The system implements brute force protection through:

- **Rate Limiting**: API rate limits on authentication endpoints
- **Login Attempt Tracking**: Failed login attempts are logged and monitored
- **Account Lockout**: Automatic temporary account lockout after multiple failed attempts
- **IP-based Throttling**: Progressively longer delays for repeated failed login attempts

Implementation pattern:

```typescript
// Rate limiting middleware example
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true, 
  legacyHeaders: false,
});
```

### 2. Session Security

Sessions are protected through:

- **Short-lived Sessions**: Default session duration of 1 hour
- **Refresh Tokens**: Used to obtain new access tokens without re-authentication
- **Secure Cookie Flags**: HTTP-only, Secure, and SameSite attributes
- **Session Invalidation**: Ability to force-logout users or invalidate all sessions

### 3. CSRF Protection

Cross-Site Request Forgery protection includes:

- **Built-in Supabase Protection**: Supabase Auth includes CSRF tokens
- **Same-Site Cookies**: Prevents cross-site cookie transmission
- **Token Validation**: Server validates CSRF tokens for sensitive operations

## Troubleshooting Authentication Issues

### Common Authentication Problems

1. **"User not found" error**:
   - **Possible causes**: User account doesn't exist, typo in email
   - **Solution**: Double-check email address, use password reset if needed
   - **Debugging**: Check Supabase authentication logs

2. **Session immediately expires after login**:
   - **Possible causes**: Cookie storage issues, clock synchronization problems
   - **Solution**: Check browser cookie settings, sync device time
   - **Debugging**: Monitor network requests to see if cookies are being set properly

3. **Redirect loops between login and dashboard**:
   - **Possible causes**: Race condition in auth state detection
   - **Solution**: Implement the `auth_success` cookie marker approach
   - **Debugging**: Add console logs to track auth state changes

4. **Cannot login after password reset**:
   - **Possible causes**: Password reset token expired, cache issues
   - **Solution**: Generate a new password reset token, clear browser cache
   - **Debugging**: Check token expiration in Supabase logs

### Debugging Tools

1. **Browser Developer Tools**:
   - Network tab to inspect auth request/response
   - Application tab to examine cookies and local storage
   - Console for error messages

2. **Supabase Dashboard**:
   - Authentication logs
   - User management interface
   - Manual session review

3. **Custom Logging**:
   - Add logging at critical auth state changes
   - Include timestamps for sequence debugging
   - Record auth events in a secure log

## Authentication Best Practices

1. **Password Policies**:
   - Minimum 8 characters
   - Require combination of letters, numbers, and special characters
   - Check against common password lists
   - No reuse of recent passwords

2. **Multi-Factor Authentication**:
   - Consider implementing MFA for admin accounts
   - Use TOTP (Time-based One-Time Password) for second factor
   - Provide backup recovery methods

3. **Regular Auditing**:
   - Log all admin login activity
   - Regularly review auth logs for suspicious patterns
   - Automate alerts for unusual login activity

4. **Automatic Session Termination**:
   - Implement idle timeout (auto-logout after inactivity)
   - Force session refresh on critical security changes
   - Allow admins to view and terminate their active sessions
   
5. **Security Headers**:
   - Implement proper security headers on all pages:
     - Content-Security-Policy
     - X-Content-Type-Options
     - X-Frame-Options
     - Strict-Transport-Security 