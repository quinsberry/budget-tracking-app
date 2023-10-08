import { Global, Module } from "@nestjs/common";
import { PasswordService } from "./services/password.service";
import { MonobankService } from "./services/monobank.service";


const providers = [
    PasswordService,
    MonobankService,
];

@Global()
@Module({
    providers,
    exports: providers,
})
export class SharedModule {}