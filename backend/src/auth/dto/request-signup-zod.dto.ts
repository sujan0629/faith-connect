import { createZodDto } from 'nestjs-zod';
import { RequestSignupSchema } from '@faithconnect/shared';

export class RequestSignupDto extends createZodDto(RequestSignupSchema) {}
