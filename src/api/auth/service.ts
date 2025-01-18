import { StatusCodes } from "http-status-codes";

import type { AuthEntity } from "@/api/auth/model";
import { AuthRepository } from "@/api/auth/repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

export class AuthService {
  private authRepository: AuthRepository;

  constructor(repository: AuthRepository = new AuthRepository()) {
    this.authRepository = repository;
  }
  async authenticate(username: string, password: string): Promise<ServiceResponse<AuthEntity | null>> {
    try {
      const authEntity: AuthEntity = await this.authRepository.getByUsernameAndPassword(username, password);
      if (!authEntity) {
        return ServiceResponse.failure("Not matching username / password", null, StatusCodes.BAD_REQUEST);
      }
      return ServiceResponse.success("Successfully authenticated user", authEntity);
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
