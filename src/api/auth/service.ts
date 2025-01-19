import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import type { AuthEntity, AuthTokenPayload, AuthTokenResponse } from "@/api/auth/model";
import { AuthRepository } from "@/api/auth/repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";

const DEFAULT_AUTH_EXPIRATION_IN_DAYS = "30 days";

export class AuthService {
  private authRepository: AuthRepository;
  constructor(repository: AuthRepository = new AuthRepository()) {
    this.authRepository = repository;
  }

  private createAuthTokenPayload(authEntity: AuthEntity): AuthTokenPayload {
    return {
      userId: authEntity.userId,
      isAdmin: authEntity.isAdmin,
    };
  }
  private createAuthTokenResponse(authTokenPayload: AuthTokenPayload): AuthTokenResponse {
    return {
      token: jwt.sign(authTokenPayload, env.jwtSecret, { expiresIn: DEFAULT_AUTH_EXPIRATION_IN_DAYS }),
    };
  }

  async authenticate(username: string, password: string): Promise<ServiceResponse<AuthTokenResponse | null>> {
    try {
      const authEntity: AuthEntity | void = await this.authRepository.getByUsernameAndPassword(username, password);

      if (!authEntity) {
        return ServiceResponse.failure("Not matching username / password", null, StatusCodes.BAD_REQUEST);
      }

      const authTokenResponse: AuthTokenResponse = this.createAuthTokenResponse(
        this.createAuthTokenPayload(authEntity),
      );

      return ServiceResponse.success("Successfully authenticated user", authTokenResponse);
    } catch (ex) {
      const errorMessage = `Error authenticating: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while authenticating user.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
export const authService = new AuthService();
