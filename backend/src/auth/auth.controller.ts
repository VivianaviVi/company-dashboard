import { Body, Controller, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto, LoginResponseDto } from "./dto";

@ApiTags("Auth")
@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("auth/login")
  @ApiOkResponse({ description: "Login and receive JWT access token.", type: LoginResponseDto })
  @ApiBadRequestResponse({ description: "Invalid body." })
  @ApiUnauthorizedResponse({ description: "Invalid credentials." })
  async login(@Body() body: LoginDto) {
    return await this.auth.login(body.email, body.password);
  }
}

