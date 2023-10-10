import { Injectable, ParseUUIDPipe } from '@nestjs/common';

@Injectable()
export class ParseUUIDOrUndefinedPipe extends ParseUUIDPipe {
    protected isUUID(str: unknown, version?: string) {
        return typeof str === 'undefined' || super.isUUID(str, version);
    }
}
