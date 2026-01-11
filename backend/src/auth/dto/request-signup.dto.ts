import { IsEmail, IsIn, IsOptional } from 'class-validator';
import type { RequestSignupDto as IRequestSignupDto, Role } from '@faithconnect/shared';

export class RequestSignupDto implements IRequestSignupDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsIn(['worshiper', 'leader'])
  role?: Role;
}
