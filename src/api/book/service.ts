import { StatusCodes } from "http-status-codes";
import { filter, matches } from "lodash";
import { utc } from "moment";

import type { AuthoredBook, Book, Criteria as BookCriteria, PatchBookPayload, StoredBook } from "@/api/book/model";
import { BookRepository } from "@/api/book/repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

const forbiddenBooks: BookCriteria[] = [
  {
    authorId: "b00c67e3-e4fc-4973-bc99-f4a6d6b80743",
    published: true,
  },
];

export class BookService {
  private bookRepository: BookRepository;
  private disallowedBookPropertyCombinations: BookCriteria[];

  constructor(
    repository: BookRepository = new BookRepository(),
    disallowedBookPropertyCombinations: BookCriteria[] = forbiddenBooks,
  ) {
    this.bookRepository = repository;
    this.disallowedBookPropertyCombinations = disallowedBookPropertyCombinations;
  }

  private isBookAllowed(book: AuthoredBook): boolean {
    return !this.disallowedBookPropertyCombinations.some(
      (criteria: BookCriteria) => filter([book], matches(criteria)).length,
    );
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
      const authoredBook: AuthoredBook = { authorId, ...newBookPayload };
      if (!this.isBookAllowed(authoredBook)) {
        return ServiceResponse.failure("This book is not allowed", null, StatusCodes.FORBIDDEN);
      }
      const newBook = await this.bookRepository.addBook(authoredBook);

      return ServiceResponse.success<StoredBook>("Book created", newBook);
    } catch (ex) {
      const errorMessage = `Error creating book: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while creating book.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  private buildPublishedTimestamps(existingRecord: StoredBook, updatePayload: PatchBookPayload) {
    const now = utc().valueOf();
    if (Object.keys(updatePayload).includes("published")) {
      if (updatePayload.published && !existingRecord.published) {
        return { publishedAt: now };
      }
      if (!updatePayload.published && existingRecord.published) {
        return { unpublishedAt: now };
      }
    }

    return {};
  }
  async updateBook(
    id: string,
    bookUpdatePayload: PatchBookPayload,
    userId: string,
  ): Promise<ServiceResponse<StoredBook | null>> {
    try {
      const existingRecord: StoredBook | undefined = await this.bookRepository.getById(id, { authorId: userId });
      if (!existingRecord) {
        return ServiceResponse.failure("No book found", null, StatusCodes.NOT_FOUND);
      }

      const publishedTimestamps = this.buildPublishedTimestamps(existingRecord, bookUpdatePayload);
      const updatedFullPayload: StoredBook = {
        ...existingRecord,
        ...bookUpdatePayload,
        ...publishedTimestamps,
      };

      if (!this.isBookAllowed(updatedFullPayload)) {
        return ServiceResponse.failure("This book is not allowed", null, StatusCodes.FORBIDDEN);
      }

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

  async replaceBook(id: string, bookPayload: Book, userId: string): Promise<ServiceResponse<StoredBook | null>> {
    try {
      const existingRecord: StoredBook | undefined = await this.bookRepository.getById(id, { authorId: userId });
      if (!existingRecord) {
        return ServiceResponse.failure("No book found", null, StatusCodes.NOT_FOUND);
      }

      const publishedTimestamps = this.buildPublishedTimestamps(existingRecord, bookPayload);
      const updatedFullPayload: StoredBook = {
        ...existingRecord,
        ...bookPayload,
        ...publishedTimestamps,
      };

      if (!this.isBookAllowed(updatedFullPayload)) {
        return ServiceResponse.failure("This book is not allowed", null, StatusCodes.FORBIDDEN);
      }

      const savedBook = await this.bookRepository.save(id, updatedFullPayload);
      return ServiceResponse.success("Book replaced", savedBook);
    } catch (ex) {
      const errorMessage = `Error replacing book: $${(ex as Error).message}`;
      logger.error(errorMessage);

      return ServiceResponse.failure(
        "An error occurred while retrieving books.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteBook(id: string, userId: string): Promise<ServiceResponse<null>> {
    try {
      const existingRecord: StoredBook | undefined = await this.bookRepository.getById(id, { authorId: userId });
      if (!existingRecord) {
        return ServiceResponse.failure("No book found", null, StatusCodes.NOT_FOUND);
      }

      await this.bookRepository.deleteBook(id);
      return ServiceResponse.success("Book deleted", null, StatusCodes.NO_CONTENT);
    } catch (ex) {
      const errorMessage = `Error deleting book: $${(ex as Error).message}`;
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
