import { PrismaClient, Prisma } from '@prisma/client';

export const users: Prisma.UserCreateInput[] = [
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

export const transactionTags = [
    'main',
    'additional',
    'waste',
];