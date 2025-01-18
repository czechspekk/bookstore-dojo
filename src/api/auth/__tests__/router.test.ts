import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { AuthEntity } from "@/api/book/auth";
// import { books } from "@/api/book/repository";
// import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";

describe("Auth API endpoints", () => {
  describe("POST /auth", () => {
    it("400 / Should fail to authenticate with no username and password", async () => {
      const response = await request(app).post("/auth").send({});
      expect(response.statusCode).eql(400);
    });

    it("400 / should fail to authenticate with wrong bodyd", async () => {
      const response = await request(app).post("/auth").send("sometext");
      expect(response.statusCode).eql(400);
    });

    it("200 / should authenticate with any username / password", async () => {
      const payload = {
        username: "john-doe",
        password: "XXX",
      };
      const response = await request(app).post("/auth").send(payload);
      expect(response.statusCode).eql(200);
    });
  });
});
