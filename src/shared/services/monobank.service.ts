import { MonoResponse } from '@/lib/monobank/Mono';
import { Invoice } from '@/lib/monobank/types';
import { Monobank } from '../../lib/monobank';
import { Injectable, Logger } from '@nestjs/common';
import { fromDateToSeconds, fromSecondsToDate } from '../utils/date';
import { Queue } from '../../lib/queue';

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
        const dateInterval = `${from.toDateString()} - ${to.toDateString()}`;

        this.logger.debug(`Date interval: ${dateInterval}`);
        this.logger.debug(`Fetching ${dateSlices.length} parts of invoices:`);

        const minuteInMs = 60000;
        const queue = new Queue({
            concurrent: 1,
            interval: minuteInMs / this.monobank.maxRequestsPerMinute,
            start: false,
        });
        dateSlices.map(({ from, to }, idx) => {
            queue.enqueue(async () => {
                this.logger.debug(
                    `[${idx + 1}] ${fromSecondsToDate(from).toDateString()} - ${fromSecondsToDate(to).toDateString()}`
                );
                const invoices = await this.fetchFullInvoices({ token, accountId, from, to });
                if ('errorDescription' in invoices) {
                    this.logger.error(`[${idx + 1}] Error: ${invoices.errorDescription}`);
                    throw new Error(invoices.errorDescription);
                }
                this.logger.debug(`[${idx + 1}] Completed`);
                if (idx === dateSlices.length - 1) queue.stop();
                return invoices;
            });
        });
        queue.on('resolve', data => onPartUploaded?.(data));
        queue.on('end', () => this.logger.debug(`Fetching invoices for ${dateInterval} completed`));
        queue.start();
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
