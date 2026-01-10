import { JWTPayload } from 'jose';

export interface JWTSessionPayload extends JWTPayload {
    sid: string;
    username: string;
}

export interface SessionData {
    sid: string;
    username: string;
    creation: number;
}
