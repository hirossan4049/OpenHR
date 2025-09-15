# Role-Based Access Control and Tag Management

This document describes the role-based access control system and tag management features implemented for OpenHR.

## Features Overview

### 1. Role-Based Access Control

The system implements a hierarchical role-based access control with three roles:

- **ADMIN**: Full system access, can manage all users and system settings
- **MEMBER**: Standard user access, can view and interact with projects and other members
- **VIEWER**: Read-only access, limited visibility (hidden from member listings)

#### Role Hierarchy

```
ADMIN (Level 2)
  ├── Can do everything MEMBERs can do
  ├── Can create/manage VIEWER accounts
  ├── Can view VIEWER users in listings
  ├── Can manage user roles
  ├── Can manage tags and assign them to users
  └── Can access admin-only features

MEMBER (Level 1)
  ├── Can view other MEMBERs and ADMINs
  ├── Can create and manage projects
  ├── Can apply to projects
  ├── Cannot see VIEWER users
  └── Cannot access admin features

VIEWER (Level 0)
  ├── Read-only access to allowed content
  ├── Hidden from member listings
  ├── Cannot create projects or apply
  └── Limited system interaction
```

### 2. Tag Management System

Administrators can create and manage tags to organize and categorize users.

#### Tag Features

- **Tag Creation**: Create tags with custom names, colors (HEX format), and descriptions
- **Color Customization**: Use HEX color codes (e.g., #FF5733) for visual categorization
- **User Assignment**: Assign multiple tags to users for organization
- **Usage Tracking**: View how many users have each tag
- **Tag Management**: Edit, delete, and reassign tags as needed

## Database Schema

### User Model Changes

```prisma
model User {
  // ... existing fields ...
  role          String    @default("MEMBER") // ADMIN, MEMBER, VIEWER
  userTags      UserTag[]
}
```

### New Models

```prisma
model Tag {
  id          String    @id @default(cuid())
  name        String    @unique
  color       String    // HEX color code like #FF5733
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  userTags    UserTag[]
}

model UserTag {
  id        String   @id @default(cuid())
  userId    String
  tagId     String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@unique([userId, tagId])
  @@index([userId])
  @@index([tagId])
}
```

## API Endpoints

### User Role Management

#### `createViewerAccount` (Admin Only)
Creates a new read-only user account.

```typescript
input: {
  name: string
  email: string
  password: string
}
```

#### `updateUserRole` (Admin Only)
Updates a user's role. Admins cannot change their own role.

```typescript
input: {
  userId: string
  role: "ADMIN" | "MEMBER" | "VIEWER"
}
```

#### `getAllUsers` (Admin Only)
Gets all users with optional filtering by role.

```typescript
input: {
  search?: string
  role?: "ADMIN" | "MEMBER" | "VIEWER"
  limit: number
  offset: number
}
```

### Tag Management

#### `getAllTags` (Admin Only)
Gets all tags with usage statistics.

#### `createTag` (Admin Only)
Creates a new tag.

```typescript
input: {
  name: string
  color: string // HEX format: #FF5733
  description?: string
}
```

#### `updateTag` (Admin Only)
Updates an existing tag.

```typescript
input: {
  id: string
  name: string
  color: string
  description?: string
}
```

#### `deleteTag` (Admin Only)
Deletes a tag and removes it from all users.

```typescript
input: {
  id: string
}
```

#### `assignTagToUser` (Admin Only)
Assigns a tag to a user.

```typescript
input: {
  userId: string
  tagId: string
}
```

#### `removeTagFromUser` (Admin Only)
Removes a tag from a user.

```typescript
input: {
  userId: string
  tagId: string
}
```

### Modified Endpoints

#### `getMembers` (Public)
Now filters out VIEWER role users for non-admin users.
- **ADMIN users**: See all users (ADMIN, MEMBER, VIEWER)
- **MEMBER users**: See only ADMIN and MEMBER users
- **VIEWER users**: See only ADMIN and MEMBER users

#### `getMemberById` (Public)
Now prevents non-admin users from viewing VIEWER role user profiles.

## Security Features

### Permission Checks
- All admin endpoints require ADMIN role
- User role validation on every admin operation
- Prevention of self-role modification by admins
- Strict input validation for all operations

### Data Validation
- Email uniqueness for new accounts
- Tag name uniqueness
- HEX color format validation (`/^#[0-9A-Fa-f]{6}$/`)
- Password minimum length (6 characters)
- Input sanitization and length limits

### Access Control
- VIEWER users are hidden from member listings for non-admins
- VIEWER user profiles are not accessible to non-admins
- Tag management is restricted to admins only
- Role hierarchy prevents privilege escalation

## Usage Examples

### Creating a Viewer Account (Admin Only)

```typescript
const result = await trpc.admin.createViewerAccount.mutate({
  name: "External Consultant",
  email: "consultant@external.com",
  password: "securepassword123"
});
```

### Creating and Assigning Tags (Admin Only)

```typescript
// Create a tag
const tag = await trpc.admin.createTag.mutate({
  name: "Frontend Developer",
  color: "#FF5733",
  description: "Frontend development specialists"
});

// Assign tag to user
await trpc.admin.assignTagToUser.mutate({
  userId: "user123",
  tagId: tag.id
});
```

### Role Management (Admin Only)

```typescript
// Update user role
await trpc.admin.updateUserRole.mutate({
  userId: "user123",
  role: "VIEWER"
});

// Get all users with filtering
const users = await trpc.admin.getAllUsers.query({
  role: "VIEWER",
  limit: 20,
  offset: 0
});
```

## Internationalization

The system includes full internationalization support for:
- **English**: Complete translations for all features
- **Japanese**: Complete translations for all features

Translation keys are organized under:
- `AdminUserManagement.*` - User management features
- `AdminTagManagement.*` - Tag management features
- `AdminDashboard.*` - Updated dashboard features

## Error Handling

### Common Error Scenarios
- **Permission denied**: Non-admin users attempting admin operations
- **Email conflicts**: Creating accounts with existing email addresses
- **Self-modification**: Admins trying to change their own role
- **Invalid data**: Malformed HEX colors, invalid email formats
- **Resource conflicts**: Duplicate tag names, non-existent users/tags

### Error Messages
All errors include:
- Clear, user-friendly messages
- Internationalized text (English/Japanese)
- Proper HTTP status codes
- Detailed validation feedback

## Testing

Comprehensive test coverage includes:
- **Role-based access control**: Permission validation and hierarchy
- **Input validation**: Schema validation for all inputs
- **API endpoint logic**: Mocked database operations and business logic
- **Security scenarios**: Unauthorized access attempts and edge cases
- **Integration tests**: End-to-end workflow validation

Run tests with:
```bash
bun run test
```

## Migration

To apply the database changes:

1. **Development Environment**:
   ```bash
   bun run db:push
   ```

2. **Production Environment**:
   ```bash
   bun run db:migrate
   ```

The migration adds:
- `role` column to User table (defaults to "MEMBER")
- `Tag` table with constraints
- `UserTag` junction table with proper indexes
- Updates existing users to have explicit MEMBER role

## Security Considerations

### Data Privacy
- VIEWER users are completely hidden from non-admin users
- Email addresses are not exposed in user listings
- Password hashing uses bcrypt with appropriate rounds

### Access Control
- Hierarchical role system prevents privilege escalation
- Admin operations require explicit role validation
- Session-based authentication for all operations

### Input Validation
- Server-side validation for all inputs
- XSS prevention through proper sanitization
- SQL injection prevention through Prisma ORM

### Audit Trail
- Created/updated timestamps on all entities
- User activity tracking through session management
- Tag assignment history preservation

## Future Enhancements

Potential improvements for the system:
- **Audit logging**: Track all admin operations
- **Bulk operations**: Bulk tag assignment/removal
- **Tag hierarchies**: Nested tag categories
- **Custom permissions**: Fine-grained permission system
- **User import/export**: CSV-based user management
- **Tag statistics**: Usage analytics and reporting