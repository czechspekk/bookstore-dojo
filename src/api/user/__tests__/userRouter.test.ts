import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { User } from "@/api/user/model";
import { users } from "@/api/user/repository";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";

describe("User API Endpoints", () => {
  describe("GET /users", () => {
    it("should return a list of users", async () => {
      // Act
      const response = await request(app).get("/users");
      const responseBody: ServiceResponse<User[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain("Users found");
      expect(responseBody.responseObject.length).toEqual(users.length);
      responseBody.responseObject.forEach((user, index) => compareUsers(users[index] as User, user));
    });
  });

  describe("GET /users/:id", () => {
    it("should return a user for a valid ID", async () => {
      // Arrange
      const expectedUser = users[0];
      const testId = expectedUser.id;

      // Act
      const response = await request(app).get(`/users/${testId}`);
      const responseBody: ServiceResponse<User> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain("User found");
      if (!expectedUser) throw new Error("Invalid test data: expectedUser is undefined");
      compareUsers(expectedUser, responseBody.responseObject);
    });

    it("should return a not found error for non-existent ID", async () => {
      // Arrange
      const testId = "c12367e3-e4fc-4973-bc99-f4a6d6b80743";

      // Act
      const response = await request(app).get(`/users/${testId}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain("User not found");
      expect(responseBody.responseObject).toBeNull();
    });

    it("should return a bad request for invalid ID format", async () => {
      // Act
      const invalidInput = 1;
      const response = await request(app).get(`/users/${invalidInput}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain("Invalid input");
      expect(responseBody.responseObject).toBeNull();
    });
  });
});

function compareUsers(mockUser: User, responseUser: User) {
  if (!mockUser || !responseUser) {
    throw new Error("Invalid test data: mockUser or responseUser is undefined");
  }

  expect(responseUser.id).toEqual(mockUser.id);
  expect(responseUser.authorName).toEqual(mockUser.authorName);
  expect(responseUser.createdAt).toEqual(mockUser.createdAt);
  expect(responseUser.updatedAt).toEqual(mockUser.updatedAt);
}
