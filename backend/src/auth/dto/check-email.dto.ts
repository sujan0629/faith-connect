import { IsEmail, IsOptional } from 'class-validator';
import type { CheckEmailDto as ICheckEmailDto, Role } from '@faithconnect/shared';

export class CheckEmailDto implements ICheckEmailDto {
  @IsEmail()
  email: string;

  @IsOptional()
  role?: Role;
}
