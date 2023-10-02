import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '@prisma/client';
import { PasswordService } from '../../shared/services/password.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService, private hashService: PasswordService) {}

    async validateUser(email: string, password: string): Promise<Omit<User, 'password'>> {
        const user = await this.usersService.findByEmail(email);
        const passwordValid = await this.hashService.comparePassword(user.password, password);
        if (user && passwordValid) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async register(dto: CreateUserDto) {
        const hashedPassword = await this.hashService.hashPassword(dto.password);
        const user = await this.usersService.create({
            ...dto,
            password: hashedPassword,
        });
        return {
            token: this.jwtService.sign({ id: user.id }),
        };
    }

    async login(user: User) {
        return {
            token: this.jwtService.sign({ id: user.id }),
        };
    }
}
