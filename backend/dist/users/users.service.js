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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
let UsersService = class UsersService {
    constructor(usersRepo, cache) {
        this.usersRepo = usersRepo;
        this.cache = cache;
    }
    toPublic(u) {
        return { id: u.id, email: u.email, name: u.name, title: u.title, status: u.status, role: u.role };
    }
    async getCacheVer() {
        const v = (await this.cache.get("users:ver")) ?? 1;
        return typeof v === "number" && Number.isFinite(v) ? v : 1;
    }
    async bumpCacheVer() {
        const v = await this.getCacheVer();
        await this.cache.set("users:ver", v + 1);
    }
    async cacheKeyAll() {
        const v = await this.getCacheVer();
        return `users:v${v}:all`;
    }
    async cacheKeyById(id) {
        const v = await this.getCacheVer();
        return `users:v${v}:id:${id}`;
    }
    async getCurrentUserByEmail(email) {
        const u = await this.usersRepo.findOne({ where: { email } });
        if (!u)
            throw new common_1.NotFoundException("Current user not found");
        return u;
    }
    canManageTarget(current, target) {
        if (current.role === "admin")
            return true;
        if (current.role === "manager")
            return target.role === "user";
        return false;
    }
    canChangeRole(current) {
        return current.role === "admin";
    }
    async list(current) {
        if (current.role === "user")
            throw new common_1.ForbiddenException("No permission");
        const key = await this.cacheKeyAll();
        const cached = await this.cache.get(key);
        if (cached)
            return cached;
        const rows = await this.usersRepo.find({ order: { email: "ASC" } });
        const pub = rows.map((u) => this.toPublic(u));
        await this.cache.set(key, pub, 60000);
        return pub;
    }
    async getById(current, id) {
        const key = await this.cacheKeyById(id);
        const cached = await this.cache.get(key);
        if (cached) {
            const isSelf = current.id === cached.id;
            if (current.role === "user" && !isSelf)
                throw new common_1.ForbiddenException("No permission");
            if (!isSelf && !this.canManageTarget(current, cached))
                throw new common_1.ForbiddenException("No permission");
            return cached;
        }
        const target = await this.usersRepo.findOne({ where: { id } });
        if (!target)
            throw new common_1.NotFoundException("User not found");
        const isSelf = current.id === target.id;
        if (current.role === "user" && !isSelf)
            throw new common_1.ForbiddenException("No permission");
        if (!isSelf && !this.canManageTarget(current, target))
            throw new common_1.ForbiddenException("No permission");
        const pub = this.toPublic(target);
        await this.cache.set(key, pub, 120000);
        return pub;
    }
    async create(current, dto) {
        if (current.role === "user")
            throw new common_1.ForbiddenException("No permission");
        if (!dto.email || dto.email.trim() === "")
            throw new common_1.BadRequestException("Email required");
        const role = dto.role || "user";
        if (current.role === "manager" && role !== "user") {
            throw new common_1.ForbiddenException("Manager can only create user role");
        }
        const exists = await this.usersRepo.findOne({ where: { email: dto.email.trim() } });
        if (exists)
            throw new common_1.BadRequestException("Email already exists");
        const u = this.usersRepo.create({
            email: dto.email.trim(),
            name: dto.name || "",
            title: dto.title || "",
            status: dto.status || "active",
            role,
        });
        const saved = await this.usersRepo.save(u);
        await this.bumpCacheVer();
        return this.toPublic(saved);
    }
    async update(current, id, dto) {
        const target = await this.usersRepo.findOne({ where: { id } });
        if (!target)
            throw new common_1.NotFoundException("User not found");
        const isSelf = current.id === target.id;
        if (current.role === "user" && !isSelf)
            throw new common_1.ForbiddenException("No permission");
        if (!isSelf && !this.canManageTarget(current, target))
            throw new common_1.ForbiddenException("No permission");
        if (dto.role !== undefined && dto.role !== target.role) {
            if (!this.canChangeRole(current))
                throw new common_1.ForbiddenException("No permission to change role");
            target.role = dto.role;
        }
        if (dto.name !== undefined)
            target.name = dto.name;
        if (dto.title !== undefined)
            target.title = dto.title;
        if (dto.status !== undefined)
            target.status = dto.status;
        const saved = await this.usersRepo.save(target);
        await this.bumpCacheVer();
        return this.toPublic(saved);
    }
    async remove(current, id) {
        const target = await this.usersRepo.findOne({ where: { id } });
        if (!target)
            throw new common_1.NotFoundException("User not found");
        if (current.id === target.id)
            throw new common_1.BadRequestException("Cannot delete yourself");
        if (!this.canManageTarget(current, target))
            throw new common_1.ForbiddenException("No permission");
        await this.usersRepo.remove(target);
        await this.bumpCacheVer();
        return { ok: true };
    }
    async meGet(currentEmail) {
        const me = await this.getCurrentUserByEmail(currentEmail);
        return this.toPublic(me);
    }
    async mePatch(currentEmail, dto) {
        const me = await this.getCurrentUserByEmail(currentEmail);
        if (dto.role !== undefined && dto.role !== me.role) {
            throw new common_1.ForbiddenException("Cannot change your role");
        }
        if (dto.status !== undefined && dto.status !== me.status) {
            throw new common_1.ForbiddenException("Cannot change status here");
        }
        if (dto.name !== undefined)
            me.name = dto.name;
        if (dto.title !== undefined)
            me.title = dto.title;
        const saved = await this.usersRepo.save(me);
        await this.bumpCacheVer();
        return this.toPublic(saved);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], UsersService);
//# sourceMappingURL=users.service.js.map