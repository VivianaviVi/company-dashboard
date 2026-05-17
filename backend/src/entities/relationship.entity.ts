import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "relationships" })
export class Relationship {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  parent_company_code!: string;

  @Column()
  child_company_code!: string;
}

