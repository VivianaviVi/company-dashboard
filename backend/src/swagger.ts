import "reflect-metadata";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function exportSwagger() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Dashboard Backend API")
    .setDescription("Nest.js + TypeORM (SQLite) backend for Dashboard assignment")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  const docsDir = join(process.cwd(), "docs");
  mkdirSync(docsDir, { recursive: true });
  writeFileSync(join(docsDir, "openapi.json"), JSON.stringify(document, null, 2), "utf-8");


  await app.close();

  console.log(`Wrote ${join("docs", "openapi.json")}`);
}

void exportSwagger();

