import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateThreadDto {
  @IsMongoId()
  @IsNotEmpty()
  peerId: string;
}
