# Todo App

ReactベースのToDoアプリケーション。FrontEnd/BackEnd分離アーキテクチャで構築。

## Tech Stack

- **FrontEnd**: Vite + React + TypeScript
- **BackEnd**: Node.js + Express + TypeScript
- **Database**: SQLite
- **Testing**: Vitest (FrontEnd) / Jest (BackEnd)

## Features

- ✅ ToDoの追加・削除
- ✅ 完了/未完了の切り替え
- ✅ データベース永続化（SQLite）
- ✅ ローディング・エラー表示
- ✅ レスポンシブデザイン
- ✅ TDD-Firstで開発（カバレッジ >= 80%）

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x

## Setup

### 1. パッケージインストール

```bash
# FrontEndのインストール
npm install

# BackEndのインストール
cd server
npm install
cd ..
```

### 2. 環境変数設定

```bash
# .envファイルを作成（既に.env.exampleが用意されている）
cp .env.example .env
```

デフォルト設定:
```
VITE_API_URL=http://localhost:3001
```

## Development

### 起動方法

ターミナルを2つ開いて、それぞれで実行：

**ターミナル1 (BackEnd):**
```bash
cd server
npm run dev
```
→ APIサーバーが http://localhost:3001 で起動

**ターミナル2 (FrontEnd):**
```bash
npm run dev
```
→ 開発サーバーが http://localhost:5173 で起動

ブラウザで http://localhost:5173 にアクセス

## Testing

### FrontEnd テスト

```bash
# Watch mode
npm run test

# 1回のみ実行
npm run test:run

# カバレッジ付き
npm run test:coverage
```

### BackEnd テスト

```bash
cd server

# Watch mode
npm run test

# 1回のみ実行
npm run test:run

# カバレッジ付き
npm run test:coverage
```

## Build

### FrontEnd

```bash
npm run build
npm run preview
```

### BackEnd

```bash
cd server
npm run build
npm start
```

## API Endpoints

- `GET /api/todos` - 全ToDo取得
- `POST /api/todos` - ToDo作成
  - Body: `{ "text": "Todo text" }`
- `PUT /api/todos/:id` - ToDo更新
  - Body: `{ "text"?: "Updated text", "completed"?: true }`
- `DELETE /api/todos/:id` - ToDo削除

## Project Structure

```
AppToDo/
├── src/                  # FrontEnd
│   ├── api/              # API通信層
│   ├── components/       # Reactコンポーネント
│   ├── hooks/            # カスタムフック
│   ├── types/            # 型定義
│   └── __tests__/        # テスト
├── server/               # BackEnd
│   ├── src/
│   │   ├── routes/       # APIルート
│   │   ├── controllers/  # コントローラー
│   │   ├── repositories/ # データアクセス層
│   │   ├── models/       # 型定義
│   │   └── database/     # DB接続
│   └── __tests__/        # テスト
└── .env                  # 環境変数
```

## Development Workflow

このプロジェクトはTDD-Firstアプローチで開発されています：

1. **Red**: テストを先に書く（失敗する）
2. **Green**: 最小限の実装でテストをパス
3. **Refactor**: コードを改善

コミット前には必ずテストを実行してください。

## License

ISC
