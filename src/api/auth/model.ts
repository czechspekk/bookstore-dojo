import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type AuthEntity = z.infer<typeof AuthEntitySchema>;
export const AuthEntitySchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  password: z.string(),
  userId: z.string().uuid(),
  isAdmin: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AuthTokenPayloadSchema = z.object({
  userId: z.string(),
  isAdmin: z.boolean(),
});
export type AuthTokenPayload = z.infer<typeof AuthTokenPayloadSchema>;

export const AuthPayloadSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const PostAuthSchema = z.object({
  body: AuthPayloadSchema,
});

export type PostAuth = z.infer<typeof PostAuthSchema>;

export const AuthTokenResponseSchema = z.object({
  token: z.string().jwt(),
});

export type AuthTokenResponse = z.infer<typeof AuthTokenResponseSchema>;
