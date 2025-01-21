import { StoredBookSchema } from "@/api/book/model";
import type { Book, StoredBook } from "@/api/book/model";
import { localBooks as books } from "@/api/book/repository";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

function compareBooks(mockBook: Book | StoredBook, responseBook: StoredBook) {
  if (!mockBook || !responseBook) {
    throw new Error("Invalid test data: mockBook or responseBook is undefined");
  }

  expect(responseBook.title).toEqual(mockBook.title);
  expect(responseBook.description).toEqual(mockBook.description);
  expect(responseBook.price).toEqual(mockBook.price);
  expect(responseBook.coverImage).toEqual(mockBook.coverImage);
}

describe("Book API Endpoints", () => {
  describe("Bookstore - Public endpoints", () => {
    describe("GET /bookstore", () => {
      it("should return a list of books", async () => {
        // Act
        const response = await request(app).get("/bookstore");
        const responseBody: ServiceResponse<StoredBook[]> = response.body;

        // Assert
        expect(response.statusCode).toEqual(StatusCodes.OK);
        expect(responseBody.success).toBeTruthy();
        expect(responseBody.message).toContain("Books found");
      });
    });

    describe("GET /bookstore/:id", () => {
      it("should return a book for a valid ID", async () => {
        // Arrange
        const testId = books[0].id;
        const expectedBook = books[0];

        // Act
        const response = await request(app).get(`/bookstore/${testId}`);
        const responseBody: ServiceResponse<StoredBook> = response.body;

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
        const response = await request(app).get(`/bookstore/${testId}`);
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
        const response = await request(app).get(`/bookstore/${invalidInput}`);
        const responseBody: ServiceResponse = response.body;

        // Assert
        expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(responseBody.success).toBeFalsy();
        expect(responseBody.message).toContain("Invalid input");
        expect(responseBody.responseObject).toBeNull();
      });
    });
  });

  describe("Books administration - JWT Authed users only", () => {
    describe("Auth protection", () => {
      it("GET 401 /books - should not provide access without token", async () => {
        const bookResponse = await request(app).get("/books/");
        expect(bookResponse.statusCode).eql(401);
      });
      it("POST 401 /books - should not provide access without token", async () => {
        const bookResponse = await request(app).post("/books/").send({ some: "data" });
        expect(bookResponse.statusCode).eql(401);
      });
      it("GET 401 /books/:id - should not provide access without token", async () => {
        const bookResponse = await request(app).get(`/books/:${books[0].id}`);
        expect(bookResponse.statusCode).eql(401);
      });
      it("PATCH 401 /books/:id - should not provide access without token", async () => {
        const bookResponse = await request(app).patch(`/books/:${books[0].id}`).send({ title: "Updated title" });
        expect(bookResponse.statusCode).eql(401);
      });
    });
    describe("POST /books", () => {
      it("200 / should create new book and return StoredBookSchema", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "john-doe",
          password: "YAY",
        });
        const userToken = tokenResponse.body.responseObject.token;

        const newBookPayload: Book = {
          title: "Perdido train station",
          description: "Beneath the towering bleached ribs ...",
          price: 3900,
          coverImage: "https://m.media-amazon.com/images/I/81BMaOWWTVL._SY466_.jpg",
          published: true,
        };
        const storedBookResponse = await request(app)
          .post("/books/")
          .set("Authorization", `Bearer ${userToken}`)
          .send(newBookPayload);

        expect(storedBookResponse.statusCode).eql(200);
        const storedBook = StoredBookSchema.parse(storedBookResponse.body.responseObject);
        compareBooks(newBookPayload, storedBook);

        const existingBookResponse = await request(app)
          .get(`/books/${storedBook.id}`)
          .set("Authorization", `Bearer ${userToken}`);

        const existingBook = StoredBookSchema.parse(existingBookResponse.body.responseObject);
        compareBooks(storedBook, existingBook);
      });
      it("400 / should not allow wrong payloads", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "john-doe",
          password: "YAY",
        });
        const userToken = tokenResponse.body.responseObject.token;
        const postBooksResponse = await request(app)
          .post("/books/")
          .set("Authorization", `Bearer ${userToken}`)
          .send({});

        expect(postBooksResponse.statusCode).eql(StatusCodes.BAD_REQUEST);
      });

      it("403 / forbidden books", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "darth-vader",
          password: "YAY",
        });
        const userToken = tokenResponse.body.responseObject.token;

        const newBookPayload: Book = {
          title: "Perdido train station",
          description: "Beneath the towering bleached ribs ...",
          price: 3900,
          coverImage: "https://m.media-amazon.com/images/I/81BMaOWWTVL._SY466_.jpg",
          published: true,
        };
        const storedBookResponse = await request(app)
          .post("/books/")
          .set("Authorization", `Bearer ${userToken}`)
          .send(newBookPayload);

        expect(storedBookResponse.statusCode).eql(StatusCodes.FORBIDDEN);
      });
    });

    describe("GET /books/:id", () => {
      it("200 / should return owned resource", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "john-doe",
          password: "YAY",
        });
        const userToken = tokenResponse.body.responseObject.token;
        const getBookResponse = await request(app)
          .get(`/books/${books[0].id}`)
          .set("Authorization", `Bearer ${userToken}`);

        const storedBook = StoredBookSchema.parse(getBookResponse.body.responseObject);

        compareBooks(storedBook, books[0]);
      });
      it("404 / should not allow get on not owned resource", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "john-doe",
          password: "YAY",
        });
        const userToken = tokenResponse.body.responseObject.token;
        const getBookResponse = await request(app)
          .get(`/books/${books[1].id}`)
          .set("Authorization", `Bearer ${userToken}`);

        expect(getBookResponse.statusCode).eql(StatusCodes.NOT_FOUND);
      });
    });

    describe("PATCH /books/:id", () => {
      it("200 / should update existing book and return StoredBookSchema", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "john-doe",
          password: "YAY",
        });
        const userToken = tokenResponse.body.responseObject.token;
        const patchedBookResponse = await request(app)
          .patch(`/books/${books[0].id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({ title: "Updated title" });
        const patchedBook = StoredBookSchema.parse(patchedBookResponse.body.responseObject);
        expect(patchedBook.title).eql("Updated title");
      });

      it("404 / should not allow update on not owned resource", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "john-doe",
          password: "YAY",
        });
        const userToken = tokenResponse.body.responseObject.token;
        const patchedBookResponse = await request(app)
          .patch(`/books/${books[1].id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({ title: "Updated title" });

        expect(patchedBookResponse.statusCode).eql(StatusCodes.NOT_FOUND);
      });
      it("403 / forbidden books", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "darth-vader",
          password: "YAY",
        });
        const userToken = tokenResponse.body.responseObject.token;

        const storedBookResponse = await request(app)
          .patch(`/books/${books[1].id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({ published: true });

        expect(storedBookResponse.statusCode).eql(StatusCodes.FORBIDDEN);
      });
    });
    describe("PUT /books/:id", () => {
      it("200 / should replace existing book and return StoredBookSchema", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "john-doe",
          password: "YAY",
        });
        const userToken = tokenResponse.body.responseObject.token;
        const newContent: Book = {
          title: "Updated title",
          description: "Updated description",
          price: 9999,
          coverImage: "https://new-url",
        };
        const putBookResponse = await request(app)
          .put(`/books/${books[0].id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send(newContent);
        const putBook = StoredBookSchema.parse(putBookResponse.body.responseObject);
        compareBooks(newContent, putBook);
      });
      it("403 / should not allow forbidden book", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "darth-vader",
          password: "YAY",
        });
        const userToken = tokenResponse.body.responseObject.token;
        const newContent: Book = {
          title: "Updated title",
          description: "Updated description",
          price: 9999,
          coverImage: "https://new-url",
          published: true,
        };
        const putBookResponse = await request(app)
          .put(`/books/${books[1].id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send(newContent);

        expect(putBookResponse.statusCode).eql(StatusCodes.FORBIDDEN);
      });
      it("400 / should not allow wrong payloads", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "john-doe",
          password: "YAY",
        });
        const userToken = tokenResponse.body.responseObject.token;
        const putBookResponse = await request(app)
          .put(`/books/${books[1].id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({});

        expect(putBookResponse.statusCode).eql(StatusCodes.BAD_REQUEST);
      });

      it("404 / should not allow update on not owned resource", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "john-doe",
          password: "YAY",
        });
        const userToken = tokenResponse.body.responseObject.token;
        const newContent: Book = {
          title: "Updated title",
          description: "Updated description",
          price: 9999,
          coverImage: "https://new-url",
        };
        const putBookResponse = await request(app)
          .put(`/books/${books[1].id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send(newContent);

        expect(putBookResponse.statusCode).eql(StatusCodes.NOT_FOUND);
      });
    });

    describe("DELETE /books/:id", () => {
      it("204 / should delete existing book and return no content", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "john-doe",
          password: "YAY",
        });
        const userToken = tokenResponse.body.responseObject.token;
        const deletedBookResponse = await request(app)
          .delete(`/books/${books[0].id}`)
          .set("Authorization", `Bearer ${userToken}`);
        expect(deletedBookResponse.statusCode).eql(StatusCodes.NO_CONTENT);
      });

      it("404 / should not allow update on not owned resource", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "john-doe",
          password: "YAY",
        });
        const userToken = tokenResponse.body.responseObject.token;
        const patchedBookResponse = await request(app)
          .patch(`/books/${books[1].id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({ title: "Updated title" });

        expect(patchedBookResponse.statusCode).eql(StatusCodes.NOT_FOUND);
      });
    });
  });
});
