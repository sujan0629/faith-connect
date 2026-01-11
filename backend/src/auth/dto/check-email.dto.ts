import { IsEmail } from 'class-validator';
import type { CheckEmailDto as ICheckEmailDto } from '@faithconnect/shared';

export class CheckEmailDto implements ICheckEmailDto {
  @IsEmail()
  email: string;
}
