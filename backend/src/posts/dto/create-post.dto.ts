import { z } from 'zod';

export const CreatePostDtoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Content is required'),
  image: z.string().url().optional(),
  imagePublicId: z.string().optional(),
});

export type CreatePostDto = z.infer<typeof CreatePostDtoSchema>;
