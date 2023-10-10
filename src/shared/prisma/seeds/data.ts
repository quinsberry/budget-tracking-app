import { Prisma } from '@prisma/client';

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
    {
        fullName: 'Test User',
        email: 'test@test.com',
        password: 'password',
    },
];

export const transactionTags = ['main', 'additional', 'waste'];
