# 📘 出席管理システム

## 📌 プロジェクト概要
本プロジェクトは、学校向けの出席管理を目的としたWebシステムです。  
教師と学生がそれぞれログインし、出席情報の登録・確認・管理を行うことができます。

教師は担当クラスの出席状況を記録・更新でき、学生は授業への欠席やその理由などを連絡できます。  
また、クラス・学生データの同期機能により、新学期や情報更新時にも効率よく最新状態を保つことができます。

---

## 🎯 主な機能

### 👨‍🏫 教師側
- 担当クラスの出席登録
- 出席状況の確認・修正
- クラス管理
- データ同期機能（管理者用）

### 🎓 学生側
- 欠席・遅刻・早退連絡機能
- 過去に提出した連絡履歴


---

## 🛠 使用技術

### フロントエンド
- Next.js
- TypeScript
- Tailwind CSS

### バックエンド
- Node.js
- Express

### データベース
- Prisma
- Supabase

### 認証
- Googleログイン認証

---


## 🔧 導入手順

### 1.リポジトリのクローン

```bash
git clone https://github.com/itc-ss24007/school-attendance-system.git
cd school-attendance-system
```
### 2.インストール手順（バックエンド）

~~~bash
cd backend
npm install
~~~
`backend` ディレクトリに `.env` ファイルを作成し、以下を設定してください。
~~~env
DATABASE_URL=your_database_url
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_ADMIN_EMAIL=your_admin_email
REDIS_URL=your_redis_url
~~~

### 3.インストール手順（フロントエンド）

~~~bash
cd frontend
npm run dev
~~~
`frontend` ディレクトリに `.env.local` を作成し、以下を設定してください。

~~~env
NEXT_PUBLIC_API_URL=http://localhost:5000
~~~

### 4.起動方法

- バックエンド起動

~~~bash
cd backend
npm run dev
~~~

- フロントエンド起動

~~~bash
cd frontend
npm run dev
~~~

### 5.動作確認

ブラウザで以下にアクセスしてください：

~~~text
http://localhost:3000
~~~
- Googleログイン画面が表示される
- ログイン後、役割に応じた画面へ遷移する

---

## 📊 システムの特徴
- 教師・学生のロール別アクセス制御
- 学年・学科ごとの学生管理
- データベースと学校情報の同期機能
- シンプルで使いやすいUI設計

---

## 🚀 今後の改善予定
- 学生側の出席状況の閲覧
- 出席統計（クラス別、学生別、期間指定）の表示
- 通知機能の追加
