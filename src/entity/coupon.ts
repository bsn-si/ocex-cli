import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Contract } from "./contract"

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "text", nullable: true, unique: true })
  name?: string

  @Column({ type: "text", unique: true })
  secret: string

  @Column({ type: "text", unique: true })
  coupon_public: string

  @Column({ type: "text" })
  amount: string

  @ManyToOne(() => Contract, contract => contract.coupons)
  contract: Contract
}
