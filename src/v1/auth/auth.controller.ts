import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local.guard';

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
