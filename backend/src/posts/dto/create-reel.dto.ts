import { z } from 'zod';

export const CreateReelDtoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Caption is required'),
  video: z.string().url('Video URL must be valid'),
  videoPublicId: z.string().min(1, 'Video public ID is required'),
  duration: z.number().max(60, 'Video must be 60 seconds or less for a reel'),
});

export type CreateReelDto = z.infer<typeof CreateReelDtoSchema>;
