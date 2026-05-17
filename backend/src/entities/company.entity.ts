import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "companies" })
export class Company {
  @PrimaryColumn()
  company_code!: string;

  @Column()
  company_name!: string;

  @Column()
  level!: number;

  @Column()
  country!: string;

  @Column()
  city!: string;

  @Column()
  founded_year!: number;

  @Column()
  annual_revenue!: number;

  @Column()
  employees!: number;
}

