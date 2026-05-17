import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller()
export class HealthController {
  @Get("health")
  @ApiOkResponse({
    description: "Connectivity check (no auth required).",
    schema: {
      type: "object",
      properties: {
        ok: { type: "boolean" },
        ts: { type: "string" },
      },
    },
  })
  health() {
    return { ok: true, ts: new Date().toISOString() };
  }
}

