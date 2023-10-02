import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateMonobankCardDto } from './dto/create-monobank-card.dto';
import { UpdateMonobankCardDto } from './dto/update-monobank-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../../shared/decorators/user-id.decorator';
import { AvailableBank } from '@prisma/client';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@Controller()
@ApiTags('cards')
export class CardsController {
    constructor(private readonly cardsService: CardsService) {}

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

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async findOne(@Param('id') cardId: string) {
        if (cardId.length > 36) throw new BadRequestException('Card ID length is greater than 36 symbols');
        const card = await this.cardsService.findOne(cardId);
        if (!card) throw new NotFoundException('Card is not found');
        return card;
    }

    @Patch(':cardId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    update(@UserId() userId: string, @Param('cardId') cardId: string, @Body() dto: UpdateMonobankCardDto) {
        return this.cardsService.update(userId, cardId, dto);
    }

    @Delete(':cardId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    remove(@UserId() userId: string, @Param('cardId') cardId: string,) {
        return this.cardsService.remove(userId, cardId);
    }
}
