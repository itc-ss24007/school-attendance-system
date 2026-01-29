/**
 * Google OAuth + Directory API を利用した
 * 学生／教職員判定サンプル
 */

import path from 'path';
import express, { Request, Response } from 'express';
import session from 'express-session';
import { google } from 'googleapis';

// ======================================================
// セッションの型定義（TypeScript）
// ======================================================
declare module 'express-session' {
    interface SessionData {
        userEmail?: string;   // ログインユーザーのメールアドレス
        isStudent?: boolean;  // 学生判定フラグ
    }
}
// ======================================================
// Express 初期設定
// ======================================================
const app = express();
const port = 3000;

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'secure-secret-key',
        resave: false,
        saveUninitialized: false,
    })
);

// ======================================================
// OAuth2 クライアント設定
// ======================================================
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// ======================================================
// 利用するスコープ
// Directory API を使用するために必須
// ======================================================
const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/admin.directory.user.readonly',
];

// ======================================================
// 認証フロー
// ======================================================

/**
 * ① Google ログイン開始
 */
app.get('/auth/google', (req: Request, res: Response) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
    });

    res.redirect(url);
});

/**
 * ② OAuth コールバック
 *    - メールアドレス取得
 *    - Directory API で組織情報取得
 *    - 学生／教職員を判定
 */
app.get('/auth/google/callback', async (req: Request, res: Response) => {
    const { code } = req.query;

    try {
        // アクセストークン取得
        const { tokens } = await oauth2Client.getToken(code as string);
        oauth2Client.setCredentials(tokens);

        // ログインユーザーのメールアドレス取得
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const email = userInfo.data.email;

        if (!email) {
            throw new Error('メールアドレスを取得できませんでした');
        }

        // ==================================================
        // Directory API を利用してユーザー情報を取得
        // ==================================================
        const adminClient = google.admin( "directory_v1");


        const userResponse = await adminClient.users.get({
            userKey: email,
        });

        // 組織単位パス（例: /Students/IT2024）
        const orgUnitPath = userResponse.data.orgUnitPath || '';
        console.log(`User: ${email}, OrgUnitPath: ${orgUnitPath}`);

        // ==================================================
        // 学生判定ロジック
        // ※ 組織単位に "Students" が含まれているか
        // ==================================================
        const isStudent = orgUnitPath.includes('Students');

        // セッションへ保存
        req.session.userEmail = email;
        req.session.isStudent = isStudent;

        // 権限別画面へリダイレクト
        res.redirect(isStudent ? '/student-page' : '/staff-page');
    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).send('認証または組織情報の取得に失敗しました');
    }
});

// ======================================================
// 画面表示（サンプル）
// ======================================================

/**
 * 学生専用画面
 */
app.get('/student-page', (req: Request, res: Response) => {
    if (req.session.isStudent) {
        res.send(`
      <h1>学生専用画面</h1>
      <p>ログインID: ${req.session.userEmail}</p>
    `);
    } else {
        res.status(403).send('アクセス権限がありません');
    }
});

/**
 * 教職員画面
 */
app.get('/staff-page', (req: Request, res: Response) => {
    res.send(`
    <h1>教職員画面</h1>
    <p>ログインID: ${req.session.userEmail}</p>
  `);
});

// ======================================================
// サーバー起動
// ======================================================
app.listen(port, () => {
    console.log(`Server started: http://localhost:${port}/auth/google`);
});
