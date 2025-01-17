import { env } from "@/common/utils/envConfig";
import type { Next, Request, RequestHandler, Response } from "express";
import { expressjwt as jwt } from "express-jwt";
import { StatusCodes } from "http-status-codes";

const authMiddleware: RequestHandler = (req: Request, res: Response, next: Next) =>
  jwt({ secret: env.jwtSecret, algorithms: ["HS256"] })(req, res, next);

export const authErrorHandler: ErrorRequestHandler = (err, _req: Request, res: Response, next: Next) => {
  if (err.name === "UnauthorizedError") {
    res.status(StatusCodes.UNAUTHORIZED).send();
  } else {
    next(err);
  }
};

export default authMiddleware;
