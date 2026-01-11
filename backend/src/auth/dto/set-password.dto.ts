import { IsEmail, IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import type { Role } from '../../users/schemas/user.schema';

export class SetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  signupToken: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+/, {
    message: 'Password must include uppercase, lowercase, and a number',
  })
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['worshiper', 'leader'])
  role?: Role;
}
