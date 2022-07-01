import { BalanceGrade, getBalance, polkadot } from "ocex-api"
import { DataSource, Repository } from "typeorm"
import Table from "easy-table"
import chalk from "chalk"
import BN from "bn.js"

import { Contract } from "../entity/contract"
import { Coupon } from "../entity/coupon"

import { activateCoupon, addCoupon, burnCoupon, checkCoupon } from "../api"
import { fmtAddress, fmtBalance, fmtList, keyring, log } from "../utils"
import * as contractMethods from "./contract"
import { config } from "../config"

interface CreateOptions {
  contract: string
  name?: string
  unit?: string
  amount: BN
}

interface UpdateOptions {
  secret?: string
  name?: string
}

interface ListOptions {
  short?: boolean
}

interface ActivateOptions {
  receiver?: string
}

const { assign } = Object

const _print = (data: Coupon | Coupon[], action?: string) => {
  const table = new Table()

  const _row = (record: Coupon) => {
    table.cell("id", record.id)
    table.cell("name", record.name || "<not assigned>")
    table.cell("🎟️ coupon public", record.coupon_public)

    record?.contract &&
      table.cell(
        "📝 contract",
        `id: ${record.contract.id} <${record.contract.name || "unnamed"}>`,
      )
    record?.contract?.owner &&
      table.cell(
        "👤 owner",
        `id: ${record.contract.owner.id} <${record.contract.owner.name || "unnamed"}>`,
      )

    table.newRow()
  }

  if (config.logging) {
    if (action) {
      console.log(chalk.green.bgBlackBright.bold(`Coupon successfully ${action}`))
    }

    if (Array.isArray(data)) {
      data.map(_row)
    } else {
      _row(data)
    }

    console.log(table.toString())
  }
}

async function findOneBySelector(
  repository: Repository<Coupon>,
  selector: string,
  relations = false,
) {
  const query = ["coupon.coupon_public = :q", "coupon.name = :q"]
  const params: any = { q: selector }

  const maybeId = parseInt(selector)
  if (!isNaN(maybeId)) {
    query.push("coupon.id = :id")
    params.id = maybeId
  }

  let qb = await repository.createQueryBuilder("coupon")

  if (relations) {
    qb = qb
      .leftJoinAndSelect("coupon.contract", "contracts")
      .leftJoinAndSelect("contracts.owner", "owners")
  }

  const coupon = await qb
    .where(query.join(" OR "), params)
    .getOneOrFail()
    .catch(error => {
      console.log(chalk.black.bgRed.bold("Coupon not found"))
      throw error
    })

  return coupon
}

export async function create(
  dataSource: DataSource,
  secret: string | undefined,
  { contract: contractSelector, amount: _amount, unit = "Pico", ...opts }: CreateOptions,
) {
  const contractRepository = dataSource.getRepository(Contract)
  const repository = dataSource.getRepository(Coupon)

  const amount = getBalance(_amount.toNumber(), BalanceGrade[unit])
  const params: Record<string, string> = {}

  if (secret) {
    const coupon_public = polkadot.util.u8aToHex(keyring.addFromUri(secret).addressRaw)
    assign(params, { secret, coupon_public })
  } else {
    const secret = polkadot.util.u8aToHex(
      polkadot.utilCrypto.mnemonicToMiniSecret(polkadot.utilCrypto.mnemonicGenerate()),
    )

    const coupon_public = polkadot.util.u8aToHex(keyring.addFromUri(secret).addressRaw)
    assign(params, { secret, coupon_public })
  }

  const contract = await contractMethods.findOneBySelector(
    contractRepository,
    contractSelector,
    true,
  )

  const record = assign(
    new Coupon(),
    opts,
    params,
    { contract, amount: amount.toString() },
  )

  await addCoupon(record)

  const coupon = await repository.save(record)
  _print(coupon, "created")

  return coupon
}

export async function update(
  dataSource: DataSource,
  selector: string,
  { secret, name }: UpdateOptions,
) {
  if (!name && !secret) {
    const error = new Error("Need minimum one of options: --secret or --name")
    log(chalk.blackBright.bgRed.bold(error.message))
    throw error
  }

  const repository = dataSource.getRepository(Coupon)
  const coupon = await findOneBySelector(repository, selector)

  const coupon_public =
    secret && polkadot.util.u8aToHex(keyring.addFromUri(secret).addressRaw)

  assign(
    coupon,
    secret && { secret },
    coupon_public && { coupon_public },
    name && { name },
  )

  const updated = await repository.save(coupon)

  _print(updated, "updated")
  return updated
}

