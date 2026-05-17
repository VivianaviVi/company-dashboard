import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export type UserRole = "admin" | "manager" | "user";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;


  @Column({ default: "" })
  password_hash!: string;

  @Column({ default: "" })
  name!: string;

  @Column({ default: "" })
  title!: string;

  @Column({ default: "active" })
  status!: "active" | "inactive";

  @Column({ default: "user" })
  role!: UserRole;
}

