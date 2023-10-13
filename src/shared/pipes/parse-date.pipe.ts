import { BadRequestException, PipeTransform } from '@nestjs/common';

const isValidJsDate = (date: Date) => {
    return date.toString() !== 'Invalid Date';
};

export class ParseDatePipe implements PipeTransform<string, Date> {
    transform(value: string) {
        if (!value) {
            return undefined;
        }

        if (!isValidJsDate(new Date(value))) {
            throw new BadRequestException('Invalid date');
        }

        return new Date(value);
    }
}
