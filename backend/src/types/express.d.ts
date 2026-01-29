

declare global {
    namespace Express {
        interface User {
            id: string
            role: 'student' | 'teacher'
        }
    }
}
export type Express = Express & {}



