import { Mono, MonoResponse } from './Mono';
import { ClientInfo, Invoice } from './types';
import { fetchClientInfoSchema, fetchInvoicesSchema } from './utils/validation/responses';

export type InvoiceAutoResponse = { data: Invoice[]; waitForNextPortion?: number };

const transformMonoError = (error: { errorDescription: string }) => ({
    data: [],
    error: error.errorDescription,
});
interface Response {
    data: Invoice[];
    waitForNextPortion?: number;
    error?: string;
}

export class Monobank extends Mono {
    readonly maxTimeRange = 2682000;
    readonly maxInvoices = 500;
    readonly maxRequestsPerMinute = 1;

    protected readonly invoiceCache = new Map<string, { full: boolean; data: Invoice[] }>();
    protected lastInvoiceFetch = 0;
    protected invoiceFetchCouldown = 5000;

    async fetchClientInfo({ token }: { token?: string }): Promise<MonoResponse<ClientInfo>> {
        if (token ? false : this.token ? false : true) throw new Error('This operation requires a token');
        const response = await super.fetchClientInfo({ token });
        return fetchClientInfoSchema.parse(response) as MonoResponse<ClientInfo>;
    }

    async fetchInvoices({
        token,
        accountId,
        from,
        to,
    }: {
        token?: string;
        accountId: string;
        from: number;
        to?: number;
    }): Promise<MonoResponse<Invoice[]>> {
        if (token ? false : this.token ? false : true) throw new Error('This operation requires a token');
        if (to && to - from > this.maxTimeRange)
            throw new Error(`The maximum time range is ${this.maxTimeRange} seconds, your is: ${to - from}`);
        const minFrom = Math.floor(Date.now() / 1000 - this.maxTimeRange);
        if (!to && from < minFrom)
            throw new Error(`The maximum time range is ${this.maxTimeRange} seconds, your is: ${minFrom}`);

        const response = await super.fetchInvoices({ token, accountId, from, to });
        return fetchInvoicesSchema.parse(response) as MonoResponse<Invoice[]>;
    }

    static isTokenError(error: string): boolean {
        return error === "Unknown 'X-Token'";
    }

    /**
     * Fetches the invoices from your account or from the cache.
     * If the cache is full, it will be returned.
     * If the cache is not full, it will be filled on the next function call and returned.
     * @param {string} accountId - The account id.
     * @param {number} from - The start time in seconds.
     * @param {number} [to] - The end time in seconds.
     * @returns {Object} response - The object of invoices and the time to wait for the next portion of invoices.
     * @returns {Array} response.data - The array of invoices.
     * @returns {number} response.waitForNextPortion - The time to wait for the next portion of invoices.
     * @throws {Error} - If the token is not set or If the time range is greater than 31 days
     */
    async getInvoicesAutoload(accountId: string, from: number, to?: number): Promise<InvoiceAutoResponse> {
        const cacheKey = this.createInvoiceCacheKey(accountId, from, to);
        const cachedInvoices = this.invoiceCache.get(cacheKey);
        if (cachedInvoices) {
            if (cachedInvoices.full) {
                return {
                    data: cachedInvoices.data,
                };
            }
            if (this.lastInvoiceFetch + this.invoiceFetchCouldown < Date.now()) {
                const lastInvoice = cachedInvoices.data[cachedInvoices.data.length - 1];
                const newFrom = lastInvoice.time;
                return this.getInvoices(accountId, newFrom, to, cachedInvoices.data, cacheKey);
            }
            return {
                data: cachedInvoices.data,
                waitForNextPortion: this.lastInvoiceFetch + this.invoiceFetchCouldown - Date.now() / 1000,
            };
        }
        return this.getInvoices(accountId, from, to);
    }

    private async getInvoices(
        accountId: string,
        from: number,
        to?: number,
        prevInvoices: Invoice[] = [],
        cacheKey?: string
    ): Promise<InvoiceAutoResponse> {
        const data = await this.fetchInvoices({ accountId, from, to });
        if ('errorDescription' in data) {
            this.lastInvoiceFetch = Date.now();
            return this.getInvoicesAutoload(accountId, from, to);
        }
        const invoices = [...prevInvoices, ...data];
        const isLimit = data.length === this.maxInvoices;
        if (cacheKey) {
            this.invoiceCache.set(cacheKey, { full: !isLimit, data: invoices });
        }
        return {
            data: invoices,
            ...{ waitForNextPortion: isLimit ? this.lastInvoiceFetch + 60 * 1000 - Date.now() / 1000 : undefined },
        };
    }

    private createInvoiceCacheKey(accountId: string, from: number, to?: number): string {
        return `${accountId}_${from}_${to ?? ''}`;
    }
}
