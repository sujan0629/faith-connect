import { IsOptional, IsString } from 'class-validator';

export class GetLeadersDto {
  @IsOptional()
  @IsString()
  faith?: string;

  @IsOptional()
  @IsString()
  search?: string;
}