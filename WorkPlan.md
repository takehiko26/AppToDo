# Firebase デプロイ作業計画

## タスクリスト

- [x] WorkPlan.mdを作成してタスクリストを記載
- [x] firebase.json作成（Hosting設定）
- [x] .firebaserc テンプレート作成
- [x] src/config/firebase.ts作成（SDK初期化）
- [x] .env.example更新（Firebase設定追加）
- [x] package.json更新（依存・スクリプト追加）
- [x] .gitignore更新（Firebase関連追加）
- [x] GitHub Actions CI/CD設定作成

## 手動実行が必要な作業（後で実施）

### 1. Firebase CLI セットアップ
```bash
# グローバルインストール
npm install -g firebase-tools

# Googleアカウントでログイン
firebase login
```

### 2. Firebaseプロジェクト作成
```bash
# Firebase Consoleでプロジェクト作成後
firebase init hosting

# 対話形式の質問への回答例：
# - Use an existing project → 作成したプロジェクトを選択
# - What do you want to use as your public directory? → dist
# - Configure as a single-page app? → Yes
# - Set up automatic builds and deploys with GitHub? → Yes（CI/CD有効化）
# - File dist/index.html already exists. Overwrite? → No
```

### 3. GitHub Secrets設定（CI/CD用）
GitHub Actions用に以下のSecretsを設定する必要があります：

#### 3-1. Firebase Service Account作成
1. Firebase Console > Project Settings > Service accounts
2. "Generate new private key"をクリックしてJSONファイルをダウンロード
3. JSONファイルの内容全体をコピー

#### 3-2. GitHub Secretsに登録
リポジトリ Settings > Secrets and variables > Actions > New repository secret

以下の3つのSecretを登録：
- **FIREBASE_SERVICE_ACCOUNT**: 上記でダウンロードしたJSONの内容全体
- **FIREBASE_PROJECT_ID**: Firebaseプロジェクト ID（例: apptodo-xxxxx）
- **GITHUB_TOKEN**: 自動設定されるため不要（GitHub Actionsが自動提供）

### 4. .firebaserc プロジェクトID設定
```bash
# プロジェクト作成後、.firbaserc の "your-project-id" を実際のIDに置換
# プロジェクトIDはFirebase Consoleで確認可能
```

### 5. .env ファイル設定
```bash
# .env.example をコピーして .env 作成
cp .env.example .env

# Firebase Console > Project Settings > General > Your apps でSDK設定を確認
# .env ファイルに実際の値を記入
```

## デプロイコマンド（設定完了後）

```bash
# ローカルでビルド確認
npm run build

# Firebase Hosting エミュレータで動作確認
firebase emulators:start --only hosting

# プレビュー環境へデプロイ
npm run deploy:preview

# 本番環境へデプロイ
npm run deploy
```

## CI/CD 自動デプロイフロー

- **Pull Request作成時**: 自動でプレビュー環境デプロイ（コメントにURL表示）
- **mainブランチマージ時**: 自動で本番環境デプロイ