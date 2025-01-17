import type { Book } from "@/api/book/model";
import { v4 } from "uuid";

export const books: Book[] = [
  {
    id: v4(),
    title: "Book A",
    description: "Book A description",
    authorId: "uuid-format-string",
    price: 1233,
    coverImage: "https://some-image-url-1.png",
    createdAt: new Date(),
    updatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
  },
  {
    id: v4(),
    title: "Book B",
    description: "Book B description",
    authorId: "uuid-format-string",
    price: 8533,
    coverImage: "https://some-image-url-2.png",
    createdAt: new Date(),
    updatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later  },
  },
];

export class BookRepository {
  async findAllAsync(): Promise<Book[]> {
    return books;
  }

  async findByIdAsync(id: string): Promise<Book | null> {
    return books.find((book) => book.id === id) || null;
  }
}
