import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { DashboardService } from "./dashboard.service";
import { FilterRequestDto } from "../companies/dto";

@ApiTags("Dashboard")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller()
export class DashboardController {
  constructor(private readonly dash: DashboardService) {}

  @Get("dashboard/summary")
  @ApiOkResponse({ description: "KPI summary cards for dashboard." })
  async summary() {
    return await this.dash.summary();
  }

  @Get("dashboard/level-share")
  @ApiOkResponse({ description: "Donut chart: company count share by level." })
  async levelShare() {
    return await this.dash.levelShare();
  }

  @Get("dashboard/growth")
  @ApiOkResponse({ description: "Line chart: cumulative company count by founded year." })
  async growth() {
    return await this.dash.growth();
  }

  @Post("dashboard/bubble")
  @ApiOkResponse({ description: "Bubble chart hierarchy data (circle packing) based on filter + dimension." })
  @ApiBadRequestResponse({ description: "Invalid body." })
  async bubble(@Body() body: FilterRequestDto) {
    return await this.dash.bubble(body);
  }
}

