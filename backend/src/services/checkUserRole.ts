import { directory } from "../config/google.js";

/**
 * Directory API を使用して
 * ユーザーが学生か教職員か判定する
 */
export async function checkUserRole(email:string) {
    const res = await directory.users.get({
        userKey: email,
    });

    const orgUnitPath = res.data.orgUnitPath;

    /**
     * /student で始まる場合は学生
     */
    if (orgUnitPath && orgUnitPath.startsWith("/student")) {
        return "student";
    }

    return "teacher";
}
