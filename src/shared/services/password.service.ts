import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

import { Injectable } from '@nestjs/common';

const scryptAsync = promisify(scrypt);

@Injectable()
export class PasswordService {
    async comparePassword(storedPassword: string, suppliedPassword: string): Promise<boolean> {
        const [hashedPassword, salt] = storedPassword.split('.');
        const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
        const suppliedPasswordBuf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
        return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
    }

    async hashPassword(password: string): Promise<string> {
        const salt = randomBytes(16).toString('hex');
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;
        return `${buf.toString('hex')}.${salt}`;
    }
}
