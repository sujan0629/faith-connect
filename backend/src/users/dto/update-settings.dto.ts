import { z } from 'zod';

export const UpdateSettingsDtoSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  emailNotificationsEnabled: z.boolean().optional(),
  allowMessagesFromAnyone: z.boolean().optional(),
  privateProfile: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  whoCanLike: z.enum(['everyone', 'followers', 'none']).optional(),
  blockedContentTopics: z.array(z.string()).optional(),
});

export type UpdateSettingsDto = z.infer<typeof UpdateSettingsDtoSchema>;
