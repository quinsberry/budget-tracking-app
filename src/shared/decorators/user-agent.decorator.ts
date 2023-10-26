import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const UserAgent = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['user-agent'];
});
