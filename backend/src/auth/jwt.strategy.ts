import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

export type JwtUser = { id: string; email: string; role: User["role"] };

type JwtPayload = { sub: string; email?: string; iat?: number; exp?: number };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(@InjectRepository(User) private readonly usersRepo: Repository<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "dev-jwt-secret",
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    const id = payload?.sub;
    if (!id) throw new UnauthorizedException("Invalid token");
    const u = await this.usersRepo.findOne({ where: { id } });
    if (!u) throw new UnauthorizedException("User not found");
    return { id: u.id, email: u.email, role: u.role };
  }
}

