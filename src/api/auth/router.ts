import express, { type Router } from "express";
import { authController } from "./controller";

export const authRouter: Router = express.Router();

authRouter.post("/", authController.doAuth);
