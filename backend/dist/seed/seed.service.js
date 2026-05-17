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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const typeorm_2 = require("typeorm");
const company_entity_1 = require("../entities/company.entity");
const relationship_entity_1 = require("../entities/relationship.entity");
const user_entity_1 = require("../entities/user.entity");
let SeedService = class SeedService {
    constructor(usersRepo, companiesRepo, relRepo) {
        this.usersRepo = usersRepo;
        this.companiesRepo = companiesRepo;
        this.relRepo = relRepo;
    }
    async onModuleInit() {
        await this.seedUsers();
        await this.seedCompanies();
        await this.seedRelationships();
    }
    async seedUsers() {
        const pw = "123456";
        const hash = await bcryptjs_1.default.hash(pw, 10);
        const seeds = [
            { email: "admin@example.com", name: "Admin", title: "Administrator", status: "active", role: "admin" },
            { email: "manager@example.com", name: "Manager", title: "Manager", status: "active", role: "manager" },
            { email: "test@example.com", name: "Test User", title: "User", status: "active", role: "user" },
        ];
        for (const s of seeds) {
            const existing = await this.usersRepo.findOne({ where: { email: s.email } });
            if (!existing) {
                await this.usersRepo.save({ ...s, password_hash: hash });
            }
            else if (!existing.password_hash) {
                existing.password_hash = hash;
                await this.usersRepo.save(existing);
            }
        }
    }
    async seedCompanies() {
        const count = await this.companiesRepo.count();
        if (count > 0)
            return;
        const rows = [
            {
                company_code: "C0",
                company_name: "Rodriguez, Figueroa and Sanchez",
                level: 1,
                country: "China",
                city: "Beijing",
                founded_year: 1994,
                annual_revenue: 317736,
                employees: 4606,
            },
            { company_code: "C01", company_name: "Doyle Ltd", level: 2, country: "Japan", city: "Nagoya", founded_year: 1917, annual_revenue: 429408, employees: 889 },
            { company_code: "C02", company_name: "Mcclain, Miller and Henderson", level: 2, country: "China", city: "Hangzhou", founded_year: 1954, annual_revenue: 894345, employees: 310 },
            { company_code: "C03", company_name: "Davis and Sons", level: 2, country: "USA", city: "Los Angeles", founded_year: 1927, annual_revenue: 391732, employees: 1955 },
            { company_code: "C04", company_name: "Guzman, Hoffman and Baldwin", level: 2, country: "USA", city: "Dallas", founded_year: 1925, annual_revenue: 227886, employees: 4514 },
            { company_code: "C05", company_name: "Gardner, Robinson and Lawrence", level: 2, country: "France", city: "Toulouse", founded_year: 1957, annual_revenue: 490037, employees: 4877 },
            { company_code: "C06", company_name: "Blake and Sons", level: 2, country: "UK", city: "London", founded_year: 1997, annual_revenue: 535398, employees: 1357 },
            { company_code: "C11", company_name: "Dudley Group", level: 2, country: "China", city: "Tianjin", founded_year: 1910, annual_revenue: 175109, employees: 4572 },
            { company_code: "C12", company_name: "Arnold Ltd", level: 2, country: "UK", city: "Cardiff", founded_year: 2013, annual_revenue: 475218, employees: 3012 },
            { company_code: "C15", company_name: "Galloway-Wyatt", level: 2, country: "China", city: "Tianjin", founded_year: 1935, annual_revenue: 366675, employees: 3764 },
            { company_code: "C18", company_name: "Adams, Zuniga and Wong", level: 2, country: "Germany", city: "Essen", founded_year: 1993, annual_revenue: 850126, employees: 2055 },
            { company_code: "C20", company_name: "Gray-Mayo", level: 2, country: "Japan", city: "Fukuoka", founded_year: 2007, annual_revenue: 928281, employees: 508 },
            { company_code: "C21", company_name: "Watts, Robinson and Nguyen", level: 2, country: "Japan", city: "Tokyo", founded_year: 2003, annual_revenue: 335826, employees: 2634 },
            { company_code: "C25", company_name: "Wilkerson-Day", level: 2, country: "Germany", city: "Frankfurt", founded_year: 1995, annual_revenue: 354913, employees: 4648 },
            { company_code: "C28", company_name: "Ross, Robinson and Bright", level: 2, country: "Canada", city: "Montreal", founded_year: 1996, annual_revenue: 470917, employees: 435 },
            { company_code: "C29", company_name: "Snyder, Campos and Callahan", level: 2, country: "China", city: "Guangzhou", founded_year: 1980, annual_revenue: 465672, employees: 1360 },
            { company_code: "C33", company_name: "Frazier Inc", level: 2, country: "China", city: "Nanjing", founded_year: 1996, annual_revenue: 769560, employees: 2235 },
            { company_code: "C36", company_name: "Smith-Bowen", level: 2, country: "Germany", city: "Essen", founded_year: 2016, annual_revenue: 446519, employees: 921 },
            { company_code: "C40", company_name: "Ryan PLC", level: 2, country: "USA", city: "Los Angeles", founded_year: 2018, annual_revenue: 452544, employees: 3023 },
            { company_code: "C42", company_name: "Rodriguez LLC", level: 2, country: "China", city: "Shanghai", founded_year: 1993, annual_revenue: 117319, employees: 4031 },
            { company_code: "C001", company_name: "Walker LLC", level: 3, country: "Japan", city: "Tokyo", founded_year: 1994, annual_revenue: 94834, employees: 744 },
            { company_code: "C002", company_name: "Chapman and Sons", level: 3, country: "USA", city: "Houston", founded_year: 1994, annual_revenue: 92538, employees: 947 },
            { company_code: "C007", company_name: "Johnston, Sanchez and Kennedy", level: 3, country: "China", city: "Tianjin", founded_year: 2012, annual_revenue: 131937, employees: 453 },
            { company_code: "C009", company_name: "Gomez-Jenkins", level: 3, country: "China", city: "Beijing", founded_year: 2015, annual_revenue: 87487, employees: 765 },
            { company_code: "C014", company_name: "Baxter Inc", level: 3, country: "China", city: "Beijing", founded_year: 1990, annual_revenue: 294582, employees: 115 },
            { company_code: "C010", company_name: "Brown, Valdez and Lucas", level: 3, country: "India", city: "Delhi", founded_year: 2005, annual_revenue: 196241, employees: 216 },
            { company_code: "C017", company_name: "Novak and Sons", level: 3, country: "USA", city: "Chicago", founded_year: 2014, annual_revenue: 169698, employees: 22 },
            { company_code: "C0302", company_name: "Estrada-Nolan", level: 4, country: "Germany", city: "Düsseldorf", founded_year: 2014, annual_revenue: 30690, employees: 194 },
            { company_code: "C0303", company_name: "Santana-Byrd", level: 4, country: "France", city: "Lille", founded_year: 2023, annual_revenue: 95680, employees: 377 },
            { company_code: "C0306", company_name: "Bruce-Gonzalez", level: 4, country: "UK", city: "London", founded_year: 2022, annual_revenue: 36036, employees: 194 },
        ];
        await this.companiesRepo.save(rows);
    }
    async seedRelationships() {
        const edges = [
            { parent_company_code: "C0", child_company_code: "C01" },
            { parent_company_code: "C0", child_company_code: "C02" },
            { parent_company_code: "C0", child_company_code: "C03" },
            { parent_company_code: "C0", child_company_code: "C04" },
            { parent_company_code: "C0", child_company_code: "C05" },
            { parent_company_code: "C0", child_company_code: "C06" },
            { parent_company_code: "C0", child_company_code: "C11" },
            { parent_company_code: "C0", child_company_code: "C12" },
            { parent_company_code: "C0", child_company_code: "C15" },
            { parent_company_code: "C0", child_company_code: "C18" },
            { parent_company_code: "C0", child_company_code: "C20" },
            { parent_company_code: "C0", child_company_code: "C21" },
            { parent_company_code: "C0", child_company_code: "C25" },
            { parent_company_code: "C0", child_company_code: "C28" },
            { parent_company_code: "C0", child_company_code: "C29" },
            { parent_company_code: "C0", child_company_code: "C33" },
            { parent_company_code: "C0", child_company_code: "C36" },
            { parent_company_code: "C0", child_company_code: "C40" },
            { parent_company_code: "C0", child_company_code: "C42" },
            { parent_company_code: "C01", child_company_code: "C001" },
            { parent_company_code: "C01", child_company_code: "C002" },
            { parent_company_code: "C02", child_company_code: "C007" },
            { parent_company_code: "C02", child_company_code: "C009" },
            { parent_company_code: "C02", child_company_code: "C010" },
            { parent_company_code: "C03", child_company_code: "C014" },
            { parent_company_code: "C04", child_company_code: "C017" },
            { parent_company_code: "C001", child_company_code: "C0302" },
            { parent_company_code: "C001", child_company_code: "C0303" },
            { parent_company_code: "C001", child_company_code: "C0306" },
        ];
        for (const e of edges) {
            const exists = await this.relRepo.findOne({
                where: { parent_company_code: e.parent_company_code, child_company_code: e.child_company_code },
            });
            if (!exists) {
                await this.relRepo.save(e);
            }
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(2, (0, typeorm_1.InjectRepository)(relationship_entity_1.Relationship)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map