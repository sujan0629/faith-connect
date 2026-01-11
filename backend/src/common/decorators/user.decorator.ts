import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../../users/schemas/user.schema';

export const AuthUser = createParamDecorator((data: unknown, ctx: ExecutionContext): UserDocument | undefined => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as UserDocument | undefined;
});
