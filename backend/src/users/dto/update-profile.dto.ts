import { IsArray, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import type { UpdateProfileDto as IUpdateProfileDto, Role } from '@faithconnect/shared';

export class UpdateProfileDto implements IUpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  faith?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  denomination?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentFocus?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  audiencePrefs?: string[];

  @IsOptional()
  @IsString()
  role?: Role;

  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;
}
