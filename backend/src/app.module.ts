import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SeedService } from "./seed/seed.service";
import { Company } from "./entities/company.entity";
import { Relationship } from "./entities/relationship.entity";
import { User } from "./entities/user.entity";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CompaniesModule } from "./companies/companies.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { HealthController } from "./health.controller";
import { redisStore } from "cache-manager-ioredis-yet";

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const defaultTtlMs = Number(process.env.CACHE_DEFAULT_TTL_MS || "60000");
        const redisUrl = (process.env.REDIS_URL || "").trim();
        if (!redisUrl) return { ttl: defaultTtlMs };


        const u = new URL(redisUrl);
        const host = u.hostname;
        const port = u.port ? Number(u.port) : 6379;
        const password = u.password ? decodeURIComponent(u.password) : undefined;

        return {
          store: await redisStore({ host, port, password, ttl: defaultTtlMs }),
          ttl: defaultTtlMs,
        };
      },
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "db.sqlite",
      entities: [User, Company, Relationship],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Company, Relationship]),
    AuthModule,
    UsersModule,
    CompaniesModule,
    DashboardModule,
  ],
  controllers: [HealthController],
  providers: [SeedService],
})
export class AppModule {}

