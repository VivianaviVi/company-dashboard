import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "./users.service";
import { CreateUserDto, UpdateUserDto } from "./dto";
import type { JwtUser } from "../auth/jwt.strategy";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("users/me")
  @ApiOkResponse({ description: "Get current user profile." })
  async meGet(@Req() req: { user: JwtUser }) {
    return await this.users.meGet(req.user.email);
  }

  @Patch("users/me")
  @ApiOkResponse({ description: "Update current user profile (email not editable)." })
  @ApiBadRequestResponse({ description: "Invalid body." })
  async mePatch(@Req() req: { user: JwtUser }, @Body() body: UpdateUserDto) {
    return await this.users.mePatch(req.user.email, body);
  }

  @Get("users")
  @ApiOkResponse({ description: "List all users (admin/manager only)." })
  @ApiForbiddenResponse({ description: "Forbidden for role=user." })
  async list(@Req() req: { user: JwtUser }) {
    return await this.users.list(req.user);
  }

  @Get("users/:id")
  @ApiParam({ name: "id", type: "string" })
  @ApiOkResponse({ description: "Get a target user (admin/manager; user can read self only)." })
  @ApiForbiddenResponse({ description: "Not allowed by RBAC." })
  async getById(@Req() req: { user: JwtUser }, @Param("id") id: string) {
    return await this.users.getById(req.user, id);
  }

  @Post("users")
  @ApiCreatedResponse({ description: "Create a new user (admin/manager with RBAC rules)." })
  @ApiBadRequestResponse({ description: "Invalid body." })
  @ApiForbiddenResponse({ description: "Not allowed by RBAC." })
  async create(@Req() req: { user: JwtUser }, @Body() body: CreateUserDto) {
    return await this.users.create(req.user, body);
  }

  @Patch("users/:id")
  @ApiParam({ name: "id", type: "string" })
  @ApiOkResponse({ description: "Update a target user (RBAC enforced; only admin can change role)." })
  @ApiBadRequestResponse({ description: "Invalid body." })
  @ApiForbiddenResponse({ description: "Not allowed by RBAC." })
  async update(@Req() req: { user: JwtUser }, @Param("id") id: string, @Body() body: UpdateUserDto) {
    return await this.users.update(req.user, id, body);
  }

  @Delete("users/:id")
  @ApiParam({ name: "id", type: "string" })
  @ApiOkResponse({ description: "Delete a target user (RBAC enforced)." })
  @ApiForbiddenResponse({ description: "Not allowed by RBAC." })
  async remove(@Req() req: { user: JwtUser }, @Param("id") id: string) {
    return await this.users.remove(req.user, id);
  }
}

