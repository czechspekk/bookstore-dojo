import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { Book } from "@/api/book/model";
import { books } from "@/api/book/repository";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";

describe("Book API Endpoints", () => {
  describe("GET /books", () => {
    it("should return a list of books", async () => {
      // Act
      const response = await request(app).get("/books");
      const responseBody: ServiceResponse<Book[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain("Books found");
      expect(responseBody.responseObject.length).toEqual(books.length);
      responseBody.responseObject.forEach((book, index) => compareBooks(books[index] as Book, book));
    });
  });

  describe("GET /books/:id", () => {
    it("should return a book for a valid ID", async () => {
      // Arrange
      const testId = books[1].id;
      const expectedBook = books[1];

      // Act
      const response = await request(app).get(`/books/${testId}`);
      const responseBody: ServiceResponse<Book> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain("Book found");
      if (!expectedBook) throw new Error("Invalid test data: expectedBook is undefined");
      compareBooks(expectedBook, responseBody.responseObject);
    });

    it("should return a not found error for non-existent ID", async () => {
      // Arrange
      const testId = "970472fb-adf1-4cf0-99d8-11cf9ceb70b5";

      // Act
      const response = await request(app).get(`/books/${testId}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain("Book not found");
      expect(responseBody.responseObject).toBeNull();
    });

    it("should return a bad request for invalid ID format", async () => {
      // Act
      const invalidInput = "abc";
      const response = await request(app).get(`/books/${invalidInput}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain("Invalid input");
      expect(responseBody.responseObject).toBeNull();
    });
  });
});

function compareBooks(mockBook: Book, responseBook: Book) {
  if (!mockBook || !responseBook) {
    throw new Error("Invalid test data: mockBook or responseBook is undefined");
  }

  expect(responseBook.id).toEqual(mockBook.id);
  expect(responseBook.name).toEqual(mockBook.name);
  expect(responseBook.email).toEqual(mockBook.email);
  expect(responseBook.age).toEqual(mockBook.age);
  expect(new Date(responseBook.createdAt)).toEqual(mockBook.createdAt);
  expect(new Date(responseBook.updatedAt)).toEqual(mockBook.updatedAt);
}
