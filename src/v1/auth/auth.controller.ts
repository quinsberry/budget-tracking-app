import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local.guard';
import type { Request } from 'express';
import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller()
@ApiTags('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @ApiBody({ type: LoginDto })
    async login(@Req() req: Request & { user: User }) {
        return this.authService.login(req.user);
    }

    @Post('register')
    @ApiBody({ type: RegisterDto })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }
}
