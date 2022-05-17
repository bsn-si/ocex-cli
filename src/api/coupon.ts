import { Ocex, Coupon as CouponAPI } from "ocex-api"
import BN from "bn.js"

import { Coupon } from "../entity/coupon"
import { getClient } from "./client"
import { keyring } from "../utils"

export async function addCoupon(record: Coupon): Promise<boolean> {
  const pair = keyring.addFromUri(record.contract.owner.secret)
  const client = await getClient()

  const { address } = record.contract
  const { secret, amount } = record

  const contract = await Ocex.fromAddress(client, pair, address)
  const coupon = new CouponAPI(secret, new BN(amount))

  await contract.addCoupon(coupon)
  return true
}

export async function checkCoupon(record: Coupon): Promise<[boolean, BN]> {
  const pair = keyring.addFromUri(record.contract.owner.secret)
  const client = await getClient()

  const { address } = record.contract
  const { coupon_public } = record

  const contract = await Ocex.fromAddress(client, pair, address)
  return contract.checkCoupon(coupon_public)
}

export async function activateCoupon(record: Coupon, receiver?: string) {
  const pair = keyring.addFromUri(record.contract.owner.secret)
  const client = await getClient()
  const { owner } = record.contract

  const contract = await Ocex.fromAddress(client, pair, record.contract.address)

  await contract.activateCoupon(
    new CouponAPI(record.secret),
    receiver ? receiver : owner.address,
  )

  return true
}

export async function burnCoupon(record: Coupon) {
  const client = await getClient()

  const pair = keyring.addFromUri(record.contract.owner.secret)
  const contract = await Ocex.fromAddress(client, pair, record.contract.address)

  await contract.burnCoupons([new CouponAPI(record.secret)])

  return true
}
