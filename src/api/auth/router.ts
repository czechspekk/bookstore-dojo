import express, { type Router } from "express";
import { StatusCodes } from "http-status-codes";

export const authRouter: Router = express.Router();

authRouter.post("/", (req, res) => {
  const username = req.body?.username;
  const password = req.body?.password;

  if (!username || !password) {
    return res.send(StatusCodes.BAD_REQUEST);
  }

  return res.json({
    meta: {
      success: true,
    },
    data: {
      token: "jwt-token",
    },
  });
});
