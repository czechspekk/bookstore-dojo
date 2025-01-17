import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type AuthEntity = z.infer<typeof AuthEntitySchema>;
export const AuthEntitySchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  password: z.string(),
  authorId: z.string().uuid(),
  isAdmin: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PostAuthSchema = z.object({
  body: z.object({
    username: z.string(),
    password: z.string(),
  }),
});
