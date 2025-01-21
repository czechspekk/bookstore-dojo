import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {
  BookSchema,
  DeleteBookSchema,
  GetBookSchema,
  PatchBookPayloadSchema,
  PatchBookSchema,
  PostBooksSchema,
  PutBookSchema,
  StoredBookSchema,
} from "@/api/book/model";
import { validateRequest } from "@/common/utils/httpHandlers";
import { bookController } from "./controller";

export const bookRegistry = new OpenAPIRegistry();
export const bookstoreRouter: Router = express.Router();
export const bookRouter: Router = express.Router();

bookRegistry.register("Book", StoredBookSchema);

bookstoreRouter.get("/", bookController.getPublishedBooks);
bookstoreRouter.get("/:id", validateRequest(GetBookSchema), bookController.getPublishedBook);

bookRouter.get("/", bookController.getBooks);
bookRouter.post("/", validateRequest(PostBooksSchema), bookController.postBooks);

bookRouter.get("/:id", validateRequest(GetBookSchema), bookController.getBook);
bookRouter.patch("/:id", validateRequest(PatchBookSchema), bookController.patchBook);
bookRouter.put("/:id", validateRequest(PutBookSchema), bookController.putBook);
bookRouter.delete("/:id", validateRequest(DeleteBookSchema), bookController.deleteBook);

bookRegistry.registerPath({
  method: "get",
  path: "/books/",
  tags: ["Book"],
  request: {
    headers: z.object({
      Authorization: z.string(),
    }),
  },
  responses: createApiResponse(z.array(StoredBookSchema), "Success"),
});

bookRegistry.registerPath({
  method: "post",
  path: "/books/",
  tags: ["Book"],
  request: {
    headers: z.object({
      Authorization: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: BookSchema,
        },
      },
    },
  },
  responses: createApiResponse(StoredBookSchema, "Success"),
});

bookRegistry.registerPath({
  method: "get",
  path: "/books/{id}",
  tags: ["Book"],
  request: {
    params: GetBookSchema.shape.params,
    headers: z.object({
      Authorization: z.string(),
    }),
  },
  responses: createApiResponse(StoredBookSchema, "Success"),
});

bookRegistry.registerPath({
  method: "patch",
  path: "/books/{id}",
  tags: ["Book"],
  request: {
    params: GetBookSchema.shape.params,
    headers: z.object({
      Authorization: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: PatchBookPayloadSchema,
        },
      },
    },
  },
  responses: createApiResponse(StoredBookSchema, "Success"),
});

bookRegistry.registerPath({
  method: "put",
  path: "/books/{id}",
  tags: ["Book"],
  request: {
    params: GetBookSchema.shape.params,
    headers: z.object({
      Authorization: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: BookSchema,
        },
      },
    },
  },
  responses: createApiResponse(StoredBookSchema, "Success"),
});

bookRegistry.registerPath({
  method: "delete",
  path: "/books/{id}",
  tags: ["Book"],
  request: {
    params: GetBookSchema.shape.params,
    headers: z.object({
      Authorization: z.string(),
    }),
  },
  responses: createApiResponse(z.null(), "Success", 204),
});

bookRegistry.registerPath({
  method: "get",
  path: "/bookstore",
  tags: ["Bookstore"],
  request: { params: GetBookSchema.shape.params },
  responses: createApiResponse(z.array(StoredBookSchema), "Success"),
});

bookRegistry.registerPath({
  method: "get",
  path: "/bookstore/{id}",
  tags: ["Bookstore"],
  request: { params: GetBookSchema.shape.params },
  responses: createApiResponse(StoredBookSchema, "Success"),
});
