import type { User } from "@/api/user/model";
import { utc } from "moment";

export const users: User[] = [
  {
    id: "fecd282a-d6be-11ef-8974-fbc2cb00b09b",
    authorName: "Francis Drake",
    createdAt: utc().add(-4, "days").valueOf(),
    updatedAt: utc().add("-1", "days").valueOf(),
  },
  {
    id: "b00c67e3-e4fc-4973-bc99-f4a6d6b80743",
    authorName: "Darth Vader",
    createdAt: utc().add(-4, "days").valueOf(),
    updatedAt: utc().add("-1", "days").valueOf(),
  },
];

export class UserRepository {
  async findAllAsync(): Promise<User[]> {
    return users;
  }

  async findByIdAsync(id: string): Promise<User | null> {
    return users.find((user) => user.id === id) || null;
  }
}
