"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const dashboard_service_1 = require("./dashboard.service");
const dto_1 = require("../companies/dto");
let DashboardController = class DashboardController {
    constructor(dash) {
        this.dash = dash;
    }
    async summary() {
        return await this.dash.summary();
    }
    async levelShare() {
        return await this.dash.levelShare();
    }
    async growth() {
        return await this.dash.growth();
    }
    async bubble(body) {
        return await this.dash.bubble(body);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)("dashboard/summary"),
    (0, swagger_1.ApiOkResponse)({ description: "KPI summary cards for dashboard." }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)("dashboard/level-share"),
    (0, swagger_1.ApiOkResponse)({ description: "Donut chart: company count share by level." }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "levelShare", null);
__decorate([
    (0, common_1.Get)("dashboard/growth"),
    (0, swagger_1.ApiOkResponse)({ description: "Line chart: cumulative company count by founded year." }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "growth", null);
__decorate([
    (0, common_1.Post)("dashboard/bubble"),
    (0, swagger_1.ApiOkResponse)({ description: "Bubble chart hierarchy data (circle packing) based on filter + dimension." }),
    (0, swagger_1.ApiBadRequestResponse)({ description: "Invalid body." }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FilterRequestDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "bubble", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)("Dashboard"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map