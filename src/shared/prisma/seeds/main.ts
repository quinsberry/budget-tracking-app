import { PrismaClient } from '@prisma/client';
import { PasswordService } from '../../services/password.service';
import { users, transactionTags } from './data';

const prisma = new PrismaClient();
const passwordService = new PasswordService();

async function seedUsers(): Promise<any> {
    return Promise.all(users.map(async u => {
        const hashedPassword = await passwordService.hashPassword(u.password);
        return prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                ...u,
                password: hashedPassword,
            },
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
