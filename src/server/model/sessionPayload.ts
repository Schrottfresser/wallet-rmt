import { JWTPayload } from 'jose';

interface SessionPayload extends JWTPayload {
    userId: string;
}

export default SessionPayload;
