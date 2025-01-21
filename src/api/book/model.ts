import { commonValidations } from "@/common/utils/commonValidation";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { get, set } from "lodash";
import { z } from "zod";

extendZodWithOpenApi(z);

export const BookSchema = z.object({
  title: z.string(),
  description: z.string(),
  // price is stored in cents
  price: z.number(),
  coverImage: z.string(),
  published: z.optional(z.boolean()),
});

export type Book = z.infer<typeof BookSchema>;

export const AuthoredBookSchema = BookSchema.extend({
  authorId: z.string().uuid(),
});

export type AuthoredBook = z.infer<typeof AuthoredBookSchema>;

export const StoredBookSchema = AuthoredBookSchema.extend({
  id: z.string().uuid(),
  price: z.number(),
  publishedAt: z.optional(z.number()),
  unpublishedAt: z.optional(z.number()),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type StoredBook = z.infer<typeof StoredBookSchema>;

const CriteriaSchema = z.optional(
  z.object({
    id: z.optional(z.string().uuid()),
    published: z.optional(z.boolean()),
    authorId: z.optional(z.string().uuid()),
    title: z.optional(z.string()),
  }),
);

export type Criteria = z.infer<typeof CriteriaSchema>;

// Input Validation for 'GET books/:id'
export const GetBookSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

// Input Validation for 'POST books/'
export const PostBookSchema = z.object({
  body: BookSchema,
});

export type PatchBookPayload = z.infer<typeof PatchBookSchema>;

// Input Validation for 'PATCH books/:id'
export const PatchBookSchema = z.object({
  ...Object.keys(BookSchema).reduce((acc, key: string) => {
    set(acc, key, z.optional(get(BookSchema, key)));

    return acc;
  }, {}),
});
