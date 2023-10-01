import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../../shared/decorators/user-id.decorator';
import { exclude } from '../../shared/prisma/utils/exclude';

@Controller()
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('/getAll')
    async getAll() {
        const users = await this.usersService.getAll();
        return users.map((user) => exclude(user, ['password']));
    }

    @Get('/me')
    @UseGuards(JwtAuthGuard)
    async getMe(@UserId() id: string) {
        const user = await this.usersService.findById(id);
        return exclude(user, ['password']);
    }
}
