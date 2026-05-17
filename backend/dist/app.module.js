"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const typeorm_1 = require("@nestjs/typeorm");
const seed_service_1 = require("./seed/seed.service");
const company_entity_1 = require("./entities/company.entity");
const relationship_entity_1 = require("./entities/relationship.entity");
const user_entity_1 = require("./entities/user.entity");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const companies_module_1 = require("./companies/companies.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const health_controller_1 = require("./health.controller");
const cache_manager_ioredis_yet_1 = require("cache-manager-ioredis-yet");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.registerAsync({
                useFactory: async () => {
                    const defaultTtlMs = Number(process.env.CACHE_DEFAULT_TTL_MS || "60000");
                    const redisUrl = (process.env.REDIS_URL || "").trim();
                    if (!redisUrl)
                        return { ttl: defaultTtlMs };
                    const u = new URL(redisUrl);
                    const host = u.hostname;
                    const port = u.port ? Number(u.port) : 6379;
                    const password = u.password ? decodeURIComponent(u.password) : undefined;
                    return {
                        store: await (0, cache_manager_ioredis_yet_1.redisStore)({ host, port, password, ttl: defaultTtlMs }),
                        ttl: defaultTtlMs,
                    };
                },
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: "sqlite",
                database: "db.sqlite",
                entities: [user_entity_1.User, company_entity_1.Company, relationship_entity_1.Relationship],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, company_entity_1.Company, relationship_entity_1.Relationship]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            companies_module_1.CompaniesModule,
            dashboard_module_1.DashboardModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [seed_service_1.SeedService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map