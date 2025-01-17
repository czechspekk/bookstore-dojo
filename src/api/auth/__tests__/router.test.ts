import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { AuthEntity } from "@/api/book/auth";
// import { books } from "@/api/book/repository";
// import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";

describe("Auth API endpoints", () => {
  describe("POST /auth", () => {
    it("Should fail to authenticate and return 400", async () => {
      const response = await request(app).post("/auth").send({});
      expect(response.statusCode).eql(400);
      expect(response.body).eql({});
    });
  });
});
