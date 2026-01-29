/**
 * メールアドレスから学籍番号を取得する
 * 例：s24000@school.ac.jp → s24000
 */
export function extractStudentNo(email: string): string {
    return email.split("@")[0];
}
