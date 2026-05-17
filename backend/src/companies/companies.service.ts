import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Cache } from "cache-manager";
import { createHash } from "node:crypto";
import { Repository } from "typeorm";
import { Company } from "../entities/company.entity";
import type { CurrentUser } from "../auth/types";
import type { CreateCompanyDto, Dimension, FilterRequest, FilterResponse, UpdateCompanyDto } from "./dto";

function toNumberOrNull(v: string) {
  const t = (v || "").trim();
  if (t === "") return null;
  const n = Number(t);
  if (Number.isNaN(n)) return null;
  return n;
}

function inRange(value: number, minStr: string, maxStr: string) {
  const min = toNumberOrNull(minStr);
  const max = toNumberOrNull(maxStr);
  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;
  return true;
}

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company) private readonly companiesRepo: Repository<Company>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache
  ) {}

  private async getCacheVer() {
    const v = (await this.cache.get<number>("companies:ver")) ?? 1;
    return typeof v === "number" && Number.isFinite(v) ? v : 1;
  }

  private async bumpCacheVer() {
    const v = await this.getCacheVer();
    await this.cache.set("companies:ver", v + 1);
  }

  private async cacheKeyAll() {
    const v = await this.getCacheVer();
    return `companies:v${v}:all`;
  }

  private async cacheKeyByCode(code: string) {
    const v = await this.getCacheVer();
    return `companies:v${v}:code:${code}`;
  }

  private async cacheKeyFilter(request: FilterRequest) {
    const v = await this.getCacheVer();
    const f = request.filter;

    const normNumStr = (s: string) => {
      const t = (s || "").trim();
      if (t === "") return "";
      const n = Number(t);
      return Number.isFinite(n) ? String(n) : t;
    };

    const norm = {
      dimension: request.dimension,
      filter: {
        level: [...(f.level || [])].slice().sort((a, b) => a - b),
        country: [...(f.country || [])].map((x) => (x || "").trim()).filter(Boolean).sort(),
        city: [...(f.city || [])].map((x) => (x || "").trim()).filter(Boolean).sort(),
        founded_year: { start: normNumStr(f.founded_year?.start || ""), end: normNumStr(f.founded_year?.end || "") },
        annual_revenue: { min: normNumStr(f.annual_revenue?.min || ""), max: normNumStr(f.annual_revenue?.max || "") },
        employees: { min: normNumStr(f.employees?.min || ""), max: normNumStr(f.employees?.max || "") },
      },
    };

    const raw = JSON.stringify(norm);
    const h = createHash("sha1").update(raw).digest("hex").slice(0, 16);
    return `companies:v${v}:filter:${h}`;
  }

  private ensureWritePerm(current: CurrentUser) {
    if (current.role !== "admin" && current.role !== "manager") {
      throw new ForbiddenException("No permission");
    }
  }

  async listAll() {
    const key = await this.cacheKeyAll();
    const cached = await this.cache.get<Company[]>(key);
    if (cached) return cached;

    const rows = await this.companiesRepo.find({ order: { company_code: "ASC" } });
    await this.cache.set(key, rows, 60_000);
    return rows;
  }

  async getByCode(codeRaw: string) {
    const code = (codeRaw || "").trim();
    if (!code) throw new BadRequestException("code required");
    const key = await this.cacheKeyByCode(code);
    const cached = await this.cache.get<Company>(key);
    if (cached) return cached;

    const c = await this.companiesRepo.findOne({ where: { company_code: code } });
    if (!c) throw new NotFoundException("Company not found");
    await this.cache.set(key, c, 120_000);
    return c;
  }

  async create(current: CurrentUser, dto: CreateCompanyDto) {
    this.ensureWritePerm(current);
    const code = (dto.company_code || "").trim();
    if (!code) throw new BadRequestException("company_code required");

    const exists = await this.companiesRepo.findOne({ where: { company_code: code } });
    if (exists) throw new BadRequestException("company_code already exists");

    const c = this.companiesRepo.create({
      company_code: code,
      company_name: dto.company_name,
      level: dto.level,
      country: dto.country,
      city: dto.city,
      founded_year: dto.founded_year,
      annual_revenue: dto.annual_revenue,
      employees: dto.employees,
    });
    const saved = await this.companiesRepo.save(c);
    await this.bumpCacheVer();
    return saved;
  }

  async update(current: CurrentUser, code: string, dto: UpdateCompanyDto) {
    this.ensureWritePerm(current);
    const c = await this.companiesRepo.findOne({ where: { company_code: code } });
    if (!c) throw new NotFoundException("Company not found");

    if (dto.company_name !== undefined) c.company_name = dto.company_name;
    if (dto.level !== undefined) c.level = dto.level;
    if (dto.country !== undefined) c.country = dto.country;
    if (dto.city !== undefined) c.city = dto.city;
    if (dto.founded_year !== undefined) c.founded_year = dto.founded_year;
    if (dto.annual_revenue !== undefined) c.annual_revenue = dto.annual_revenue;
    if (dto.employees !== undefined) c.employees = dto.employees;

    const saved = await this.companiesRepo.save(c);
    await this.bumpCacheVer();
    return saved;
  }

  async remove(current: CurrentUser, code: string) {
    this.ensureWritePerm(current);
    const c = await this.companiesRepo.findOne({ where: { company_code: code } });
    if (!c) throw new NotFoundException("Company not found");
    await this.companiesRepo.remove(c);
    await this.bumpCacheVer();
    return { ok: true };
  }

  async filter(request: FilterRequest): Promise<FilterResponse> {
    const key = await this.cacheKeyFilter(request);
    const cached = await this.cache.get<FilterResponse>(key);
    if (cached) return cached;

    const companies = await this.listAll();
    const dim: Dimension = request.dimension;
    const f = request.filter;

    const filtered = companies.filter((c) => {
      const byLevel = f.level.length === 0 ? true : f.level.includes(c.level);
      const byCountry = f.country.length === 0 ? true : f.country.includes(c.country);
      const byCity = f.city.length === 0 ? true : f.city.includes(c.city);
      const byYear = inRange(c.founded_year, f.founded_year.start, f.founded_year.end);
      const byRev = inRange(c.annual_revenue, f.annual_revenue.min, f.annual_revenue.max);
      const byEmp = inRange(c.employees, f.employees.min, f.employees.max);
      return byLevel && byCountry && byCity && byYear && byRev && byEmp;
    });

    const data: Record<string, unknown[]> = {};
    for (const c of filtered) {
      let key = "";
      if (dim === "level") key = `Level ${c.level}`;
      if (dim === "country") key = c.country;
      if (dim === "city") key = c.city;
      if (!data[key]) data[key] = [];
      data[key]!.push(c);
    }

    const resp: FilterResponse = { dimension: dim, data, filter: f, total: filtered.length };
    await this.cache.set(key, resp, 30_000);
    return resp;
  }
}

