import { google } from "googleapis";

console.log("key:",process.env.GOOGLE_CLIENT_EMAIL)
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    },
    scopes: [
        "https://www.googleapis.com/auth/admin.directory.user.readonly",
        "https://www.googleapis.com/auth/admin.directory.group.readonly",
    ],
    clientOptions: {
        subject: process.env.GOOGLE_ADMIN_EMAIL, // ← 管理者邮箱
    },
});

export const directory = google.admin({
    version: "directory_v1",
    auth,
});
