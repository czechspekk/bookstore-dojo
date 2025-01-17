import type { Request, RequestHandler, Response } from "express";

import { bookService } from "@/api/book/service";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class BookController {
  public getBooks: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await bookService.findAll();
    return handleServiceResponse(serviceResponse, res);
  };

  public getBook: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id;
    const serviceResponse = await bookService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const bookController = new BookController();
