interface UserResponse {
    username: string;
}

export interface SessionResponse {
    isLoggedIn: boolean;
    user?: UserResponse;
}

export interface LoginResponse {
    session: SessionResponse;
    mnemonic?: string;
}
