import { IsEmail, IsOptional, IsString, Length, Matches, ValidateIf } from 'class-validator';

export class VerifyMagicDto {
  @IsEmail()
  email: string;

  @ValidateIf((o) => !o.code)
  @IsString()
  token?: string;

  @ValidateIf((o) => !o.token)
  @IsOptional()
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code?: string;
}
