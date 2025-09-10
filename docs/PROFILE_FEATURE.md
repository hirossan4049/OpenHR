# Profile and Skill Management Feature

This document describes the profile and skill management functionality implemented for the OpenHR TMS application.

## Overview

The profile and skill management feature allows users to:
- Edit their profile information (name, bio, grade, contact, GitHub URL)
- Add, edit, and remove skills with proficiency levels and years of experience
- View their complete profile in a clean, user-friendly interface

## Features Implemented

### 1. Profile Management
- **Basic Information**: Name, bio, grade/year, contact information
- **GitHub Integration**: Link to GitHub profile
- **Validation**: Client-side and server-side validation using Zod
- **Real-time Feedback**: Character counts, validation errors, save status

### 2. Skill Management
- **Skill Addition**: Add skills with proficiency levels (1-5) and years of experience
- **Skill Levels**: Beginner, Basic, Intermediate, Advanced, Expert
- **Skill Updates**: Update existing skills' levels and experience
- **Skill Removal**: Remove skills from profile
- **Duplicate Prevention**: Prevents adding the same skill twice

### 3. User Interface
- **shadcn/ui Components**: Modern, accessible UI components
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Visual feedback during API operations
- **Error Handling**: User-friendly error messages

## Database Schema

### Extended User Model
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  // Profile information
  bio           String?
  grade         String?
  contact       String?
  githubUrl     String?
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
  userSkills    UserSkill[]
}
```

### Skill Models
```prisma
model Skill {
  id          String      @id @default(cuid())
  name        String      @unique
  category    String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  userSkills  UserSkill[]
}

model UserSkill {
  id            String   @id @default(cuid())
  userId        String
  skillId       String
  level         Int      // 1-5 scale
  yearsOfExp    Int?     // Years of experience
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  skill         Skill    @relation(fields: [skillId], references: [id], onDelete: Cascade)
  
  @@unique([userId, skillId])
}
```

## API Endpoints

### Profile Endpoints
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Skills Endpoints
- `GET /api/skills` - Get user skills
- `POST /api/skills` - Add new skill
- `PUT /api/skills/[skillId]` - Update skill
- `DELETE /api/skills/[skillId]` - Remove skill

## Components

### Profile Components
- `ProfilePage` - Main profile page with view/edit modes
- `ProfileEditForm` - Form for editing profile information
- `SkillManagement` - Component for managing skills

### UI Components
- `Button` - Styled button component
- `Input` - Text input component
- `Textarea` - Multi-line text input
- `Label` - Form label component

## Validation

All forms use Zod schemas for validation:

### Profile Schema
```typescript
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  grade: z.string().optional(),
  contact: z.string().optional(),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
```

### Skill Schema
```typescript
const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  level: z.number().min(1).max(5),
  yearsOfExp: z.number().min(0).max(50).optional(),
});
```

## Testing

### Unit Tests
Located in `src/tests/profile.test.ts`:
- Profile validation tests
- Skill validation tests
- Business logic tests
- URL validation tests

Run with: `npm test`

### E2E Tests
Located in `e2e/profile.spec.ts`:
- UI interaction tests
- Form validation tests
- Navigation tests
- User flow tests

Run with: `npm run test:e2e`

## Setup Instructions

### Database Migration
After implementing the feature, run the database migration:
```bash
bun run db:push
```

### Development
1. Start the development server:
   ```bash
   bun run dev
   ```

2. Navigate to the profile page:
   - Sign in/register first
   - Click "My Profile" on the homepage
   - Or navigate directly to `/profile`

### Testing
1. Run unit tests:
   ```bash
   npm test
   ```

2. Run E2E tests (requires development server):
   ```bash
   npm run test:e2e
   ```

3. Run linting:
   ```bash
   npm run lint
   ```

4. Check TypeScript:
   ```bash
   npm run typecheck
   ```

## Usage

### For Users

1. **Access Profile**:
   - Sign in to your account
   - Click "My Profile" on the homepage

2. **Edit Profile**:
   - Click "Edit Profile" button
   - Fill in your information
   - Click "Save Profile"

3. **Manage Skills**:
   - Scroll to the Skills section
   - Add new skills using the form
   - Update existing skills using the dropdowns
   - Remove skills using the X button

### For Developers

1. **Adding New Profile Fields**:
   - Update the Prisma schema
   - Add validation to Zod schemas
   - Update the ProfileEditForm component
   - Update API endpoints

2. **Customizing Skill Categories**:
   - Modify the Skill model in Prisma
   - Update the skill creation logic
   - Add category selection to the UI

3. **Styling Changes**:
   - Modify component styles using Tailwind CSS
   - Update shadcn/ui component variants
   - Customize the design system in components/ui/

## Security Considerations

1. **Authentication**: All endpoints require valid session
2. **Authorization**: Users can only access their own profile data
3. **Input Validation**: All inputs are validated on client and server
4. **SQL Injection**: Prevention via Prisma ORM
5. **XSS Prevention**: React's built-in escaping

## Troubleshooting

1. **Database Issues**:
   - Ensure Prisma is properly configured
   - Run `bun run db:push` to sync schema
   - Check database connectivity

2. **Authentication Issues**:
   - Verify user is signed in
   - Check session configuration
   - Ensure NextAuth.js is properly set up

3. **Validation Errors**:
   - Check browser console for detailed errors
   - Verify Zod schema definitions
   - Test with different data inputs