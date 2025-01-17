import type { Book, Criteria as BookCriteria } from "@/api/book/model";
import { v4 } from "uuid";

export const books: Book[] = [
  {
    id: v4(),
    title: "Book A",
    description: "Book A description",
    authorId: "uuid-format-string",
    price: 1233,
    published: false,
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
    published: true,
    coverImage: "https://some-image-url-2.png",
    createdAt: new Date(),
    updatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later  },
  },
];

interface Getable {
  getAll(Criteria: BookCriteria): Promise<Book[]>;
  getById(id: string): Promise<Book | null>;
}

export class BookRepository implements Getable {
  async getAll(criteriaProps: BookCriteria = {}): Promise<Book[]> {
    return books;
  }

  async getById(id: string, criteriaProps: BookCriteria = {}): Promise<Book | null> {
    return books.find((book) => book.id === id) || null;
  }
}
