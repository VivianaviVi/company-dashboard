"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    app.enableCors({
        origin: true,
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle("Dashboard Backend API")
        .setDescription("Nest.js + TypeORM (SQLite) backend for Dashboard assignment")
        .setVersion("1.0.0")
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup("api-docs", app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    await app.listen(3002);
    console.log("Backend listening on http://localhost:3002");
    console.log("Swagger UI available at http://localhost:3002/api-docs");
}
void bootstrap();
//# sourceMappingURL=main.js.map