import { StatusCodes } from "http-status-codes";
import type { Mock } from "vitest";

import type { User } from "@/api/book/model";
import { BookRepository } from "@/api/book/repository";
import { BookService } from "@/api/book/service";

vi.mock("@/api/book/bookRepository");

describe.skip("bookService", () => {
  let bookServiceInstance: BookService;
  let bookRepositoryInstance: BookRepository;

  const mockBooks: Book[] = [
    {
      id: "970472fb-adf1-4cf0-99d8-11cf9ceb70b5",
      name: "Alice",
      email: "alice@example.com",
      age: 42,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "970472fb-adf1-4cf0-99d8-11cf9ceb70b1",
      name: "Bob",
      email: "bob@example.com",
      age: 21,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    bookRepositoryInstance = new BookRepository();
    bookServiceInstance = new BookService(bookRepositoryInstance);
  });

  describe("findAll", () => {
    it("return all books", async () => {
      // Arrange
      (bookRepositoryInstance.findAllAsync as Mock).mockReturnValue(mockBooks);

      // Act
      const result = await bookServiceInstance.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).equals("Books found");
      expect(result.responseObject).toEqual(mockBooks);
    });

    it("returns a not found error for no books found", async () => {
      // Arrange
      (bookRepositoryInstance.findAllAsync as Mock).mockReturnValue(null);

      // Act
      const result = await bookServiceInstance.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).equals("No Books found");
      expect(result.responseObject).toBeNull();
    });

    it("handles errors for findAllAsync", async () => {
      // Arrange
      (bookRepositoryInstance.findAllAsync as Mock).mockRejectedValue(new Error("Database error"));

      // Act
      const result = await bookServiceInstance.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).equals("An error occurred while retrieving books.");
      expect(result.responseObject).toBeNull();
    });
  });

  describe("findById", () => {
    it("returns a book for a valid ID", async () => {
      // Arrange
      const testId = 1;
      const mockBook = mockBooks.find((book) => book.id === testId);
      (bookRepositoryInstance.findByIdAsync as Mock).mockReturnValue(mockBook);

      // Act
      const result = await bookServiceInstance.findById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).equals("Book found");
      expect(result.responseObject).toEqual(mockBook);
    });

    it("handles errors for findByIdAsync", async () => {
      // Arrange
      const testId = 1;
      (bookRepositoryInstance.findByIdAsync as Mock).mockRejectedValue(new Error("Database error"));

      // Act
      const result = await bookServiceInstance.findById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).equals("An error occurred while finding book.");
      expect(result.responseObject).toBeNull();
    });

    it("returns a not found error for non-existent ID", async () => {
      // Arrange
      const testId = 1;
      (bookRepositoryInstance.findByIdAsync as Mock).mockReturnValue(null);

      // Act
      const result = await bookServiceInstance.findById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).equals("Book not found");
      expect(result.responseObject).toBeNull();
    });
  });
});
