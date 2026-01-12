import { z } from 'zod';

export const CreateWatchEventDtoSchema = z.object({
  reelId: z.string().min(1, 'Reel ID is required'),
  watchTime: z.number().min(0, 'Watch time must be positive'),
  duration: z.number().min(1, 'Duration must be positive'),
  completed: z.boolean().optional().default(false),
});

export type CreateWatchEventDto = z.infer<typeof CreateWatchEventDtoSchema>;
