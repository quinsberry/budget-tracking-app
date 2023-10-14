import { Global, Module } from '@nestjs/common';

import { CardsService } from '@/v1/cards/cards.service';
import { TagsService } from '@/v1/tags/tags.service';
import { TransactionsService } from '@/v1/transactions/transactions.service';

import { CronjobsService } from './services/cronjob.service';
import { MonobankService } from './services/monobank.service';
import { PasswordService } from './services/password.service';

const providers = [PasswordService, MonobankService, CronjobsService, TransactionsService, CardsService, TagsService];

@Global()
@Module({
    providers,
    exports: providers,
})
export class SharedModule {}
