import { commonValidations } from "@/common/utils/commonValidation";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type Book = z.infer<typeof BookSchema>;

export const BookSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  authorId: z.string().uuid(),
  // price is stored in cents
  price: z.number(),
  coverImage: z.string(),
  published: z.boolean(),
  publishedAt: z.optional(z.date()),
  unpublishedAt: z.optional(z.date()),
  createdAt: z.date(),
  updatedAt: z.optional(z.date()),
});

const CriteriaSchema = z.optional(
  z.object({
    published: z.optional(z.boolean()),
  }),
);

export type Criteria = z.infer<typeof CriteriaSchema>;

// Input Validation for 'GET users/:id' endpoint
export const GetBookSchema = z.object({
  params: z.object({ id: commonValidations.uuid }),
});
