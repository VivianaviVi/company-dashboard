import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { CompaniesService } from "./companies.service";
import { CreateCompanyDto, FilterRequestDto, UpdateCompanyDto } from "./dto";
import type { JwtUser } from "../auth/jwt.strategy";

@ApiTags("Companies")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller()
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Get("companies")
  @ApiOkResponse({ description: "List all companies (any logged-in user)." })
  async list() {
    return await this.companies.listAll();
  }

  @Get("companies/:code")
  @ApiParam({ name: "code", type: "string" })
  @ApiOkResponse({ description: "Get one company by company_code (any logged-in user)." })
  async getByCode(@Param("code") code: string) {
    return await this.companies.getByCode(code);
  }

  @Post("companies")
  @ApiCreatedResponse({ description: "Create a company (admin/manager only)." })
  @ApiBadRequestResponse({ description: "Invalid body." })
  @ApiForbiddenResponse({ description: "Not allowed by RBAC." })
  async create(@Req() req: { user: JwtUser }, @Body() body: CreateCompanyDto) {
    return await this.companies.create(req.user, body);
  }

  @Patch("companies/:code")
  @ApiParam({ name: "code", type: "string" })
  @ApiOkResponse({ description: "Update a company (admin/manager only)." })
  @ApiBadRequestResponse({ description: "Invalid body." })
  @ApiForbiddenResponse({ description: "Not allowed by RBAC." })
  async update(@Req() req: { user: JwtUser }, @Param("code") code: string, @Body() body: UpdateCompanyDto) {
    return await this.companies.update(req.user, code, body);
  }

  @Delete("companies/:code")
  @ApiParam({ name: "code", type: "string" })
  @ApiOkResponse({ description: "Delete a company (admin/manager only)." })
  @ApiForbiddenResponse({ description: "Not allowed by RBAC." })
  async remove(@Req() req: { user: JwtUser }, @Param("code") code: string) {
    return await this.companies.remove(req.user, code);
  }

  @Post("companies/filter")
  @ApiCreatedResponse({ description: "Filter and group companies by dimension (any logged-in user)." })
  @ApiBadRequestResponse({ description: "Invalid body." })
  async filter(@Body() body: FilterRequestDto) {
    return await this.companies.filter(body);
  }
}

