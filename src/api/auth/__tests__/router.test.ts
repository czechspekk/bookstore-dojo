import { env } from "@/common/utils/envConfig";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import request from "supertest";

import type { AuthEntity, AuthTokenPayload, PostAuth } from "@/api/book/auth";
// import { books } from "@/api/book/repository"
// import type { ServiceResponse } from "@/common/models/serviceResponse"
import { app } from "@/server";

describe("Auth API endpoints", () => {
  describe("POST /auth", () => {
    it("400 / Should fail to authenticate with no username and password", async () => {
      const response = await request(app).post("/auth").send({});
      expect(response.statusCode).eql(400);
    });

    it("400 / should fail to authenticate with wrong username / password", async () => {
      const response = await request(app).post("/auth").send("sometext");
      expect(response.statusCode).eql(400);
    });

    it("400 / should not authenticate with wrong username / password", async () => {
      const payload: PostAuth = {
        username: "john-doe",
        password: "wrong-one",
      };
      const response = await request(app).post("/auth").send(payload);
      expect(response.statusCode).eql(400);
    });

    it("200 / should authenticate with correct username / password", async () => {
      const payload: PostAuth = {
        username: "john-doe",
        password: "XXX",
      };
      const response = await request(app).post("/auth").send(payload);
      expect(response.statusCode).eql(200);
      const {
        responseObject: { token },
      } = response.body;
      const tokenPayload: AuthTokenPayload = jwt.verify(token, env.jwtSecret);
      const { userId, isAdmin } = tokenPayload;
      expect(userId).eql("john-doe-uuid-string");
      expect(isAdmin).eql(true);
    });
  });
});
