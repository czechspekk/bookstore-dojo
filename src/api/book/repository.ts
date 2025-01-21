import type { AuthoredBook, Book, Criteria as BookCriteria, StoredBook } from "@/api/book/model";
import { filter, matches } from "lodash";
import { utc } from "moment";
import { v4 } from "uuid";

export const localBooks = [
  {
    id: "9583a380-d76d-11ef-8581-b77e5beeab64",
    title: "Book A",
    description: "Book A description",
    authorId: "fecd282a-d6be-11ef-8974-fbc2cb00b09b",
    price: 1233,
    published: false,
    coverImage: "https://some-image-url-1.png",
    createdAt: utc().add(-4, "days").valueOf(),
    updatedAt: utc().add("-1", "days").valueOf(),
    publishedAt: utc().add(-2, "days").valueOf(),
    unpublishedAt: utc().add(-1, "days").valueOf(),
  },
  {
    id: "9583a63c-d76d-11ef-8582-e3f2863584ec",
    title: "Book B",
    description: "Book B description",
    authorId: "fecd282a-d6be-11ef-8975-fax4cb00b09b",
    price: 8533,
    published: true,
    coverImage: "https://some-image-url-2.png",
    createdAt: utc().add(-4, "days").valueOf(),
    updatedAt: utc().add("-1", "days").valueOf(),
    publishedAt: utc().add(-2, "days").valueOf(),
  },
];

export class BookRepository {
  private booksMap: Map<string, StoredBook> = new Map();

  constructor(bookRecords: StoredBook[] = localBooks) {
    this.populateBooksMap(bookRecords);
  }

  private populateBooksMap(bookRecords: StoredBook[]): void {
    bookRecords.forEach((book) => this.booksMap.set(book.id, book));
  }

  private convertBooksMapToBooksArray(): StoredBook[] {
    return Array.from(this.booksMap, ([, book]) => book);
  }

  private applyCriteriaOnBooksMapValues(criteriaProps: BookCriteria): StoredBook[] {
    return filter(this.convertBooksMapToBooksArray(), matches(criteriaProps));
  }

  async addBook(newBookPayload: AuthoredBook): Promise<StoredBook> {
    const now = utc().valueOf();
    const newBook: StoredBook = {
      id: v4(),
      createdAt: now,
      updatedAt: now,
      published: false,
      publishedAt: newBookPayload.published ? now : undefined,
      ...newBookPayload,
    };

    this.booksMap.set(newBook.id, newBook);

    return newBook;
  }

  async save(id: string, payload: StoredBook): Promise<StoredBook> {
    this.booksMap.set(id, {
      ...payload,
      updatedAt: utc().valueOf(),
    });

    return payload;
  }

  async deleteBook(id: string): Promise<null> {
    this.booksMap.delete(id);
    return null;
  }

  async getByCriteria(criteriaProps: BookCriteria = {}): Promise<StoredBook[]> {
    return this.applyCriteriaOnBooksMapValues(criteriaProps);
  }

  async getAll(): Promise<Book[]> {
    return this.getByCriteria();
  }

  async getById(id: string, criteriaProps: BookCriteria = {}): Promise<StoredBook | undefined> {
    return this.applyCriteriaOnBooksMapValues({ ...criteriaProps, id }).shift();
  }
}
