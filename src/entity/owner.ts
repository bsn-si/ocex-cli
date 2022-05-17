import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Contract } from "./contract"

@Entity()
export class Owner {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "text", nullable: true, unique: true })
  name?: string

  @Column({ type: "text", unique: true })
  secret: string

  @Column({ type: "text", unique: true })
  address: string

  @OneToMany(() => Contract, contract => contract.owner)
  contracts: Contract[]
}
