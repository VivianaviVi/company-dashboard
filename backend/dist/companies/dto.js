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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterResponseDto = exports.FilterRequestDto = exports.CompaniesFilterDto = exports.MinMaxStringDto = exports.StringRangeDto = exports.DIMENSIONS = exports.UpdateCompanyDto = exports.CreateCompanyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateCompanyDto {
}
exports.CreateCompanyDto = CreateCompanyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "C100" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "company_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Acme Inc" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "company_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, minimum: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCompanyDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "USA" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "New York" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2001 }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateCompanyDto.prototype, "founded_year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 123456 }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateCompanyDto.prototype, "annual_revenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 250 }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateCompanyDto.prototype, "employees", void 0);
class UpdateCompanyDto {
}
exports.UpdateCompanyDto = UpdateCompanyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "Acme Inc (Updated)" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyDto.prototype, "company_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateCompanyDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "Canada" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "Toronto" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1999 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateCompanyDto.prototype, "founded_year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 222222 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateCompanyDto.prototype, "annual_revenue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 300 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateCompanyDto.prototype, "employees", void 0);
exports.DIMENSIONS = ["level", "country", "city"];
class StringRangeDto {
}
exports.StringRangeDto = StringRangeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StringRangeDto.prototype, "start", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StringRangeDto.prototype, "end", void 0);
class MinMaxStringDto {
}
exports.MinMaxStringDto = MinMaxStringDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MinMaxStringDto.prototype, "min", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MinMaxStringDto.prototype, "max", void 0);
class CompaniesFilterDto {
}
exports.CompaniesFilterDto = CompaniesFilterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: [1, 2] }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsInt)({ each: true }),
    (0, class_validator_1.Min)(1, { each: true }),
    __metadata("design:type", Array)
], CompaniesFilterDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ["China", "USA"] }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CompaniesFilterDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: [] }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CompaniesFilterDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StringRangeDto),
    __metadata("design:type", StringRangeDto)
], CompaniesFilterDto.prototype, "founded_year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MinMaxStringDto),
    __metadata("design:type", MinMaxStringDto)
], CompaniesFilterDto.prototype, "annual_revenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MinMaxStringDto),
    __metadata("design:type", MinMaxStringDto)
], CompaniesFilterDto.prototype, "employees", void 0);
class FilterRequestDto {
}
exports.FilterRequestDto = FilterRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: exports.DIMENSIONS, example: "country" }),
    (0, class_validator_1.IsIn)(exports.DIMENSIONS),
    __metadata("design:type", String)
], FilterRequestDto.prototype, "dimension", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CompaniesFilterDto),
    __metadata("design:type", CompaniesFilterDto)
], FilterRequestDto.prototype, "filter", void 0);
class FilterResponseDto {
}
exports.FilterResponseDto = FilterResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: exports.DIMENSIONS, example: "country" }),
    __metadata("design:type", String)
], FilterResponseDto.prototype, "dimension", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Grouped companies by dimension key (e.g. { China: [...], USA: [...] }).",
        type: "object",
        additionalProperties: { type: "array", items: { type: "object" } },
    }),
    __metadata("design:type", Object)
], FilterResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Echo of applied filters for verification." }),
    __metadata("design:type", CompaniesFilterDto)
], FilterResponseDto.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30 }),
    __metadata("design:type", Number)
], FilterResponseDto.prototype, "total", void 0);
//# sourceMappingURL=dto.js.map