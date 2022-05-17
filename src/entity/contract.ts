import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm"
import { Coupon } from "./coupon"
import { Owner } from "./owner"

@Entity()
export class Contract {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "text", nullable: true, unique: true })
  name?: string

  @Column({ type: "boolean", default: false })
  published: boolean

  @Column({ type: "text", unique: true })
  address: string

  @OneToMany(() => Coupon, coupon => coupon.contract)
  coupons: Coupon[]

  @ManyToOne(() => Owner, owner => owner.contracts)
  owner: Owner
}