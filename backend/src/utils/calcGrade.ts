// src/utils/calcGrade.ts
export function calcGrade(enrollYear: number, now = new Date()): number {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const academicYear = month >= 4 ? year : year - 1;

    return academicYear - enrollYear + 1;
}
