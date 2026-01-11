import { createZodDto } from 'nestjs-zod';
import { CheckEmailSchema } from '@faithconnect/shared';

export class CheckEmailDto extends createZodDto(CheckEmailSchema) {}
