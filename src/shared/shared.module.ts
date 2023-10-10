import { Global, Module } from '@nestjs/common';

import { MonobankService } from './services/monobank.service';
import { PasswordService } from './services/password.service';

const providers = [PasswordService, MonobankService];

@Global()
@Module({
    providers,
    exports: providers,
})
export class SharedModule {}
