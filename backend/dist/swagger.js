"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function exportSwagger() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger: false });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle("Dashboard Backend API")
        .setDescription("Nest.js + TypeORM (SQLite) backend for Dashboard assignment")
        .setVersion("1.0.0")
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    const docsDir = (0, node_path_1.join)(process.cwd(), "docs");
    (0, node_fs_1.mkdirSync)(docsDir, { recursive: true });
    (0, node_fs_1.writeFileSync)((0, node_path_1.join)(docsDir, "openapi.json"), JSON.stringify(document, null, 2), "utf-8");
    await app.close();
    console.log(`Wrote ${(0, node_path_1.join)("docs", "openapi.json")}`);
}
void exportSwagger();
//# sourceMappingURL=swagger.js.map