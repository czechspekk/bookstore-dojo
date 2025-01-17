import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { BookSchema, GetBookSchema } from "@/api/book/model";
import { validateRequest } from "@/common/utils/httpHandlers";
import { bookController } from "./controller";

export const bookRegistry = new OpenAPIRegistry();
export const bookstoreRouter: Router = express.Router();
export const bookRouter: Router = express.Router();

bookRegistry.register("Book", BookSchema);

bookstoreRouter.get("/", bookController.getPublishedBooks);
bookstoreRouter.get("/:id", validateRequest(GetBookSchema), bookController.getPublishedBook);

bookRouter.get("/", bookController.getBooks);
bookRouter.get("/:id", validateRequest(GetBookSchema), bookController.getBook);

bookRegistry.registerPath({
  method: "get",
  path: "/bookstore/",
  tags: ["Book"],
  responses: createApiResponse(z.array(BookSchema), "Success"),
});

bookRegistry.registerPath({
  method: "get",
  path: "/bookstore/{id}",
  tags: ["Book"],
  request: { params: GetBookSchema.shape.params },
  responses: createApiResponse(BookSchema, "Success"),
});
