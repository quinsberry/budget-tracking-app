import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CardsService } from '@/v1/cards/cards.service';
import { TransactionsService } from '@/v1/transactions/transactions.service';

@Injectable()
export class CronjobsService {
    constructor(
        private readonly transactionsService: TransactionsService,
        private readonly cardsService: CardsService
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
        name: 'daily_transactions_seeding',
        timeZone: 'Europe/Warsaw',
    })
    async dailyTransactionsSeeding(): Promise<void> {
        const cards = await this.cardsService.findAll();
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        for (const card of cards) {
            this.transactionsService.seedTransactions(card.id, monthAgo);
        }
    }
}
