import { ClientInfo, Invoice } from './types';

export type MonoResponse<T> = T | { errorDescription: string };

export class Mono {
    protected token: string | null;
    protected apiUrl: string = 'https://api.monobank.ua';

    constructor(token?: string) {
        this.token = token ?? null;
    }

    /**
     * Fetches the client info from your account.
     * @returns {Object} info - client info object
     * @returns {String} info.clientId - client id
     * @returns {String} info.name - client name
     * @returns {String} info.webHookUrl - client webhook url
     * @returns {String} info.permissions - client permissions
     * @returns {Object[]} info.accounts - client accounts
     */
    async fetchClientInfo({ token }: { token?: string }): Promise<unknown> {
        try {
            const response = await fetch(`${this.apiUrl}/personal/client-info`, {
                headers: {
                    'X-Token': token ?? this.token ?? '',
                },
            });
            return response.json();
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    /**
     * Fetches the invoices from your account.
     * @param {string} accountId - The account id.
     * @param {number} from - The start time in seconds.
     * @param {number} [to] - The end time in seconds.
     * @returns {Object[]} Invoices[] - The array of invoices.
     */
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
    }): Promise<unknown> {
        try {
            const url = `${this.apiUrl}/personal/statement/${accountId}/${from}/${to ?? ''}`;
            const response = await fetch(url, {
                headers: {
                    'X-Token': token ?? this.token ?? '',
                },
            });
            return response.json();
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
