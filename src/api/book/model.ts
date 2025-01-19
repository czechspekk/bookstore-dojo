import { commonValidations } from "@/common/utils/commonValidation";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
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
  publishedAt: z.optional(z.string().datetime()),
  unpublishedAt: z.optional(z.string().datetime()),
  createdAt: z.string().datetime(),
  updatedAt: z.optional(z.string().datetime()),
});

export type StoredBook = z.infer<typeof StoredBookSchema>;

const CriteriaSchema = z.optional(
  z.object({
    published: z.optional(z.boolean()),
    authorId: z.optional(z.string().uuid()),
    title: z.optional(z.string()),
  }),
);

export type Criteria = z.infer<typeof CriteriaSchema>;

// Input Validation for 'GET users/:id' endpoint
export const GetBookSchema = z.object({
  params: z.object({ id: commonValidations.uuid }),
});

export const PostBookSchema = z.object({
  body: BookSchema,
});
