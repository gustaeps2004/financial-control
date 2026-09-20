import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthTokenPayload } from '../../../domain/ports/token-generator';
import { AuthenticatedRequest } from '../guards/jwt-auth.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthTokenPayload => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
