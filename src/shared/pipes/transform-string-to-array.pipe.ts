import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TransformStringToArrayPipe implements PipeTransform {
    transform(value: string, metadata: ArgumentMetadata) {
        return value.split(',');
    }
}
