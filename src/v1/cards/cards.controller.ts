import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    BadRequestException,
    NotFoundException,
    ParseUUIDPipe,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateMonobankCardDto } from './dto/create-monobank-card.dto';
import { UpdateMonobankCardDto } from './dto/update-monobank-card.dto';
import { UserId } from '@/shared/decorators/user-id.decorator';
import { AvailableBank } from '@prisma/client';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/v1/auth/guards/jwt-auth.guard';
import { UsersService } from '@/v1/users/users.service';

@Controller()
@ApiTags('cards')
export class CardsController {
    constructor(
        private readonly cardsService: CardsService,
        private readonly usersService: UsersService,
    ) {}

    @Post('/monobank')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiBody({ type: CreateMonobankCardDto })
    createMonobankCard(@UserId() id: string, @Body() dto: CreateMonobankCardDto) {
        return this.cardsService.createMonobankCard(id, dto);
    }

    @Get('availableToCreate')
    possibleCards() {
        return Object.keys(AvailableBank);
    }

    @Get('/my')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findAll(@UserId() id: string) {
        return this.cardsService.findAllByUserId(id);
    }

    @Get(':cardId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async findOne(@Param('cardId', ParseUUIDPipe) cardId: string) {
        if (cardId.length > 36) throw new BadRequestException('Card ID length is greater than 36 symbols');
        const card = await this.cardsService.findOne(cardId);
        if (!card) throw new NotFoundException('Card is not found');
        return card;
    }

    @Patch(':cardId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async update(@UserId() userId: string, @Param('cardId', ParseUUIDPipe) cardId: string, @Body() dto: UpdateMonobankCardDto) {
        const user = await this.usersService.findById(userId);
        if (!user) throw new NotFoundException('User is not found');
        const card = user.cards.find(card => card.id === cardId);
        if (!card) throw new NotFoundException('Card is not found');
        return this.cardsService.update(userId, cardId, dto);
    }

    @Delete(':cardId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async remove(@UserId() userId: string, @Param('cardId', ParseUUIDPipe) cardId: string) {
        const user = await this.usersService.findById(userId);
        if (!user) throw new NotFoundException('User is not found');
        const card = user.cards.find(card => card.id === cardId);
        if (!card) throw new NotFoundException('Card is not found');
        return this.cardsService.remove(userId, cardId);
    }
}
