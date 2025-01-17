import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { BookSchema, GetBookSchema } from "@/api/book/model";
import { validateRequest } from "@/common/utils/httpHandlers";
import { bookController } from "./controller";

export const bookRegistry = new OpenAPIRegistry();
export const bookRouter: Router = express.Router();

bookRegistry.register("Book", BookSchema);

bookRegistry.registerPath({
  method: "get",
  path: "/books",
  tags: ["Book"],
  responses: createApiResponse(z.array(BookSchema), "Success"),
});

bookRouter.get("/", bookController.getBooks);

bookRegistry.registerPath({
  method: "get",
  path: "/books/{id}",
  tags: ["Book"],
  request: { params: GetBookSchema.shape.params },
  responses: createApiResponse(BookSchema, "Success"),
});

bookRouter.get("/:id", validateRequest(GetBookSchema), bookController.getBook);