export async function remove(dataSource: DataSource, selector: string) {
  const repository = dataSource.getRepository(Coupon)
  const coupon = await findOneBySelector(repository, selector)

  _print(coupon, "removed")
  await repository.remove(coupon)

  return coupon
}

export async function list(dataSource: DataSource, options: ListOptions) {
  const repository = dataSource.getRepository(Coupon)
  const coupons = await repository
    .createQueryBuilder("coupon")
    .leftJoinAndSelect("coupon.contract", "contracts")
    .leftJoinAndSelect("contracts.owner", "owners")
    .getMany()

  coupons.length > 0 ? _print(coupons) : log(chalk.bgBlack.whiteBright("List is empty"))
  return coupons
}

export async function check(dataSource: DataSource, selector: string) {
  const repository = dataSource.getRepository(Coupon)
  const coupon = await findOneBySelector(repository, selector, true)
  const [isAllowed, amount] = await checkCoupon(coupon)
  const isExists = amount.gt(new BN(0))

  log(
    // prettier-ignore
    fmtList([
      ["🎟️ Coupon:", `${coupon.coupon_public} <${coupon.name || "unnamed"}>`, "bgGreen"],
      ["🎟️ Coupon Secret:", coupon.secret, "bgGreen"],

      ["📝 Contract:", `${fmtAddress(coupon.contract.address)} <${coupon.contract.name || "unnamed"}>`],
      ["👤 Owner:", `${fmtAddress(coupon.contract.owner.address)} <${coupon.contract.owner.name || "unnamed"}>`],
      ["--------------------"] as any,
      ["🔎 Exists:", isExists ? "Yes" : "Not"],
      ["🔥 Activated:", !isAllowed ? "Yes" : "Not"],
      ["💰 Amount:", fmtBalance(amount)],
    ]),
  )

  return [isAllowed, amount]
}

export async function show(dataSource: DataSource, selector: string) {
  const repository = dataSource.getRepository(Coupon)
  const coupon = await findOneBySelector(repository, selector, true)

  log(
    // prettier-ignore
    fmtList([
      ["🎟️ Coupon:", `${coupon.coupon_public} <${coupon.name || "unnamed"}>`, "bgGreen"],
      ["🎟️ Coupon Secret:", coupon.secret, "bgGreen"],
      
      ["📝 Contract:", `${fmtAddress(coupon.contract.address)} <${coupon.contract.name || "unnamed"}>`],
      ["👤 Owner:", `${fmtAddress(coupon.contract.owner.address)} <${coupon.contract.owner.name || "unnamed"}>`],
    ]),
  )

  return coupon
}

export async function activate(
  dataSource: DataSource,
  selector: string,
  { receiver }: ActivateOptions,
) {
  const repository = dataSource.getRepository(Coupon)
  const coupon = await findOneBySelector(repository, selector, true)

  await activateCoupon(coupon, receiver)

  log(
    // prettier-ignore
    fmtList([
      ["🎟️ Coupon:", `${coupon.coupon_public} <${coupon.name || "unnamed"}>`, "bgGreen"],
      ["🎟️ Coupon Secret:", coupon.secret, "bgGreen"],
      ["📝 Contract:", `${fmtAddress(coupon.contract.address)} <${coupon.contract.name || "unnamed"}>`],
      ["👤 Owner:", `${fmtAddress(coupon.contract.owner.address)} <${coupon.contract.owner.name || "unnamed"}>`],
      ["--------------------"] as any,
      ["✨ Activated:", `Yes, and funds transfered to '${receiver || coupon.contract.owner.address}'`],
    ]),
  )

  return true
}

export async function burn(dataSource: DataSource, selector: string) {
  const repository = dataSource.getRepository(Coupon)
  const coupon = await findOneBySelector(repository, selector, true)
  await burnCoupon(coupon)

  log(
    // prettier-ignore
    fmtList([
      ["🎟️ Coupon:", `${coupon.coupon_public} <${coupon.name || "unnamed"}>`, "bgGreen"],
      ["🎟️ Coupon Secret:", coupon.secret, "bgGreen"],
      ["📝 Contract:", `${fmtAddress(coupon.contract.address)} <${coupon.contract.name || "unnamed"}>`],
      ["👤 Owner:", `${fmtAddress(coupon.contract.owner.address)} <${coupon.contract.owner.name || "unnamed"}>`],
      ["--------------------"] as any,
      ["🔥 Burned:", "Yes"],
    ]),
  )

  return true
}
