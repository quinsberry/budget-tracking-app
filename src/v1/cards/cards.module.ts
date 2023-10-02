import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { MonobankService } from '../../shared/services/monobank.service';
import { UsersService } from '../users/users.service';

@Module({
    controllers: [CardsController],
    providers: [CardsService, MonobankService, UsersService],
})
export class CardsModule {}
