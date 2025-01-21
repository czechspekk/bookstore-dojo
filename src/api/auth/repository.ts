import type { AuthEntity } from "@/api/auth/model";
import { v4 } from "uuid";

export const auths: AuthEntity[] = [
  {
    id: v4(),
    username: "john-doe",
    password: "XXX",
    userId: "fecd282a-d6be-11ef-8974-fbc2cb00b09b",
    isAdmin: true,
    createdAt: new Date(),
    updatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
  },
  {
    id: v4(),
    username: "darth-vader",
    password: "XXX",
    userId: "fecd282a-d6be-11ef-8975-fax4cb00b09b",
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
  },
];

export class AuthRepository {
  async getByUsernameAndPassword(username: string, password: string): Promise<AuthEntity | void> {
    return auths.find((authEntity) => authEntity.username === username && authEntity.password === password);
  }
}
