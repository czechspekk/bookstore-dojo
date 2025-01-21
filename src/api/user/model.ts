import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
  id: z.string().uuid(),
  authorName: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
