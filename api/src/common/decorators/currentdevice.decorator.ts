import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentDevice = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Assuming DeviceAuthGuard injects device info into request.user
  },
);
