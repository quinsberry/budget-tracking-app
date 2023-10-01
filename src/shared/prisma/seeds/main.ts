import { PrismaClient } from '@prisma/client';
import { PasswordService } from '../../services/password.service';
import { users, transactionTags } from './data';
import { UsersService } from '../../../v1/users/users.service';
import { PrismaService } from '../prisma.service';

const prisma = new PrismaClient();
const prismaService = new PrismaService();
const passwordService = new PasswordService();
const usersService = new UsersService(prismaService);

async function seedUsers(): Promise<any> {
    return Promise.all(users.map(async u => {
        const hashedPassword = await passwordService.hashPassword(u.password);
        return usersService.create({
            ...u,
            password: hashedPassword,
        });
    }));
}

async function main() {
    console.log(`Start seeding...`);
    Promise.all([
        seedUsers(),
    ]);
    console.log(`Seeding finished.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async e => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
