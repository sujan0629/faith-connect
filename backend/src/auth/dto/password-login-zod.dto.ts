import { createZodDto } from 'nestjs-zod';
import { PasswordLoginSchema } from '@faithconnect/shared';

export class PasswordLoginDto extends createZodDto(PasswordLoginSchema) {}
