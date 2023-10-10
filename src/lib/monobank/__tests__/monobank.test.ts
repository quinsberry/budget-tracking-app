import { SuccessClientInfoResponse, SuccessInvoicesResponse } from './responses';
import { Monobank } from '../Monobank';
import { Invoice } from '../types';

export const getMockMonoInvoices = (amount: number): Invoice[] => {
    return new Array(amount).fill(0).map((_, i) => ({
        id: `test_${i}_${Math.random() * 100}}`,
        time: 0,
        description: '',
        mcc: 0,
        originalMcc: 0,
        amount: 0,
        operationAmount: 0,
        currencyCode: 0,
        commissionRate: 0,
        cashbackAmount: 0,
        balance: 0,
        hold: false,
    }));
};

describe('Monobank', () => {
    let mono: Monobank;
    beforeEach(() => {
        mono = new Monobank('token');
    });

    describe('fetchClientInfo', () => {
        it('should throw an error if token is null', async () => {
            mono = new Monobank();
            await expect(mono.fetchClientInfo({})).rejects.toThrow();
        });

        it('should return client info if token is valid', async () => {
            const clientInfo = SuccessClientInfoResponse;
            const mockResponse = clientInfo;
            jest.spyOn(global, 'fetch').mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            } as any);

            const result = await mono.fetchClientInfo({});
            expect(result).toEqual(clientInfo);
        });

        it('should thrown a zod error if response type is not expected', async () => {
            const mockResponse = {
                unexpectedField: 'unexpectedValue',
            };
            jest.spyOn(global, 'fetch').mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            } as any);
            expect(mono.fetchClientInfo).resolves.toThrow();
        });

        it('should throw an error if fetch fails', async () => {
            jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

            await expect(mono.fetchClientInfo({})).rejects.toThrow('Network error');
        });
    });

    describe('fetchInvoices', () => {
        it('should return a correct reponse', () => {
            const fiveDaysAgoInSeconds = Date.now() - 432000;
            const mockResponse = getMockMonoInvoices(500);
            jest.spyOn(global, 'fetch').mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            } as any);
            const response = mono.fetchInvoices({ accountId: 'accountId', from: fiveDaysAgoInSeconds });
            expect(response).resolves.toHaveLength(500);
        });

        it('should throw an error if token is null', async () => {
            mono = new Monobank();
            await expect(mono.fetchInvoices({ accountId: '123456', from: 0 })).rejects.toThrow(
                'This operation requires a token'
            );
        });

        it('should throw an error if time range is too long', async () => {
            await expect(mono.fetchInvoices({ accountId: '123456', from: 0, to: 3000000 })).rejects.toThrow(
                'The maximum time range is 2682000 seconds, your is: 3000000'
            );
        });

        it('should return invoices if token and parameters are valid', async () => {
            const invoices = SuccessInvoicesResponse;
            const mockResponse = invoices;
            jest.spyOn(global, 'fetch').mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            } as any);

            const result = await mono.fetchInvoices({ accountId: '123456', from: 0 });

            expect(result).toEqual(invoices);
        });

        it('should throw an error if response is not successful', async () => {
            const mockResponse = {
                success: false,
                errorDescription: 'Invalid token',
            };
            jest.spyOn(global, 'fetch').mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            } as any);

            await expect(mono.fetchInvoices({ accountId: '123456', from: 0 })).rejects.toThrow(
                'Recieved type of response was not expected so the returned type is not correct'
            );
        });

        it('should throw an error if fetch fails', async () => {
            jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

            await expect(mono.fetchInvoices({ accountId: '123456', from: 0 })).rejects.toThrow('Network error');
        });
    });
    // describe('getInvoicesAutoload', () => {
    //     it('applies the predicate', () => {
    //         let fetchCount = 0;
    //         let mockFetchInvoices = jest.spyOn(mono, 'fetchInvoices').mockImplementation(() => new Promise((resolve, reject) => {
    //             if (fetchCount > 2) return resolve(getMockMonoInvoices(50));
    //             resolve(getMockMonoInvoices(500));
    //             fetchCount++;
    //         }));
    //         const fiveDaysAgoInSeconds = Date.now() - 432000;
    //         const response = mono.getInvoicesAutoload('accountId', fiveDaysAgoInSeconds);
    //         expect(response).resolves.toEqual({ data: [], waitForNextPortion: 0 });
    //     });
    // });
});
