import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Cache } from "cache-manager";
import { Repository } from "typeorm";
import { User, type UserRole } from "../entities/user.entity";
import type { CreateUserDto, UpdateUserDto } from "./dto";

type CurrentUser = {
  id: string;
  email: string;
  role: UserRole;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache
  ) {}

  private toPublic(u: User) {
    return { id: u.id, email: u.email, name: u.name, title: u.title, status: u.status, role: u.role };
  }

  private async getCacheVer() {
    const v = (await this.cache.get<number>("users:ver")) ?? 1;
    return typeof v === "number" && Number.isFinite(v) ? v : 1;
  }

  private async bumpCacheVer() {
    const v = await this.getCacheVer();
    await this.cache.set("users:ver", v + 1);
  }

  private async cacheKeyAll() {
    const v = await this.getCacheVer();
    return `users:v${v}:all`;
  }

  private async cacheKeyById(id: string) {
    const v = await this.getCacheVer();
    return `users:v${v}:id:${id}`;
  }

  async getCurrentUserByEmail(email: string) {
    const u = await this.usersRepo.findOne({ where: { email } });
    if (!u) throw new NotFoundException("Current user not found");
    return u;
  }

  private canManageTarget(current: CurrentUser, target: Pick<User, "role">) {
    if (current.role === "admin") return true;
    if (current.role === "manager") return target.role === "user";
    return false;
  }

  private canChangeRole(current: CurrentUser) {
    return current.role === "admin";
  }

  async list(current: CurrentUser) {
    if (current.role === "user") throw new ForbiddenException("No permission");
    const key = await this.cacheKeyAll();
    const cached = await this.cache.get<ReturnType<UsersService["toPublic"]>[]>(key);
    if (cached) return cached;

    const rows = await this.usersRepo.find({ order: { email: "ASC" } });
    const pub = rows.map((u) => this.toPublic(u));
    await this.cache.set(key, pub, 60_000);
    return pub;
  }

  async getById(current: CurrentUser, id: string) {
    const key = await this.cacheKeyById(id);
    const cached = await this.cache.get<ReturnType<UsersService["toPublic"]> & { role: UserRole }>(key);
    if (cached) {
      const isSelf = current.id === cached.id;
      if (current.role === "user" && !isSelf) throw new ForbiddenException("No permission");
      if (!isSelf && !this.canManageTarget(current, cached)) throw new ForbiddenException("No permission");
      return cached;
    }

    const target = await this.usersRepo.findOne({ where: { id } });
    if (!target) throw new NotFoundException("User not found");

    const isSelf = current.id === target.id;
    if (current.role === "user" && !isSelf) throw new ForbiddenException("No permission");
    if (!isSelf && !this.canManageTarget(current, target)) throw new ForbiddenException("No permission");

    const pub = this.toPublic(target);
    await this.cache.set(key, pub, 120_000);
    return pub;
  }

  async create(current: CurrentUser, dto: CreateUserDto) {
    if (current.role === "user") throw new ForbiddenException("No permission");
    if (!dto.email || dto.email.trim() === "") throw new BadRequestException("Email required");

    const role = dto.role || "user";
    if (current.role === "manager" && role !== "user") {
      throw new ForbiddenException("Manager can only create user role");
    }

    const exists = await this.usersRepo.findOne({ where: { email: dto.email.trim() } });
    if (exists) throw new BadRequestException("Email already exists");

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

  async update(current: CurrentUser, id: string, dto: UpdateUserDto) {
    const target = await this.usersRepo.findOne({ where: { id } });
    if (!target) throw new NotFoundException("User not found");

    const isSelf = current.id === target.id;
    if (current.role === "user" && !isSelf) throw new ForbiddenException("No permission");
    if (!isSelf && !this.canManageTarget(current, target)) throw new ForbiddenException("No permission");

    if (dto.role !== undefined && dto.role !== target.role) {
      if (!this.canChangeRole(current)) throw new ForbiddenException("No permission to change role");
      target.role = dto.role;
    }

    if (dto.name !== undefined) target.name = dto.name;
    if (dto.title !== undefined) target.title = dto.title;
    if (dto.status !== undefined) target.status = dto.status;

    const saved = await this.usersRepo.save(target);
    await this.bumpCacheVer();
    return this.toPublic(saved);
  }

  async remove(current: CurrentUser, id: string) {
    const target = await this.usersRepo.findOne({ where: { id } });
    if (!target) throw new NotFoundException("User not found");

    if (current.id === target.id) throw new BadRequestException("Cannot delete yourself");
    if (!this.canManageTarget(current, target)) throw new ForbiddenException("No permission");

    await this.usersRepo.remove(target);
    await this.bumpCacheVer();
    return { ok: true };
  }

  async meGet(currentEmail: string) {
    const me = await this.getCurrentUserByEmail(currentEmail);
    return this.toPublic(me);
  }

  async mePatch(currentEmail: string, dto: UpdateUserDto) {
    const me = await this.getCurrentUserByEmail(currentEmail);

    if (dto.role !== undefined && dto.role !== me.role) {
      throw new ForbiddenException("Cannot change your role");
    }
    if (dto.status !== undefined && dto.status !== me.status) {

      throw new ForbiddenException("Cannot change status here");
    }
    if (dto.name !== undefined) me.name = dto.name;
    if (dto.title !== undefined) me.title = dto.title;
    const saved = await this.usersRepo.save(me);
    await this.bumpCacheVer();
    return this.toPublic(saved);
  }
}

