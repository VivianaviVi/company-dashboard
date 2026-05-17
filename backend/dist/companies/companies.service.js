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
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const node_crypto_1 = require("node:crypto");
const typeorm_2 = require("typeorm");
const company_entity_1 = require("../entities/company.entity");
function toNumberOrNull(v) {
    const t = (v || "").trim();
    if (t === "")
        return null;
    const n = Number(t);
    if (Number.isNaN(n))
        return null;
    return n;
}
function inRange(value, minStr, maxStr) {
    const min = toNumberOrNull(minStr);
    const max = toNumberOrNull(maxStr);
    if (min !== null && value < min)
        return false;
    if (max !== null && value > max)
        return false;
    return true;
}
let CompaniesService = class CompaniesService {
    constructor(companiesRepo, cache) {
        this.companiesRepo = companiesRepo;
        this.cache = cache;
    }
    async getCacheVer() {
        const v = (await this.cache.get("companies:ver")) ?? 1;
        return typeof v === "number" && Number.isFinite(v) ? v : 1;
    }
    async bumpCacheVer() {
        const v = await this.getCacheVer();
        await this.cache.set("companies:ver", v + 1);
    }
    async cacheKeyAll() {
        const v = await this.getCacheVer();
        return `companies:v${v}:all`;
    }
    async cacheKeyByCode(code) {
        const v = await this.getCacheVer();
        return `companies:v${v}:code:${code}`;
    }
    async cacheKeyFilter(request) {
        const v = await this.getCacheVer();
        const f = request.filter;
        const normNumStr = (s) => {
            const t = (s || "").trim();
            if (t === "")
                return "";
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
        const h = (0, node_crypto_1.createHash)("sha1").update(raw).digest("hex").slice(0, 16);
        return `companies:v${v}:filter:${h}`;
    }
    ensureWritePerm(current) {
        if (current.role !== "admin" && current.role !== "manager") {
            throw new common_1.ForbiddenException("No permission");
        }
    }
    async listAll() {
        const key = await this.cacheKeyAll();
        const cached = await this.cache.get(key);
        if (cached)
            return cached;
        const rows = await this.companiesRepo.find({ order: { company_code: "ASC" } });
        await this.cache.set(key, rows, 60000);
        return rows;
    }
    async getByCode(codeRaw) {
        const code = (codeRaw || "").trim();
        if (!code)
            throw new common_1.BadRequestException("code required");
        const key = await this.cacheKeyByCode(code);
        const cached = await this.cache.get(key);
        if (cached)
            return cached;
        const c = await this.companiesRepo.findOne({ where: { company_code: code } });
        if (!c)
            throw new common_1.NotFoundException("Company not found");
        await this.cache.set(key, c, 120000);
        return c;
    }
    async create(current, dto) {
        this.ensureWritePerm(current);
        const code = (dto.company_code || "").trim();
        if (!code)
            throw new common_1.BadRequestException("company_code required");
        const exists = await this.companiesRepo.findOne({ where: { company_code: code } });
        if (exists)
            throw new common_1.BadRequestException("company_code already exists");
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
    async update(current, code, dto) {
        this.ensureWritePerm(current);
        const c = await this.companiesRepo.findOne({ where: { company_code: code } });
        if (!c)
            throw new common_1.NotFoundException("Company not found");
        if (dto.company_name !== undefined)
            c.company_name = dto.company_name;
        if (dto.level !== undefined)
            c.level = dto.level;
        if (dto.country !== undefined)
            c.country = dto.country;
        if (dto.city !== undefined)
            c.city = dto.city;
        if (dto.founded_year !== undefined)
            c.founded_year = dto.founded_year;
        if (dto.annual_revenue !== undefined)
            c.annual_revenue = dto.annual_revenue;
        if (dto.employees !== undefined)
            c.employees = dto.employees;
        const saved = await this.companiesRepo.save(c);
        await this.bumpCacheVer();
        return saved;
    }
    async remove(current, code) {
        this.ensureWritePerm(current);
        const c = await this.companiesRepo.findOne({ where: { company_code: code } });
        if (!c)
            throw new common_1.NotFoundException("Company not found");
        await this.companiesRepo.remove(c);
        await this.bumpCacheVer();
        return { ok: true };
    }
    async filter(request) {
        const key = await this.cacheKeyFilter(request);
        const cached = await this.cache.get(key);
        if (cached)
            return cached;
        const companies = await this.listAll();
        const dim = request.dimension;
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
        const data = {};
        for (const c of filtered) {
            let key = "";
            if (dim === "level")
                key = `Level ${c.level}`;
            if (dim === "country")
                key = c.country;
            if (dim === "city")
                key = c.city;
            if (!data[key])
                data[key] = [];
            data[key].push(c);
        }
        const resp = { dimension: dim, data, filter: f, total: filtered.length };
        await this.cache.set(key, resp, 30000);
        return resp;
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(1, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map