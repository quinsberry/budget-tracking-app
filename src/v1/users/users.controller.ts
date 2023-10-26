import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';

@Controller()
@ApiTags('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async getAll() {
        const users = await this.usersService.getAll();
        return users.map(user => user.fullName);
    }
}
