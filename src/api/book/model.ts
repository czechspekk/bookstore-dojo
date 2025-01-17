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
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Input Validation for 'GET users/:id' endpoint
export const GetBookSchema = z.object({
  params: z.object({ id: commonValidations.uuid }),
});
