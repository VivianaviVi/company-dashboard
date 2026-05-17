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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const users_service_1 = require("./users.service");
const dto_1 = require("./dto");
let UsersController = class UsersController {
    constructor(users) {
        this.users = users;
    }
    async meGet(req) {
        return await this.users.meGet(req.user.email);
    }
    async mePatch(req, body) {
        return await this.users.mePatch(req.user.email, body);
    }
    async list(req) {
        return await this.users.list(req.user);
    }
    async getById(req, id) {
        return await this.users.getById(req.user, id);
    }
    async create(req, body) {
        return await this.users.create(req.user, body);
    }
    async update(req, id, body) {
        return await this.users.update(req.user, id, body);
    }
    async remove(req, id) {
        return await this.users.remove(req.user, id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)("users/me"),
    (0, swagger_1.ApiOkResponse)({ description: "Get current user profile." }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "meGet", null);
__decorate([
    (0, common_1.Patch)("users/me"),
    (0, swagger_1.ApiOkResponse)({ description: "Update current user profile (email not editable)." }),
    (0, swagger_1.ApiBadRequestResponse)({ description: "Invalid body." }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "mePatch", null);
__decorate([
    (0, common_1.Get)("users"),
    (0, swagger_1.ApiOkResponse)({ description: "List all users (admin/manager only)." }),
    (0, swagger_1.ApiForbiddenResponse)({ description: "Forbidden for role=user." }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)("users/:id"),
    (0, swagger_1.ApiParam)({ name: "id", type: "string" }),
    (0, swagger_1.ApiOkResponse)({ description: "Get a target user (admin/manager; user can read self only)." }),
    (0, swagger_1.ApiForbiddenResponse)({ description: "Not allowed by RBAC." }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)("users"),
    (0, swagger_1.ApiCreatedResponse)({ description: "Create a new user (admin/manager with RBAC rules)." }),
    (0, swagger_1.ApiBadRequestResponse)({ description: "Invalid body." }),
    (0, swagger_1.ApiForbiddenResponse)({ description: "Not allowed by RBAC." }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)("users/:id"),
    (0, swagger_1.ApiParam)({ name: "id", type: "string" }),
    (0, swagger_1.ApiOkResponse)({ description: "Update a target user (RBAC enforced; only admin can change role)." }),
    (0, swagger_1.ApiBadRequestResponse)({ description: "Invalid body." }),
    (0, swagger_1.ApiForbiddenResponse)({ description: "Not allowed by RBAC." }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)("users/:id"),
    (0, swagger_1.ApiParam)({ name: "id", type: "string" }),
    (0, swagger_1.ApiOkResponse)({ description: "Delete a target user (RBAC enforced)." }),
    (0, swagger_1.ApiForbiddenResponse)({ description: "Not allowed by RBAC." }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)("Users"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map