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
exports.CompaniesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const companies_service_1 = require("./companies.service");
const dto_1 = require("./dto");
let CompaniesController = class CompaniesController {
    constructor(companies) {
        this.companies = companies;
    }
    async list() {
        return await this.companies.listAll();
    }
    async getByCode(code) {
        return await this.companies.getByCode(code);
    }
    async create(req, body) {
        return await this.companies.create(req.user, body);
    }
    async update(req, code, body) {
        return await this.companies.update(req.user, code, body);
    }
    async remove(req, code) {
        return await this.companies.remove(req.user, code);
    }
    async filter(body) {
        return await this.companies.filter(body);
    }
};
exports.CompaniesController = CompaniesController;
__decorate([
    (0, common_1.Get)("companies"),
    (0, swagger_1.ApiOkResponse)({ description: "List all companies (any logged-in user)." }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)("companies/:code"),
    (0, swagger_1.ApiParam)({ name: "code", type: "string" }),
    (0, swagger_1.ApiOkResponse)({ description: "Get one company by company_code (any logged-in user)." }),
    __param(0, (0, common_1.Param)("code")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "getByCode", null);
__decorate([
    (0, common_1.Post)("companies"),
    (0, swagger_1.ApiCreatedResponse)({ description: "Create a company (admin/manager only)." }),
    (0, swagger_1.ApiBadRequestResponse)({ description: "Invalid body." }),
    (0, swagger_1.ApiForbiddenResponse)({ description: "Not allowed by RBAC." }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateCompanyDto]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)("companies/:code"),
    (0, swagger_1.ApiParam)({ name: "code", type: "string" }),
    (0, swagger_1.ApiOkResponse)({ description: "Update a company (admin/manager only)." }),
    (0, swagger_1.ApiBadRequestResponse)({ description: "Invalid body." }),
    (0, swagger_1.ApiForbiddenResponse)({ description: "Not allowed by RBAC." }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("code")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateCompanyDto]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)("companies/:code"),
    (0, swagger_1.ApiParam)({ name: "code", type: "string" }),
    (0, swagger_1.ApiOkResponse)({ description: "Delete a company (admin/manager only)." }),
    (0, swagger_1.ApiForbiddenResponse)({ description: "Not allowed by RBAC." }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("code")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)("companies/filter"),
    (0, swagger_1.ApiCreatedResponse)({ description: "Filter and group companies by dimension (any logged-in user)." }),
    (0, swagger_1.ApiBadRequestResponse)({ description: "Invalid body." }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FilterRequestDto]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "filter", null);
exports.CompaniesController = CompaniesController = __decorate([
    (0, swagger_1.ApiTags)("Companies"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [companies_service_1.CompaniesService])
], CompaniesController);
//# sourceMappingURL=companies.controller.js.map