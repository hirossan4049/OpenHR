# GitHub Copilot Instructions

This is a T3 Stack project. Please follow the existing conventions and patterns in the codebase.

## Key Technologies

- **Package Manager:** This project uses `bun` instead of `npm` or `yarn`. Please use `bun` for all package management commands (e.g., `bun install`, `bun add`). Scripts should be run with `bun run ...`.
- **Framework:** Next.js with App Router.
- **Authentication:** NextAuth.js
- **ORM:** Prisma
- **Database:** SQLite
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- npxではなくbunxを使用。
- shadcnでGitHub風のUI.
- next-intlを使用している。文言はmessages/*.jsonに追加。

## Development

To start the development server, run:
```bash
bun run dev
```

To push database changes, run:
```bash
bun run db:push
```

When adding new environment variables, remember to update `/src/env.js` and `.env.example`.


## ALL
コメントやその他すべて日本語を使用してください。

## PRを提出する場合
日本語を使用し、どんな変更があったかわかりやすく、説明する。

## レビューをする場合
すべてのレビューコメントの先頭に、以下のいずれかのプレフィックスを必ず付けてください。

[must]  : 修正必須（仕様・バグ・セキュリティ・重大な可読性問題）
[want]  : 修正を強く推奨（設計・保守性・将来リスク）
[imo]   : 個人的意見（多くの場合は同意されそう）
[imho]  : 個人的意見（好みが分かれる可能性あり）
[nits]  : 細かい指摘（スタイル・表記揺れ等）
[info]  : 情報共有のみ（修正不要）
[ask]   : 質問・意図確認

ルール:
- 指摘は簡潔かつ具体的に書く
- 可能であれば理由を1行で補足する
- 修正案がある場合はコード例を示す
- 不要な感情表現や冗長な前置きは書かない
