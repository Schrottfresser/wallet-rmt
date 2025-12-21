import { JWTPayload } from 'jose';

interface SessionPayload extends JWTPayload {
    username: string;
}

export default SessionPayload;
