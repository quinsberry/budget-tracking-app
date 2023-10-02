import { Monobank } from '../../lib/monobank';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MonobankService extends Monobank {
    monobank: Monobank;

    async checkIfTokenValid(token: string): Promise<boolean> {
        const response = await this.monobank.fetchClientInfo({ token });
        return 'clientId' in response;
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
