import type { LoginInput, RegisterInput } from './auth.schema';
export declare function login(input: LoginInput): Promise<{
    token: string;
    user: SafeUser;
}>;
export declare function register(input: RegisterInput): Promise<{
    token: string;
    user: SafeUser;
}>;
export type SafeUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
};
//# sourceMappingURL=auth.service.d.ts.map