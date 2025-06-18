import { z } from 'zod';

export const catSchema = z.object({
  name: z.string(),
  age: z.number(),
  breed: z.string(),
});
