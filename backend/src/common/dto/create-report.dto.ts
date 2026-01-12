import { z } from 'zod';

export const CreateReportDtoSchema = z.object({
  reportedId: z.string().min(1, 'Reported ID is required'),
  reportedType: z.enum(['user', 'post']),
  reason: z.enum([
    'spam',
    'harassment',
    'hate_speech',
    'inappropriate_content',
    'misinformation',
    'copyright',
    'other',
  ]),
  description: z.string().optional(),
});

export type CreateReportDto = z.infer<typeof CreateReportDtoSchema>;
