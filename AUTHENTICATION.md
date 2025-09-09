# Authentication Implementation

This document describes the user authentication system implemented for the OpenHR TMS application.

## Overview

The authentication system supports multiple authentication methods:
- **Email/Password** - Traditional username/password authentication
- **OAuth Providers** - GitHub, Google, and Discord social authentication
- **Session Management** - NextAuth.js handles session persistence

## Features Implemented

### 1. User Registration
- Registration form with validation
- Name, email, password, and password confirmation fields
- Client-side and server-side validation using Zod
- Password hashing using bcrypt
- Duplicate email prevention

### 2. User Login
- Login form with email/password fields
- OAuth login buttons for GitHub, Google, and Discord
- Error handling and validation feedback
- Auto-redirect after successful authentication

### 3. Authentication Providers

#### Credentials Provider
- Email/password authentication
- Password verification using bcrypt
- Secure password hashing (12 rounds)

#### OAuth Providers
- **GitHub** - Social login via GitHub
- **Google** - Social login via Google
- **Discord** - Social login via Discord

### 4. Security Features
- Password hashing with bcrypt (12 rounds)
- Session management via NextAuth.js
- CSRF protection built into NextAuth.js
- SQL injection prevention via Prisma ORM
- Input validation with Zod schemas

## Database Schema

The user authentication uses the following Prisma models:

```prisma
model User {
    id            String    @id @default(cuid())
    name          String?
    email         String?   @unique
    emailVerified DateTime?
    image         String?
    password      String?   // For email/password authentication
    accounts      Account[]
    sessions      Session[]
    posts         Post[]
}

model Account {
    // NextAuth.js Account model for OAuth providers
}

model Session {
    // NextAuth.js Session model
}

model VerificationToken {
    // NextAuth.js VerificationToken model
}
```

## API Endpoints

### POST /api/auth/register
Creates a new user account with email/password.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### NextAuth.js Endpoints
- `GET/POST /api/auth/signin` - Sign in page and handling
- `GET/POST /api/auth/signout` - Sign out handling  
- `GET /api/auth/callback/[provider]` - OAuth callback handling
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - CSRF token

## Components

### AuthForms
Main authentication component that toggles between login and registration modes.

### LoginForm
- Email/password login form
- OAuth provider buttons
- Form validation and error handling

### RegisterForm  
- User registration form
- Password confirmation validation
- Account creation and auto-login

## Environment Variables

The following environment variables are required:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

## Testing

The authentication system includes comprehensive tests covering:

- Password hashing and verification
- Registration and login validation
- Component rendering and behavior
- API endpoint functionality
- OAuth provider configuration

Run tests with:
```bash
npm test
```

## Usage

### For Users

1. **Registration:**
   - Navigate to the home page
   - Click "Don't have an account? Sign up"
   - Fill in name, email, password, and confirm password
   - Click "Create Account"

2. **Login:**
   - Navigate to the home page
   - Enter email and password, then click "Sign In"
   - Or click on GitHub, Google, or Discord buttons for OAuth login

3. **Logout:**
   - Click the "Sign out" button when authenticated

### For Developers

1. **Adding New OAuth Providers:**
   - Install the provider package: `npm install next-auth/providers/[provider]`
   - Add provider configuration to `src/server/auth/config.ts`
   - Add environment variables to `src/env.js`
   - Update `.env.example` with new variables

2. **Customizing Validation:**
   - Update Zod schemas in form components
   - Modify validation logic in API endpoints

3. **Styling:**
   - Components use Tailwind CSS classes
   - Modify class names in component files to change appearance

## Security Considerations

1. **Password Security:**
   - Passwords are hashed with bcrypt using 12 rounds
   - Never stored in plain text
   - Minimum 6 character requirement

2. **Session Security:**
   - Sessions managed by NextAuth.js with secure defaults
   - HTTP-only cookies
   - CSRF protection enabled

3. **Input Validation:**
   - All inputs validated on client and server
   - SQL injection prevention via Prisma
   - XSS prevention via React's built-in escaping

4. **OAuth Security:**
   - OAuth flows handled by NextAuth.js
   - Secure token storage
   - Provider-specific security measures

## Troubleshooting

1. **Build Issues:**
   - Ensure all environment variables are set
   - Check that OAuth provider credentials are valid
   - Verify database connectivity

2. **Authentication Issues:**
   - Check console for validation errors
   - Verify OAuth app configuration
   - Ensure database schema is up to date

3. **Development Setup:**
   - Run `npm install` to install dependencies
   - Set up `.env` file with required variables
   - Run `npx prisma generate` to generate Prisma client
   - Run `npx prisma db push` to sync database schema