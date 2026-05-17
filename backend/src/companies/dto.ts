import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDefined, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class CreateCompanyDto {
  @ApiProperty({ example: "C100" })
  @IsString()
  company_code!: string;

  @ApiProperty({ example: "Acme Inc" })
  @IsString()
  company_name!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  level!: number;

  @ApiProperty({ example: "USA" })
  @IsString()
  country!: string;

  @ApiProperty({ example: "New York" })
  @IsString()
  city!: string;

  @ApiProperty({ example: 2001 })
  @IsInt()
  founded_year!: number;

  @ApiProperty({ example: 123456 })
  @IsInt()
  annual_revenue!: number;

  @ApiProperty({ example: 250 })
  @IsInt()
  employees!: number;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: "Acme Inc (Updated)" })
  @IsOptional()
  @IsString()
  company_name?: string;

  @ApiPropertyOptional({ example: 3, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @ApiPropertyOptional({ example: "Canada" })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: "Toronto" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 1999 })
  @IsOptional()
  @IsInt()
  founded_year?: number;

  @ApiPropertyOptional({ example: 222222 })
  @IsOptional()
  @IsInt()
  annual_revenue?: number;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @IsInt()
  employees?: number;
}

export const DIMENSIONS = ["level", "country", "city"] as const;
export type Dimension = (typeof DIMENSIONS)[number];

export class StringRangeDto {
  @ApiProperty({ example: "" })
  @IsString()
  start!: string;

  @ApiProperty({ example: "" })
  @IsString()
  end!: string;
}

export class MinMaxStringDto {
  @ApiProperty({ example: "" })
  @IsString()
  min!: string;

  @ApiProperty({ example: "" })
  @IsString()
  max!: string;
}

export class CompaniesFilterDto {
  @ApiProperty({ example: [1, 2] })
  @IsDefined()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  level!: number[];

  @ApiProperty({ example: ["China", "USA"] })
  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  country!: string[];

  @ApiProperty({ example: [] })
  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  city!: string[];

  @ApiProperty()
  @IsDefined()
  @ValidateNested()
  @Type(() => StringRangeDto)
  founded_year!: StringRangeDto;

  @ApiProperty()
  @IsDefined()
  @ValidateNested()
  @Type(() => MinMaxStringDto)
  annual_revenue!: MinMaxStringDto;

  @ApiProperty()
  @IsDefined()
  @ValidateNested()
  @Type(() => MinMaxStringDto)
  employees!: MinMaxStringDto;
}

export class FilterRequestDto {
  @ApiProperty({ enum: DIMENSIONS, example: "country" })
  @IsIn(DIMENSIONS)
  dimension!: Dimension;

  @ApiProperty()
  @IsDefined()
  @ValidateNested()
  @Type(() => CompaniesFilterDto)
  filter!: CompaniesFilterDto;
}

export class FilterResponseDto {
  @ApiProperty({ enum: DIMENSIONS, example: "country" })
  dimension!: Dimension;

  @ApiProperty({
    description: "Grouped companies by dimension key (e.g. { China: [...], USA: [...] }).",
    type: "object",
    additionalProperties: { type: "array", items: { type: "object" } },
  })
  data!: Record<string, unknown[]>;

  @ApiProperty({ description: "Echo of applied filters for verification." })
  filter!: CompaniesFilterDto;

  @ApiProperty({ example: 30 })
  total!: number;
}


export type FilterRequest = FilterRequestDto;
export type FilterResponse = FilterResponseDto;

