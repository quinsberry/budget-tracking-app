import { MonoResponse } from '@/lib/monobank/Mono';
import { Invoice } from '@/lib/monobank/types';
import { Monobank } from '../../lib/monobank';
import { Injectable, Logger } from '@nestjs/common';
import { fromDateToSeconds, fromSecondsToDate } from '../utils/date';

@Injectable()
export class MonobankService {
    private monobank = new Monobank();
    private logger = new Logger(MonobankService.name);

    async checkIfTokenValid(token: string): Promise<boolean> {
        const response = await this.monobank.fetchClientInfo({ token });
        return 'clientId' in response;
    }

    isTokenError(error: string): boolean {
        return Monobank.isTokenError(error);
    }

    fetchClientInfo({ token }: { token?: string }) {
        return this.monobank.fetchClientInfo({ token });
    }

    async fetchInvoices({
        token,
        accountId,
        from,
        to = new Date(),
        onPartUploaded,
    }: {
        token?: string;
        accountId: string;
        from: Date;
        to?: Date;
        onPartUploaded?: (invoices: Invoice[]) => void;
    }): Promise<void> {
        const dateSlices = this.makeSlicesForRequests(from, to);
        this.logger.log(`from: ${from.toDateString()}, to: ${to.toDateString()}`);
        this.logger.log(`Fetching ${dateSlices.length} parts of invoices`);
        return new Promise((resolve, reject) => {
            dateSlices.map(({ from, to }, idx) => {
                setTimeout(async () => {
                    this.logger.log(`Fetching ${fromSecondsToDate(from).toDateString()} - ${fromSecondsToDate(to).toDateString()}`);
                    const invoices = await this.fetchFullInvoices({ token, accountId, from, to });
                    if ('errorDescription' in invoices) {
                        reject(invoices.errorDescription);
                        this.logger.log(`Error ${invoices.errorDescription}`);
                        throw new Error(invoices.errorDescription);
                    }
                    onPartUploaded?.(invoices);
                    this.logger.log(`Fetched ${fromSecondsToDate(from).toDateString()} - ${fromSecondsToDate(to).toDateString()}`);
                    if (idx === dateSlices.length - 1) resolve();
                }, idx * 5000);
            })
        });
    }

    private makeSlicesForRequests(from: Date, to: Date): { from: number; to: number }[] {
        return this.makeSlicesFromTimeRange(fromDateToSeconds(from), fromDateToSeconds(to), this.monobank.maxTimeRange);
    }

    private makeSlicesFromTimeRange(from: number, to: number, range: number): { from: number; to: number }[] {
        const result: { from: number; to: number }[] = [];
        let currentFrom = from;
        while (currentFrom + range < to) {
            result.push({
                from: currentFrom,
                to: currentFrom + range,
            });
            currentFrom += range;
        }
        result.push({ from: currentFrom, to: to });
        return result;
    }

    private async fetchFullInvoices({
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
        const result: Invoice[] = [];
        const invoices = await this.monobank.fetchInvoices({ token, accountId, from, to });
        if ('errorDescription' in invoices) {
            return invoices;
        }
        result.push(...invoices);
        if (invoices.length === 500) {
            const lastInvoiceTime = invoices[invoices.length - 1].time;
            return this.fetchFullInvoices({
                token,
                accountId,
                from: lastInvoiceTime,
                to,
            });
        }
        return result;
    }

    areCardNumbersMatches(card1: string, card2: string): boolean {
        const charsShouldMatch = 10;
        let card1Matches = 0;
        card1.split('').forEach((char, index) => {
            if (char === card2[index]) {
                card1Matches++;
            }
        });
        return card1Matches >= charsShouldMatch;
    }
}
