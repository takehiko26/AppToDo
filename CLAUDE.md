# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
ReactベースのToDoアプリケーション。FrontEnd/BackEnd分離アーキテクチャ、TDD-Firstアプローチを採用。

### Tech Stack
- **FrontEnd**: Vite + React + TypeScript
- **BackEnd**: Node.js + Express + TypeScript
- **Database**: SQLite
- **Testing**: Vitest (FrontEnd) / Jest (BackEnd)

## Development Commands

### FrontEnd (Root Directory)
- `npm run dev` - 開発サーバー起動（localhost:5173）
- `npm run build` - 本番ビルド
- `npm run preview` - ビルド結果のプレビュー
- `npm run lint` - ESLint
- `npm run test` - Vitest（watch mode）
- `npm run test:run` - Vitest（1回のみ）
- `npm run test:coverage` - カバレッジ付きテスト

### BackEnd (server/ Directory)
- `cd server && npm run dev` - APIサーバー起動（localhost:3001）
- `cd server && npm run build` - TypeScriptコンパイル
- `cd server && npm start` - 本番起動
- `cd server && npm run test` - Jest（watch mode）
- `cd server && npm run test:run` - Jest（1回のみ）
- `cd server && npm run test:coverage` - カバレッジ付きテスト

### 起動手順
1. BackEndサーバー起動: `cd server && npm run dev`
2. FrontEnd起動: `npm run dev`
3. ブラウザで http://localhost:5173 にアクセス

## Architecture

### Directory Structure
```
AppToDo/
├── src/                  # FrontEnd
│   ├── api/              # API通信層
│   │   └── todoApi.ts
│   ├── components/       # Reactコンポーネント
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   └── TodoForm.tsx
│   ├── hooks/            # カスタムフック
│   │   └── useTodos.ts   # API連携ToDo管理
│   ├── types/            # TypeScript型定義
│   │   └── todo.ts
│   └── __tests__/        # FrontEndテスト
├── server/               # BackEnd
│   ├── src/
│   │   ├── routes/       # Expressルート定義
│   │   ├── controllers/  # リクエストハンドラ
│   │   ├── repositories/ # データアクセス層
│   │   ├── models/       # 型定義
│   │   ├── database/     # DB接続・マイグレーション
│   │   ├── app.ts        # Expressアプリ設定
│   │   └── index.ts      # エントリーポイント
│   └── __tests__/        # BackEndテスト
│       ├── unit/         # ユニットテスト
│       └── integration/  # API統合テスト
├── .env                  # 環境変数（gitignore対象）
└── .env.example          # 環境変数テンプレート
```

### Key Design Principles
- **FrontEnd/BackEnd分離**: REST APIで通信
- **状態管理**: `useTodos`フックでAPI連携（loading/error状態管理）
- **関心の分離**: UI / API通信 / ビジネスロジック / データアクセス
- **型安全性**: 全層でTypeScript型定義を適用

### API Endpoints
- `GET /api/todos` - 全ToDo取得
- `POST /api/todos` - ToDo作成 (body: `{ text: string }`)
- `PUT /api/todos/:id` - ToDo更新 (body: `{ text?, completed? }`)
- `DELETE /api/todos/:id` - ToDo削除

### Testing Strategy
- **FrontEnd**: Vitest + React Testing Library
- **BackEnd**: Jest + Supertest（API統合テスト）
- **TDD徹底**: Red → Green → Refactor
- **カバレッジ目標**: >= 80%

## Development Workflow
1. テストを先に書く（Red）
2. 最小限の実装でテストをパス（Green）
3. リファクタリング（Refactor）
4. 必ずコミット前にテスト実行・カバレッジ確認

## Environment Variables
- `VITE_API_URL`: API BaseURL（デフォルト: `http://localhost:3001`）