import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AvailableBank } from '@prisma/client';

import { UserId } from '@/shared/decorators/user-id.decorator';
import { ParseDatePipe } from '@/shared/pipes/parse-date.pipe';
import { JwtAuthGuard } from '@/v1/auth/guards/jwt-auth.guard';
import { UsersService } from '@/v1/users/users.service';

import { CardsService } from './cards.service';
import { CreateMonobankCardDto } from './dto/create-monobank-card.dto';
import { ForceSeedCardDto } from './dto/force-seed-card.dto';
import { UpdateMonobankCardDto } from './dto/update-monobank-card.dto';
import { TransactionsService } from '../transactions/transactions.service';

@Controller()
@ApiTags('cards')
export class CardsController {
    constructor(
        private readonly cardsService: CardsService,
        private readonly usersService: UsersService,
        private readonly transactionsService: TransactionsService
    ) {}

    @Post('/monobank')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiBody({ type: CreateMonobankCardDto })
    createMonobankCard(@UserId() id: string, @Body() dto: CreateMonobankCardDto) {
        return this.cardsService.createMonobankCard(id, dto);
    }

    @Post('/forceseed')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiBody({ type: ForceSeedCardDto })
    async forceSeed(@UserId() userId: string, @Body() dto: ForceSeedCardDto) {
        const card = await this.cardsService.findOne(dto.cardId, userId);
        if (!card) throw new NotFoundException('Card is not found');
        return this.transactionsService.seedTransactions(dto.cardId, new ParseDatePipe().transform(dto.from));
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
    async update(
        @UserId() userId: string,
        @Param('cardId', ParseUUIDPipe) cardId: string,
        @Body() dto: UpdateMonobankCardDto
    ) {
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
