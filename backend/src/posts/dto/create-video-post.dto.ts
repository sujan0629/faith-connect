import { z } from 'zod';

export const CreateVideoPostDtoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Content is required'),
  video: z.string().url('Video URL must be valid'),
  videoPublicId: z.string().min(1, 'Video public ID is required'),
  duration: z.number().min(60.001, 'Video must be longer than 60 seconds for a video post'),
});

export type CreateVideoPostDto = z.infer<typeof CreateVideoPostDtoSchema>;
