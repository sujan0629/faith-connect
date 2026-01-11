import { createZodDto } from 'nestjs-zod';
import { UpdateProfileSchema } from '@faithconnect/shared';

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
