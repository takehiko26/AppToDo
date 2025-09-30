# Firebase デプロイ環境構築ガイド

このドキュメントは、React + Express アプリケーションを Firebase (Hosting + Cloud Functions) にデプロイするための完全な手順をまとめたものです。

## 目次

1. [前提条件](#前提条件)
2. [Firebase プロジェクト作成](#firebase-プロジェクト作成)
3. [Firestore データベース作成](#firestore-データベース作成)
4. [Google Cloud API 有効化](#google-cloud-api-有効化)
5. [サービスアカウント設定](#サービスアカウント設定)
6. [GitHub Secrets 設定](#github-secrets-設定)
7. [プロジェクト設定ファイル](#プロジェクト設定ファイル)
8. [デプロイ実行](#デプロイ実行)
9. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

- Node.js 20.x 以上
- Firebase CLI: `npm install -g firebase-tools`
- Google アカウント
- GitHub リポジトリ
- プロジェクトに請求先アカウント（Billing Account）が設定されていること

---

## Firebase プロジェクト作成

### 1. Firebase コンソールでプロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `apptodo`）
4. Google Analytics の設定（オプション）
5. プロジェクトIDをメモ（例: `apptodo-75770`）

### 2. Firebase CLI でログイン

```bash
firebase login
```

### 3. プロジェクトを初期化

```bash
firebase init
```

以下を選択：
- ✓ Hosting: Configure files for Firebase Hosting
- ✓ Functions: Configure a Cloud Functions directory

---

## Firestore データベース作成

### 1. Firestore コンソールでデータベース作成

1. [Firestore コンソール](https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore) を開く
2. 「データベースを作成」をクリック
3. モード選択:
   - **本番環境モード**: セキュリティルールを後で設定
   - **テストモード**: 開発用（30日間アクセス可能）
4. ロケーション: `us-central1` (Functions と同じリージョン推奨)
5. 「有効にする」をクリック

### 2. セキュリティルール設定（本番環境の場合）

Firestore のルールタブで以下を設定:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // 開発用（本番では適切に制限）
    }
  }
}
```

---

## Google Cloud API 有効化

以下のAPIを有効化する必要があります：

### 必須API一覧

1. **Cloud Functions API**
   - https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com

2. **Cloud Build API**
   - https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com

3. **Artifact Registry API**
   - https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com

4. **Firebase Extensions API**
   - https://console.cloud.google.com/apis/library/firebaseextensions.googleapis.com

5. **Cloud Billing API**
   - https://console.cloud.google.com/apis/library/cloudbilling.googleapis.com

### 有効化手順

各URLにアクセスして「**有効にする**」ボタンをクリック

---

## サービスアカウント設定

Firebase Cloud Functions は2つのサービスアカウントを使用します：

### 1. Firebase Admin SDK サービスアカウント

**サービスアカウント名**: `firebase-adminsdk-xxxxx@PROJECT_ID.iam.gserviceaccount.com`

#### 必要な権限（IAMロール）

1. [IAM コンソール](https://console.cloud.google.com/iam-admin/iam) を開く
2. Firebase Admin SDK サービスアカウントを探す
3. 以下のロールを付与:
   - ✓ **Cloud Functions 管理者** (`roles/cloudfunctions.admin`)
   - ✓ **Firebase Hosting 管理者** (`roles/firebasehosting.admin`)
   - ✓ **Service Account User** (`roles/iam.serviceAccountUser`)
   - ✓ **Firebase Admin** (`roles/firebase.admin`)

#### サービスアカウントキーの作成

1. [サービスアカウント管理ページ](https://console.cloud.google.com/iam-admin/serviceaccounts) を開く
2. `firebase-adminsdk-xxxxx@PROJECT_ID.iam.gserviceaccount.com` を選択
3. 「キー」タブ → 「鍵を追加」 → 「新しい鍵を作成」
4. 形式: **JSON** を選択
5. ダウンロードされた JSON ファイルを保存（GitHub Secrets に使用）

### 2. Compute Engine デフォルトサービスアカウント

**サービスアカウント名**: `PROJECT_NUMBER-compute@developer.gserviceaccount.com`

このアカウントは Functions 実行時に使用されます。

#### 必要な権限

1. [IAM コンソール](https://console.cloud.google.com/iam-admin/iam) を開く
2. Compute Engine デフォルトサービスアカウントを探す
3. 以下のロールを付与:
   - ✓ **Cloud Datastore User** (`roles/datastore.user`)

   または、より広い権限:
   - ✓ **Firebase Admin** (`roles/firebase.admin`)

---

## GitHub Secrets 設定

### 1. GitHub リポジトリの Settings を開く

リポジトリページ → Settings → Secrets and variables → Actions

### 2. 以下の Secrets を追加

#### `FIREBASE_SERVICE_ACCOUNT`

- 値: Firebase Admin SDK サービスアカウントの JSON キー全体
- 手順:
  1. ダウンロードした JSON ファイルを開く
  2. 全内容をコピー
  3. GitHub Secrets に貼り付け

#### `FIREBASE_PROJECT_ID`

- 値: Firebase プロジェクトID（例: `apptodo-75770`）

---

## プロジェクト設定ファイル

### 1. `.firebaserc`

```json
{
  "projects": {
    "default": "YOUR_PROJECT_ID"
  }
}
```

### 2. `firebase.json`

```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "/health",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 3. `functions/package.json`

```json
{
  "name": "functions",
  "version": "1.0.0",
  "main": "lib/index.js",
  "scripts": {
    "build": "tsc"
  },
  "engines": {
    "node": "20"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.2",
    "firebase-admin": "^13.0.1",
    "firebase-functions": "^6.2.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "typescript": "^5.8.3"
  }
}
```

### 4. `.github/workflows/firebase-deploy.yml`

```yaml
name: Firebase Deploy

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run linter
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build application
        run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist

  deploy-production:
    if: (github.event_name == 'push' && github.ref == 'refs/heads/main') || github.event_name == 'workflow_dispatch'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'functions/package-lock.json'
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist
      - name: Install Functions dependencies
        run: cd functions && npm ci
      - name: Build Functions
        run: cd functions && npm run build
      - name: Deploy to Firebase (Hosting + Functions)
        run: |
          echo '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}' > $HOME/gcloud-service-key.json
          export GOOGLE_APPLICATION_CREDENTIALS=$HOME/gcloud-service-key.json
          npx firebase-tools deploy --only hosting,functions --project ${{ secrets.FIREBASE_PROJECT_ID }} --non-interactive --force
```

### 5. `.env` (ローカル開発用)

```bash
# API URL - ローカル開発時
VITE_API_URL=http://localhost:3001

# Firebase Configuration (オプション - 将来の Auth/Firestore 使用時)
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 6. `.env.example` (本番用テンプレート)

```bash
# API URL - use Firebase Hosting URL in production (empty = same origin)
VITE_API_URL=

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**重要**: 本番環境では `VITE_API_URL` を空にすることで、same origin (Firebase Hosting URL) からAPIを呼び出します。

---

## デプロイ実行

### 手動デプロイ（ローカル）

```bash
# 1. フロントエンドをビルド
npm run build

# 2. Functions をビルド
cd functions
npm run build
cd ..

# 3. Firebase にデプロイ
firebase deploy --only hosting,functions
```

### GitHub Actions 経由（自動デプロイ）

```bash
# main ブランチにプッシュすると自動デプロイ
git add .
git commit -m "Deploy to Firebase"
git push origin main
```

または手動トリガー:

```bash
gh workflow run firebase-deploy.yml
```

---

## トラブルシューティング

### エラー: Missing permissions required for functions deploy

**原因**: サービスアカウントに `iam.serviceAccounts.ActAs` 権限がない

**解決策**:
1. [IAM コンソール](https://console.cloud.google.com/iam-admin/iam) を開く
2. GitHub Actions 用のサービスアカウントに **Service Account User** ロールを追加

### エラー: The caller does not have permission (firebaseextensions.googleapis.com)

**原因**: Firebase Extensions API へのアクセス権限がない

**解決策**:
1. サービスアカウントに **Firebase Admin** ロールを追加
2. または Firebase Extensions API を有効化

### エラー: functions/lib/index.js does not exist

**原因**: Functions の TypeScript コードがビルドされていない

**解決策**:
1. ワークフローに Functions のビルドステップを追加
2. `cd functions && npm run build` を実行

### エラー: Internal server error (API呼び出し時)

**原因**: Compute Engine デフォルトサービスアカウントに Firestore アクセス権限がない

**解決策**:
1. [IAM コンソール](https://console.cloud.google.com/iam-admin/iam) を開く
2. `PROJECT_NUMBER-compute@developer.gserviceaccount.com` に以下を追加:
   - **Cloud Datastore User** ロール

### エラー: Cloud Billing API has not been used

**原因**: Cloud Billing API が有効化されていない

**解決策**:
1. https://console.cloud.google.com/apis/library/cloudbilling.googleapis.com を開く
2. 「有効にする」をクリック

### エラー: Permission denied enabling [API名]

**原因**: 必要な Google Cloud API が有効化されていない

**解決策**:
1. エラーメッセージに記載されたURLにアクセス
2. 各APIを手動で有効化
3. 必須API一覧は「[Google Cloud API 有効化](#google-cloud-api-有効化)」セクション参照

---

## 完了チェックリスト

デプロイ前に以下を確認してください：

- [ ] Firebase プロジェクト作成完了
- [ ] Firestore データベース作成完了
- [ ] 必須 Google Cloud API 5つすべて有効化済み
- [ ] Firebase Admin SDK サービスアカウントに必要な権限付与済み
- [ ] Compute Engine デフォルトサービスアカウントに Datastore User ロール付与済み
- [ ] サービスアカウントキー（JSON）作成済み
- [ ] GitHub Secrets 2つ設定済み (`FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PROJECT_ID`)
- [ ] `.firebaserc` にプロジェクトID設定済み
- [ ] `firebase.json` に Hosting と Functions 設定済み
- [ ] GitHub Actions ワークフロー作成済み
- [ ] `.env` ファイルをローカル開発用に設定済み

すべて完了したら、GitHub にプッシュしてデプロイを開始してください！

---

## 参考リンク

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Firebase CLI リファレンス](https://firebase.google.com/docs/cli)
- [Cloud Functions ドキュメント](https://firebase.google.com/docs/functions)
- [Firestore ドキュメント](https://firebase.google.com/docs/firestore)