export const FailedResponse = {
    errorDescription: 'test error',
};
export const SuccessClientInfoResponse = {
    clientId: 'test_id',
    name: 'John Doe',
    webHookUrl: '',
    permissions: 'permission',
    accounts: [
        {
            id: '123456',
            balance: 1000,
            currencyCode: 980,
            cashbackType: 'UAH',
            type: 'black',
            iban: 'TEST_IBAN',
            maskedPan: ['1234 **** **** 1234'],
            creditLimit: 0,
            sendId: '',
        },
    ],
};
export const FailedClientInfoResponse = FailedResponse;

export const SuccessInvoicesResponse = [
    {
        id: '123456',
        time: 1625241600,
        description: 'Payment for goods',
        mcc: 1234,
        hold: false,
        amount: -1000,
        operationAmount: -1000,
        currencyCode: 980,
        commissionRate: 0,
        cashbackAmount: 0,
        balance: 0,
    },
];

export const FailedInvoicesResponse = FailedResponse;
