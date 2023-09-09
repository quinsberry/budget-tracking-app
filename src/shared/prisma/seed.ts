import { PrismaClient, Prisma } from '@prisma/client';
import { PasswordService } from '../services/password.service';

const prisma = new PrismaClient();
const passwordService = new PasswordService();

const userData: Prisma.UserCreateInput[] = [
    {
        fullName: 'Alice',
        email: 'alice@prisma.io',
        password: 'asd',
    },
    {
        fullName: 'John',
        email: 'john@prisma.io',
        password: 'pass',
    },
];

async function main() {
    console.log(`Start seeding...`);
    for (const u of userData) {
        const hashedPassword = await passwordService.hashPassword(u.password);
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                ...u,
                password: hashedPassword,
            },
        });
    }
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
