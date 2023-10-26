import { Token } from '@prisma/client';

export interface Tokens {
    accessToken: string;
    refreshToken: Token;
}

export interface JwtPayload {
    id: string;
    email: string;
    fullName: string;
}

export interface GoogleSuccessResponse {
    azp: string;
    aud: string;
    sub: string;
    scope: string;
    exp: string;
    expires_in: string;
    email: string;
    email_verified: string;
    access_type: string;
}
