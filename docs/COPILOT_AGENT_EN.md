# Copilot Agent Documentation for OpenHR (English)

This document explains how to effectively use GitHub Copilot and AI agents in the OpenHR project.

## Table of Contents

- [Overview](#overview)
- [Project Setup](#project-setup)
- [T3 Stack Copilot Best Practices](#t3-stack-copilot-best-practices)
- [HR-Specific Prompt Strategies](#hr-specific-prompt-strategies)
- [Code Patterns and Examples](#code-patterns-and-examples)
- [AI Integration Guidelines](#ai-integration-guidelines)

## Overview

OpenHR is a modern HR application built with the T3 stack (Next.js, TypeScript, Prisma, tRPC, NextAuth, Tailwind CSS). This document explains how to use GitHub Copilot and AI agents to improve development efficiency.

## Project Setup

### Environment Configuration for Copilot Optimization

1. **GitHub Copilot Extension Settings**
   ```json
   // .vscode/settings.json
   {
     "github.copilot.enable": {
       "*": true,
       "yaml": false,
       "plaintext": false,
       "markdown": true,
       "typescript": true,
       "typescriptreact": true
     },
     "github.copilot.preferredAccount": "your-account",
     "typescript.suggest.includeCompletionsForModuleExports": true
   }
   ```

2. **Project-Specific Configuration**
   ```json
   // .vscode/copilot.json
   {
     "context": {
       "includes": [
         "src/**/*.ts",
         "src/**/*.tsx",
         "prisma/schema.prisma",
         "package.json"
       ]
     }
   }
   ```

### Development Environment Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Initialize database
npm run db:push

# Start development server
npm run dev
```

## T3 Stack Copilot Best Practices

### 1. Creating tRPC Routers

Effective prompt examples:
```typescript
// Instruct Copilot with comments like this:
// Create a tRPC router for employee management with CRUD operations
// Include procedures for: create, update, delete, getById, getAll
// Use Zod schemas for input validation

export const employeeRouter = createTRPCRouter({
  // Copilot will auto-generate from here
});
```

### 2. Extending Prisma Schema

```prisma
// Add HR-specific models for employee management
// Include: Employee, Department, Position, Attendance, Leave

model Employee {
  // Copilot will suggest appropriate fields
}
```

### 3. React Hook Patterns

```typescript
// Custom hook for employee data management with optimistic updates
// Include: CRUD operations, loading states, error handling

export function useEmployee(id: string) {
  // Copilot will suggest complete implementation with useQuery and useMutation
}
```

## HR-Specific Prompt Strategies

### Employee Management Features

1. **Employee Data Management**
   ```typescript
   // Create employee profile component with form validation
   // Fields: name, email, department, position, hire date, salary
   // Include file upload for profile picture and documents
   ```

2. **Attendance Management System**
   ```typescript
   // Implement attendance tracking system
   // Features: clock in/out, break tracking, overtime calculation
   // Integration with calendar and leave management
   ```

3. **Leave Request Workflow**
   ```typescript
   // Create leave request workflow with approval system
   // Types: annual leave, sick leave, maternity/paternity leave
   // Email notifications and calendar integration
   ```

### Performance Evaluation

```typescript
// Performance review system with goal tracking
// 360-degree feedback, self-assessment, manager evaluation
// Chart visualization with recharts integration
```

## Code Patterns and Examples

### 1. tRPC Procedure Patterns

```typescript
// Examples of tRPC procedures specialized for HR operations
export const hrRouter = createTRPCRouter({
  // Employee-related
  employee: createTRPCRouter({
    create: protectedProcedure
      .input(createEmployeeSchema)
      .mutation(async ({ ctx, input }) => {
        // Let Copilot generate the implementation
      }),
    
    getAll: protectedProcedure
      .input(employeeFilterSchema)
      .query(async ({ ctx, input }) => {
        // Let Copilot generate the implementation
      }),
  }),
  
  // Attendance-related
  attendance: createTRPCRouter({
    clockIn: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Let Copilot generate the implementation
      }),
  }),
});
```

### 2. React Component Patterns

```tsx
// HR dashboard component with data visualization
interface HRDashboardProps {
  // Let Copilot define properties
}

export function HRDashboard({ }: HRDashboardProps) {
  // Copilot will generate full component
  return (
    // JSX structure for HR dashboard
  );
}
```

### 3. Validation Schema Patterns

```typescript
// Zod schemas for HR data validation
export const employeeSchema = z.object({
  // Copilot will generate appropriate schema
});

export const attendanceSchema = z.object({
  // Attendance data schema
});
```

## AI Integration Guidelines

### 1. Maintaining Code Quality

- **Type Safety**: Maximize use of TypeScript's type system
- **Error Handling**: Unify tRPC error handling patterns
- **Testing**: Unit testing with Jest/Vitest

### 2. Security Considerations

```typescript
// Examples of security feature implementation
// - Authentication/authorization implementation
// - Data access control
// - Audit logging functionality

export const secureHRProcedure = protectedProcedure
  .use(hrPermissionMiddleware)
  .use(auditLogMiddleware);
```

### 3. Performance Optimization

```typescript
// Database query optimization
// - Appropriate index settings
// - Pagination implementation
// - Caching strategies

export const optimizedEmployeeQuery = protectedProcedure
  .input(paginationSchema)
  .query(async ({ ctx, input }) => {
    // Optimized query implementation
  });
```

### 4. Internationalization Support

```typescript
// i18n configuration and message management
// Japanese and English message support
const hrMessages = {
  ja: {
    employee: {
      created: "従業員が作成されました",
      updated: "従業員情報が更新されました",
    }
  },
  en: {
    employee: {
      created: "Employee created successfully",
      updated: "Employee information updated",
    }
  }
};
```

## Implementation Examples

### Complete Employee Management Feature

```typescript
// 1. Prisma Schema
model Employee {
  id          String   @id @default(cuid())
  name        String
  email       String   @unique
  departmentId String
  positionId  String
  hireDate    DateTime
  salary      Decimal?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  department  Department @relation(fields: [departmentId], references: [id])
  position    Position   @relation(fields: [positionId], references: [id])
  attendances Attendance[]
  leaves      Leave[]
}

// 2. tRPC Router
export const employeeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.employee.create({
        data: input,
        include: {
          department: true,
          position: true,
        },
      });
    }),
    
  getAll: protectedProcedure
    .input(employeeFilterSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.employee.findMany({
        where: {
          isActive: input.includeInactive ? undefined : true,
          departmentId: input.departmentId,
        },
        include: {
          department: true,
          position: true,
        },
        orderBy: { name: 'asc' },
      });
    }),
});

// 3. React Component
export function EmployeeList() {
  const { data: employees, isLoading } = api.employee.getAll.useQuery({});
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Employee List</h2>
      <div className="grid gap-4">
        {employees?.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
}
```

## Next Steps

1. **AI Chat Feature Integration**: HR assistant using OpenAI API
2. **Automated Workflows**: Periodic report generation
3. **Predictive Analytics**: Employee performance prediction
4. **Data Visualization**: HR KPI dashboard

Use this documentation as a reference to proceed with efficient AI-powered development in the OpenHR project.