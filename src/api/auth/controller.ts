import type { Request, RequestHandler, Response } from "express";

import { authService } from "@/api/auth/service";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class AuthController {
  public doAuth: RequestHandler = async (req: Request, res: Response) => {
    const username: string = req.body?.username;
    const password: string = req.body?.password;
    // add type declaration
    const serviceResponse = await authService.authenticate(username, password);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const authController = new AuthController();
