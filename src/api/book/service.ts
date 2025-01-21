import { StatusCodes } from "http-status-codes";

import type { Book, Criteria as BookCriteria, PatchBookPayload, StoredBook } from "@/api/book/model";
import { BookRepository } from "@/api/book/repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

export class BookService {
  private bookRepository: BookRepository;

  constructor(repository: BookRepository = new BookRepository()) {
    this.bookRepository = repository;
  }

  async createBook(newBookPayload: Book, authorId: string): Promise<ServiceResponse<StoredBook | null>> {
    try {
      const existingBooks: StoredBook[] = await this.bookRepository.getByCriteria({
        title: newBookPayload.title,
        authorId,
      });

      if (existingBooks.length) {
        return ServiceResponse.failure(
          `You already own book with provided title: ${newBookPayload.title}`,
          null,
          StatusCodes.CONFLICT,
        );
      }

      const newBook = await this.bookRepository.addBook({ authorId, ...newBookPayload });

      return ServiceResponse.success<StoredBook>("Book created", newBook);
    } catch (ex) {
      const errorMessage = `Error creating book: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while creating book.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateBook(
    id: string,
    bookUpdatePayload: PatchBookPayload,
    userId: string,
  ): Promise<ServiceResponse<StoredBook | null>> {
    try {
      const existingRecord: StoredBook | undefined = await this.bookRepository.getById(id);

      if (existingRecord?.authorId !== userId) {
        return ServiceResponse.failure("No book found", null, StatusCodes.NOT_FOUND);
      }

      const updatedFullPayload: StoredBook = {
        ...existingRecord,
        ...bookUpdatePayload,
      };

      const savedBook = await this.bookRepository.save(id, updatedFullPayload);

      return ServiceResponse.success("Book updated", savedBook);
    } catch (ex) {
      const errorMessage = `Error updating book: $${(ex as Error).message}`;
      logger.error(errorMessage);

      return ServiceResponse.failure(
        "An error occurred while retrieving books.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(criteriaProps: BookCriteria = {}): Promise<ServiceResponse<StoredBook[] | null>> {
    try {
      const books = await this.bookRepository.getByCriteria(criteriaProps);

      if (!books || books.length === 0) {
        return ServiceResponse.failure("No Books found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<StoredBook[]>("Books found", books);
    } catch (ex) {
      const errorMessage = `Error finding all books: $${(ex as Error).message}`;
      logger.error(errorMessage);

      return ServiceResponse.failure(
        "An error occurred while retrieving books.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Retrieves a single book by their ID
  async findById(id: string, criteriaProps: BookCriteria = {}): Promise<ServiceResponse<StoredBook | null>> {
    try {
      const book = await this.bookRepository.getById(id, criteriaProps);
      if (!book) {
        return ServiceResponse.failure("Book not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<StoredBook>("Book found", book);
    } catch (ex) {
      const errorMessage = `Error finding book with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while finding book.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const bookService = new BookService();
