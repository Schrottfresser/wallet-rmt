interface UserResponse {
    username: string;
}

export interface SessionResponse {
    isLoggedIn: boolean;
    user?: UserResponse;
}

export interface RegisterResponse {
    user: UserResponse;
}

export interface LoginResponse {
    user: UserResponse;
    mnemonic?: string;
}
