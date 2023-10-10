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
    ParseUUIDPipe,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiBearerAuth, ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UserId } from '@/shared/decorators/user-id.decorator';
import { CardsService } from '@/v1/cards/cards.service';
import { JwtAuthGuard } from '@/v1/auth/guards/jwt-auth.guard';
import { TransformStringToArrayPipe } from '@/shared/pipes/transform-string-to-array.pipe';
import { ParseUUIDOrUndefinedPipe } from '@/shared/pipes/parse-uuid-or-undefined.pipe';

@Controller()
@ApiTags('transactions')
export class TransactionsController {
    constructor(
        private readonly transactionsService: TransactionsService,
        private readonly cardsService: CardsService
    ) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'take', required: false })
    @ApiQuery({ name: 'skip', required: false })
    findAll(
        @UserId() userId: string,
        @Query('take', new DefaultValuePipe(100), ParseIntPipe) take: string,
        @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: string
    ) {
        return this.transactionsService.findAllOfUser(userId, +take, +skip);
    }

    @Get('card/:cardId?')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'take', required: false })
    @ApiQuery({ name: 'skip', required: false })
    async findAllByCard(
        @UserId() userId: string,
        @Param('cardId', ParseUUIDPipe) cardId: string,
        @Query('take', new DefaultValuePipe(100), ParseIntPipe) take: string,
        @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: string
    ) {
        const card = await this.cardsService.findOne(cardId);
        if (!card) throw new NotFoundException('Card is not found');
        if (card.userId !== userId) throw new ForbiddenException('This card does not belong to you');
        return this.transactionsService.findAllOfUser(userId, +take, +skip, cardId);
    }

    @Get('tag/:tagNames?')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'take', required: false })
    @ApiQuery({ name: 'skip', required: false })
    @ApiQuery({ name: 'cardId', required: false })
    async findAllByTags(
        @UserId() userId: string,
        @Param('tagNames', TransformStringToArrayPipe) tagNames: string[],
        @Query('take', new DefaultValuePipe(100), ParseIntPipe) take: string,
        @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: string,
        @Query('cardId', ParseUUIDOrUndefinedPipe, new DefaultValuePipe(undefined)) cardId?: string
    ) {
        return this.transactionsService.findAllOfUserByTagNames(tagNames, +take, +skip, userId, cardId);
    }

    @Get(':transactionId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async findOne(@Param('transactionId', ParseUUIDPipe) transactionId: string, @UserId() userId: string) {
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
        @Param('transactionId', ParseUUIDPipe) transactionId: string,
        @UserId() userId: string,
        @Body() updateTransactionDto: UpdateTransactionDto
    ) {
        const transaction = await this.transactionsService.findOneById(transactionId);
        if (!transaction) throw new NotFoundException('Transaction is not found');
        if (transaction.card.userId !== userId) throw new NotFoundException('Transaction is not found');
        return this.transactionsService.update(transactionId, updateTransactionDto);
    }
}
