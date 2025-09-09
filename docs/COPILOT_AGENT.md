# Copilot Agent Documentation for OpenHR

このドキュメントでは、OpenHRプロジェクトでGitHub CopilotとAIエージェントを効果的に活用する方法について説明します。

## 目次

- [概要](#概要)
- [プロジェクト設定](#プロジェクト設定)
- [T3スタック向けCopilotベストプラクティス](#t3スタック向けcopilotベストプラクティス)
- [HR特化型プロンプト戦略](#hr特化型プロンプト戦略)
- [コードパターンと例](#コードパターンと例)
- [AI統合ガイドライン](#ai統合ガイドライン)

## 概要

OpenHRは、T3スタック（Next.js、TypeScript、Prisma、tRPC、NextAuth、Tailwind CSS）を使用したモダンなHRアプリケーションです。このドキュメントでは、GitHub CopilotやAIエージェントを使用して開発効率を向上させる方法を説明します。

## プロジェクト設定

### Copilot最適化のための環境設定

1. **GitHub Copilot拡張機能の設定**
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

2. **プロジェクト固有の設定**
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

### 開発環境の準備

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env

# データベースの初期化
npm run db:push

# 開発サーバーの起動
npm run dev
```

## T3スタック向けCopilotベストプラクティス

### 1. tRPCルーターの作成

効果的なプロンプト例：
```typescript
// Copilotに以下のようにコメントして指示
// Create a tRPC router for employee management with CRUD operations
// Include procedures for: create, update, delete, getById, getAll
// Use Zod schemas for input validation

export const employeeRouter = createTRPCRouter({
  // Copilotがここから自動生成
});
```

### 2. Prismaスキーマの拡張

```prisma
// Add HR-specific models for employee management
// Include: Employee, Department, Position, Attendance, Leave

model Employee {
  // Copilotが適切なフィールドを提案
}
```

### 3. React Hooksパターン

```typescript
// Custom hook for employee data management with optimistic updates
// Include: CRUD operations, loading states, error handling

export function useEmployee(id: string) {
  // CopilotがuseQueryとuseMutationを含む完全な実装を提案
}
```

## HR特化型プロンプト戦略

### 従業員管理機能

1. **従業員データの管理**
   ```typescript
   // Create employee profile component with form validation
   // Fields: name, email, department, position, hire date, salary
   // Include file upload for profile picture and documents
   ```

2. **勤怠管理システム**
   ```typescript
   // Implement attendance tracking system
   // Features: clock in/out, break tracking, overtime calculation
   // Integration with calendar and leave management
   ```

3. **休暇申請ワークフロー**
   ```typescript
   // Create leave request workflow with approval system
   // Types: annual leave, sick leave, maternity/paternity leave
   // Email notifications and calendar integration
   ```

### パフォーマンス評価

```typescript
// Performance review system with goal tracking
// 360-degree feedback, self-assessment, manager evaluation
// Chart visualization with recharts integration
```

## コードパターンと例

### 1. tRPCプロシージャのパターン

```typescript
// HR業務に特化したtRPCプロシージャの例
export const hrRouter = createTRPCRouter({
  // 従業員関連
  employee: createTRPCRouter({
    create: protectedProcedure
      .input(createEmployeeSchema)
      .mutation(async ({ ctx, input }) => {
        // 実装をCopilotに生成させる
      }),
    
    getAll: protectedProcedure
      .input(employeeFilterSchema)
      .query(async ({ ctx, input }) => {
        // 実装をCopilotに生成させる
      }),
  }),
  
  // 勤怠関連
  attendance: createTRPCRouter({
    clockIn: protectedProcedure
      .mutation(async ({ ctx }) => {
        // 実装をCopilotに生成させる
      }),
  }),
});
```

### 2. Reactコンポーネントのパターン

```tsx
// HR dashboard component with data visualization
interface HRDashboardProps {
  // プロパティをCopilotに定義させる
}

export function HRDashboard({ }: HRDashboardProps) {
  // Copilotがfull componentを生成
  return (
    // JSX structure for HR dashboard
  );
}
```

### 3. バリデーションスキーマのパターン

```typescript
// Zod schemas for HR data validation
export const employeeSchema = z.object({
  // Copilotが適切なスキーマを生成
});

export const attendanceSchema = z.object({
  // 勤怠データのスキーマ
});
```

## AI統合ガイドライン

### 1. コード品質の維持

- **型安全性**: TypeScriptの型システムを最大限活用
- **エラーハンドリング**: tRPCのエラーハンドリングパターンを統一
- **テスト**: Jest/Vitestを使用したユニットテスト

### 2. セキュリティ考慮事項

```typescript
// セキュリティ機能の実装例
// - 認証/認可の実装
// - データアクセス制御
// - 監査ログ機能

export const secureHRProcedure = protectedProcedure
  .use(hrPermissionMiddleware)
  .use(auditLogMiddleware);
```

### 3. パフォーマンス最適化

```typescript
// データベースクエリの最適化
// - 適切なインデックス設定
// - ページネーション実装
// - キャッシュ戦略

export const optimizedEmployeeQuery = protectedProcedure
  .input(paginationSchema)
  .query(async ({ ctx, input }) => {
    // 最適化されたクエリ実装
  });
```

### 4. 国際化対応

```typescript
// i18n設定とメッセージ管理
// 日本語・英語対応のメッセージ
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

## 実装例

### 完全な従業員管理機能

```typescript
// 1. Prismaスキーマ
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

// 2. tRPCルーター
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

// 3. Reactコンポーネント
export function EmployeeList() {
  const { data: employees, isLoading } = api.employee.getAll.useQuery({});
  
  if (isLoading) return <div>読み込み中...</div>;
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">従業員一覧</h2>
      <div className="grid gap-4">
        {employees?.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
}
```

## 次のステップ

1. **AIチャット機能の統合**: OpenAI APIを使用したHRアシスタント
2. **自動化ワークフロー**: 定期的なレポート生成
3. **予測分析**: 従業員のパフォーマンス予測
4. **データビジュアライゼーション**: HR KPIダッシュボード

このドキュメントを参考に、OpenHRプロジェクトでAIを活用した効率的な開発を進めてください。