import type { Request, RequestHandler, Response } from "express";

import type { Book, PatchBookPayload } from "@/api/book/model";
import { bookService } from "@/api/book/service";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class BookController {
  public getBooks: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await bookService.findAll({ authorId: req.auth.usserId });
    return handleServiceResponse(serviceResponse, res);
  };

  public getBook: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id;
    const serviceResponse = await bookService.findById(id, { authorId: req.auth.userId });
    return handleServiceResponse(serviceResponse, res);
  };

  public getPublishedBooks: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await bookService.findAll({ published: true });
    return handleServiceResponse(serviceResponse, res);
  };

  public getPublishedBook: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id;
    const serviceResponse = await bookService.findById(id, { published: true });
    return handleServiceResponse(serviceResponse, res);
  };

  public postBooks: RequestHandler = async (req: Request, res: Response) => {
    const newBookPayload: Book = req.body;
    const { userId } = req.auth;
    const serviceResponse = await bookService.createBook(newBookPayload, userId);
    return handleServiceResponse(serviceResponse, res);
  };

  public patchBook: RequestHandler = async (req: Request, res: Response) => {
    const { userId } = req.auth;
    const { id } = req.params;
    const bookUpdatePayload: PatchBookPayload = req.body;
    const serviceResponse = await bookService.updateBook(id, bookUpdatePayload, userId);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const bookController = new BookController();
