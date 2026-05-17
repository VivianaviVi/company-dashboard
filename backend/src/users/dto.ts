import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsIn, IsOptional, IsString } from "class-validator";
import type { UserRole } from "../entities/user.entity";

export class CreateUserDto {
  @ApiProperty({ example: "someone@example.com" })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: "Alice" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "Analyst" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ enum: ["active", "inactive"], example: "active" })
  @IsOptional()
  @IsIn(["active", "inactive"])
  status?: "active" | "inactive";

  @ApiPropertyOptional({ enum: ["admin", "manager", "user"], example: "user" })
  @IsOptional()
  @IsIn(["admin", "manager", "user"])
  role?: UserRole;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "Alice" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "Senior Analyst" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ enum: ["active", "inactive"], example: "active" })
  @IsOptional()
  @IsIn(["active", "inactive"])
  status?: "active" | "inactive";

  @ApiPropertyOptional({ enum: ["admin", "manager", "user"], example: "manager" })
  @IsOptional()
  @IsIn(["admin", "manager", "user"])
  role?: UserRole;
}

