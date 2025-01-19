import { StoredBookSchema } from "@/api/book/model";
import type { Book } from "@/api/book/model";
import { books } from "@/api/book/repository";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

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

describe("Book API Endpoints", () => {
  describe("Bookstore - Public endpoints", () => {
    describe("GET /bookstore", () => {
      it("should return a list of books", async () => {
        // Act
        const response = await request(app).get("/bookstore");
        const responseBody: ServiceResponse<Book[]> = response.body;

        // Assert
        expect(response.statusCode).toEqual(StatusCodes.OK);
        expect(responseBody.success).toBeTruthy();
        expect(responseBody.message).toContain("Books found");
      });
    });

    describe("GET /bookstore/:id", () => {
      it("should return a book for a valid ID", async () => {
        // Arrange
        const testId = books[1].id;
        const expectedBook = books[1];

        // Act
        const response = await request(app).get(`/bookstore/${testId}`);
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
    describe("POST /books", () => {
      it("200 / should create new book and return StoredBookSchema", async () => {
        const tokenResponse = await request(app).post("/auth/").send({
          username: "john-doe",
          password: "XXX",
        });
        console.log("BODY", tokenResponse.body);
        const userToken = tokenResponse.body.responseObject.token;

        const newBookPayload: Book = {
          title: "Perdido train station",
          description:
            "Beneath the towering bleached ribs of a dead, ancient beast lies New Crobuzon, a squalid city where humans, Re-mades, and arcane races live in perpetual fear of Parliament and its brutal militia. The air and rivers are thick with factory pollutants and the strange effluents of alchemy, and the ghettos contain a vast mix of workers, artists, spies, junkies, and whores. In New Crobuzon, the unsavory deal is stranger to none—not even to Isaac, a brilliant scientist with a penchant for Crisis Theory.\n\nIsaac has spent a lifetime quietly carrying out his unique research. But when a half-bird, half-human creature known as the Garuda comes to him from afar, Isaac is faced with challenges he has never before fathomed. Though the Garuda's request is scientifically daunting, Isaac is sparked by his own curiosity and an uncanny reverence for this curious stranger.\n\nWhile Isaac's experiments for the Garuda turn into an obsession, one of his lab specimens demands attention: a brilliantly colored caterpillar that feeds on nothing but a hallucinatory drug and grows larger—and more consuming—by the day. What finally emerges from the silken cocoon will permeate every fiber of New Crobuzon—and not even the Ambassador of Hell will challenge the malignant terror it invokes . . .\n\nA magnificent fantasy rife with scientific splendor, magical intrigue, and wonderfully realized characters, told in a storytelling style in which Charles Dickens meets Neal Stephenson, Perdido Street Station offers an eerie, voluptuously crafted world that will plumb the depths of every reader's imagination.",
          price: 3900,
          coverImage: "https://m.media-amazon.com/images/I/81BMaOWWTVL._SY466_.jpg",
          published: true,
        };
        console.log(userToken);
        const storedBookResponse = await request(app)
          .post("/books/")
          .set("Authorization", `Bearer ${userToken}`)
          .send(newBookPayload);

        expect(storedBookResponse.statusCode).eql(200);
        console.log(storedBookResponse.body);
        console.log(StoredBookSchema.parse(storedBookResponse.body.responseObject));
      });
    });
  });
});
