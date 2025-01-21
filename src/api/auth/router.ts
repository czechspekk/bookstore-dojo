import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { AuthTokenResponseSchema } from "@/api/auth/model";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { authController } from "./controller";

export const authRegistry = new OpenAPIRegistry();

export const authRouter: Router = express.Router();

authRouter.post("/", authController.doAuth);

authRegistry.registerPath({
  method: "post",
  path: "/auth",
  tags: ["Auth"],
  responses: createApiResponse(z.array(AuthTokenResponseSchema), "success"),
});
