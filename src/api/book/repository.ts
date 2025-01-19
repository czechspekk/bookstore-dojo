import type { AuthoredBook, Book, Criteria as BookCriteria, StoredBook } from "@/api/book/model";
import { filter, isUndefined, matches, omitBy } from "lodash";
import { v4 } from "uuid";

export const books: StoredBook[] = [
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
  private applyCriteria(books: StoredBook[], criteriaProps: BookCriteria): StoredBook[] {
    return filter(books, matches(criteriaProps));
  }
  async addBook(newBookPayload: AuthoredBook): Promise<StoredBook> {
    const now = new Date();
    const newBook = omitBy(
      {
        id: v4(),
        createdAt: now,
        updatedAt: now,
        published: false,
        publishedAt: newBookPayload.published ? now : undefined,
        ...newBookPayload,
      },
      isUndefined,
    );

    books.push(newBook);

    return newBook;
  }
  async getByCriteria(criteriaProps: BookCriteria = {}): Promise<StoredBook[]> {
    return this.applyCriteria(books, criteriaProps);
  }

  async getAll(): Promise<Book[]> {
    return books;
  }

  async getById(id: string, criteriaProps: BookCriteria = {}): Promise<Book | null> {
    return this.applyCriteria(books, criteriaProps).find((book) => book.id === id) || null;
  }
}
