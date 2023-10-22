import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

import { PasswordService } from '@/shared/services/password.service';
import { CreateUserDto } from '@/v1/users/dto/create-user.dto';
import { UsersService } from '@/v1/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly hashService: PasswordService
    ) {}

    async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.usersService.findByEmail(email);
        if (user) {
            const passwordValid = await this.hashService.comparePassword(user.password, password);
            if (passwordValid) {
                const { password, ...result } = user;
                return result;
            }
        }
        return null;
    }

    async register(dto: CreateUserDto) {
        const existedUser = await this.usersService.findByEmail(dto.email);
        if (existedUser) {
            throw new ConflictException('The user with this email already exists');
        }
        const hashedPassword = await this.hashService.hashPassword(dto.password);
        const user = await this.usersService.create({
            ...dto,
            password: hashedPassword,
        });
        return {
            access_token: this.jwtService.sign({ id: user.id }),
        };
    }

    async login(user: User) {
        return {
            access_token: this.jwtService.sign({ id: user.id }),
        };
    }
}
