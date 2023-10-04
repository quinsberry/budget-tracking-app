import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    UseGuards,
    NotFoundException,
    ForbiddenException,
    Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CardsService } from '../cards/cards.service';
import { UserId } from '../../shared/decorators/user-id.decorator';

@Controller()
@ApiTags('transactions')
export class TransactionsController {
    constructor(
        private readonly transactionsService: TransactionsService,
        private readonly cardsService: CardsService
    ) {}

    @Get(':cardId?')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async findAll(
        @UserId() userId: string,
        @Param('cardId') cardId: string,
        @Query('take') take: string,
        @Query('skip') skip: string
    ) {
        const card = await this.cardsService.findOne(cardId);
        if (!card) throw new NotFoundException('Card is not found');
        if (card.userId !== userId) throw new ForbiddenException('This card does not belong to you');
        return this.transactionsService.findAllByCardId(cardId, +take, +skip);
    }

    @Get(':transactionId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async findOne(@Param('transactionId') transactionId: string, @UserId() userId: string) {
        const transaction = await this.transactionsService.findOneById(transactionId);
        if (!transaction) throw new NotFoundException('Transaction is not found');
        if (transaction.card.userId !== userId) throw new NotFoundException('Transaction is not found');
        return transaction;
    }

    @Patch(':transactionId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiBody({ type: UpdateTransactionDto })
    async update(
        @Param('transactionId') transactionId: string,
        @UserId() userId: string,
        @Body() updateTransactionDto: UpdateTransactionDto
    ) {
        const transaction = await this.transactionsService.findOneById(transactionId);
        if (!transaction) throw new NotFoundException('Transaction is not found');
        if (transaction.card.userId !== userId) throw new NotFoundException('Transaction is not found');
        return this.transactionsService.update(transactionId, updateTransactionDto);
    }
}
