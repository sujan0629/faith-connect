import { Injectable, ForbiddenException } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import type { UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class IsLeaderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: UserDocument = request.user;

    if (!user || user.role !== 'leader') {
      throw new ForbiddenException('Only leaders can create posts');
    }

    return true;
  }
}
