import { NestFactory } from '@nestjs/core';
import { AvailableBank, PrismaClient } from '@prisma/client';

import { AppModule } from '@/app.module';
import { PasswordService } from '@/shared/services/password.service';
import { CardsService } from '@/v1/cards/cards.service';
import { CreateMonobankCardDto } from '@/v1/cards/dto/create-monobank-card.dto';
import { CreateUserDto } from '@/v1/users/dto/create-user.dto';
import { UsersService } from '@/v1/users/users.service';

import { users } from './data';

interface CustomSeedUser extends CreateUserDto {
    cards: CustomSeedCard[];
}
interface CustomSeedCard extends CreateMonobankCardDto {
    bank: AvailableBank;
}

async function main() {
    NestFactory.createApplicationContext(AppModule).then(appContext => {
        const prisma = new PrismaClient();
        const passwordService = new PasswordService();
        const cardsService = appContext.get(CardsService);
        const usersService = appContext.get(UsersService);

        async function seedUsers(): Promise<any> {
            return Promise.all(
                users.map(async u => {
                    const hashedPassword = await passwordService.hashPassword(u.password);
                    return usersService.create({
                        ...u,
                        password: hashedPassword,
                    });
                })
            );
        }

        async function customSeed(init: CustomSeedUser): Promise<any> {
            const user = await usersService.create({
                fullName: init.fullName,
                email: init.email,
                password: await passwordService.hashPassword(init.password),
            });

            init.cards.forEach(async card => {
                if (card.bank === AvailableBank.Monobank) {
                    cardsService.createMonobankCard(user.id, {
                        description: card.description,
                        cardNumber: card.cardNumber,
                        token: card.token,
                        startTrackingTime: card.startTrackingTime,
                    });
                }
            });
        }

        return seedUsers()
            .then(() => console.log('Users are seeded'))
            .then(() => {
                console.debug('Seeding complete!');
            })
            .catch(async error => {
                console.error('Seeding failed!');
                console.error(error);
                await prisma.$disconnect();
                process.exit(1);
            })
            .finally(async () => {
                appContext.close();
                await prisma.$disconnect();
            });
    });
}

main();
