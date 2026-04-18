import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-trainer-os';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload {
    userId: string;
    tenantId: string;
    role: string;
    studentId?: string; // If the user is a student
}

export async function signToken(payload: SessionPayload, expiresIn = '7d'): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(encodedSecret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, encodedSecret);
        return payload as unknown as SessionPayload;
    } catch (error) {
        return null;
    }
}
