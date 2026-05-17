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
exports.DashboardService = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_1 = require("@nestjs/common");
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
let DashboardService = class DashboardService {
    constructor(companiesRepo) {
        this.companiesRepo = companiesRepo;
    }
    async allCompanies() {
        return await this.companiesRepo.find({ order: { company_code: "ASC" } });
    }
    async summary() {
        const companies = await this.allCompanies();
        const companyCount = companies.length;
        const totalRevenue = companies.reduce((sum, c) => sum + c.annual_revenue, 0);
        const totalEmployees = companies.reduce((sum, c) => sum + c.employees, 0);
        const countriesCovered = new Set(companies.map((c) => c.country)).size;
        return { companyCount, totalRevenue, countriesCovered, totalEmployees };
    }
    async levelShare() {
        const companies = await this.allCompanies();
        const byLevel = {};
        for (const c of companies) {
            const k = String(c.level);
            byLevel[k] = (byLevel[k] || 0) + 1;
        }
        const levels = Object.keys(byLevel)
            .map((x) => Number(x))
            .sort((a, b) => a - b);
        const total = companies.length;
        const items = levels.map((lvl) => ({
            level: lvl,
            count: byLevel[String(lvl)] || 0,
            percent: total ? (byLevel[String(lvl)] || 0) / total : 0,
        }));
        return { total, items };
    }
    async growth() {
        const companies = await this.allCompanies();
        const yearCount = {};
        for (const c of companies) {
            const k = String(c.founded_year);
            yearCount[k] = (yearCount[k] || 0) + 1;
        }
        const years = Object.keys(yearCount)
            .map((x) => Number(x))
            .sort((a, b) => a - b);
        let acc = 0;
        const points = years.map((y) => {
            acc += yearCount[String(y)] || 0;
            return { year: y, cumulative: acc };
        });
        return { points };
    }
    async bubble(request) {
        const companies = await this.allCompanies();
        const f = request.filter;
        const dim = request.dimension;
        const filtered = companies.filter((c) => {
            const byLevel = f.level.length === 0 ? true : f.level.includes(c.level);
            const byCountry = f.country.length === 0 ? true : f.country.includes(c.country);
            const byCity = f.city.length === 0 ? true : f.city.includes(c.city);
            const byYear = inRange(c.founded_year, f.founded_year.start, f.founded_year.end);
            const byRev = inRange(c.annual_revenue, f.annual_revenue.min, f.annual_revenue.max);
            const byEmp = inRange(c.employees, f.employees.min, f.employees.max);
            return byLevel && byCountry && byCity && byYear && byRev && byEmp;
        });
        const groups = new Map();
        for (const c of filtered) {
            let key = "";
            if (dim === "level")
                key = `Level ${c.level}`;
            if (dim === "country")
                key = c.country;
            if (dim === "city")
                key = c.city;
            if (!groups.has(key))
                groups.set(key, { name: key, children: [] });
            groups.get(key).children.push({
                name: c.company_name,
                value: Math.max(1, c.employees),
                company: c,
            });
        }
        const children = Array.from(groups.values());
        return { name: "Companies", children, dimension: dim, filter: f, total: filtered.length };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map