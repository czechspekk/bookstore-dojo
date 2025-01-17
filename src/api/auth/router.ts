import express, { type Router } from "express";
import { StatusCodes } from "http-status-codes";

export const authRouter: Router = express.Router();
authRouter.post("/", (req, res) => {
  return res.send(StatusCodes.BAD_REQUEST);
});
