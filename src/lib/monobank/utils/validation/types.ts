import { z } from 'zod';

import { AccountType, CashbackType } from '../../types';

export const AccountSchema = z.array(
    z.object({
        id: z.string(),
        sendId: z.string(),
        currencyCode: z.number(),
        balance: z.number(),
        creditLimit: z.number(),
        maskedPan: z.array(z.string()),
        type: z.nativeEnum(AccountType),
        iban: z.string(),
        cashbackType: z.nativeEnum(CashbackType).optional(),
    })
);

export const ClientInfoSchema = z.object({
    clientId: z.string(),
    name: z.string(),
    webHookUrl: z.string(),
    permissions: z.string(),
    accounts: AccountSchema,
});

export const InvoiceSchema = z.object({
    id: z.string(),
    time: z.number(),
    description: z.string(),
    mcc: z.number(),
    originalMcc: z.number(),
    amount: z.number(),
    operationAmount: z.number(),
    currencyCode: z.number(),
    commissionRate: z.number(),
    cashbackAmount: z.number(),
    balance: z.number(),
    hold: z.boolean(),
    comment: z.string().optional(),
    receiptId: z.string().optional(),
    invoiceId: z.string().optional(),
    counterEdrpou: z.string().optional(),
    counterIban: z.string().optional(),
    counterName: z.string().optional(),
});
