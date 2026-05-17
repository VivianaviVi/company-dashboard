import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "admin@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @MinLength(1)
  password!: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  access_token!: string;

  @ApiProperty({
    example: { id: "uuid", email: "admin@example.com", role: "admin", name: "Admin", title: "Administrator" },
  })
  user!: { id: string; email: string; role: string; name: string; title: string };
}

