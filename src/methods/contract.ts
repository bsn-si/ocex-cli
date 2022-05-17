import { BalanceGrade, getBalance } from "ocex-api"
import { DataSource, Repository } from "typeorm"
import Table from "easy-table"
import chalk from "chalk"
import BN from "bn.js"

import { Contract } from "../entity/contract"
import { Owner } from "../entity/owner"

import { fmtBalance, fmtList, keyring, log } from "../utils"
import * as couponMethods from "./coupon"
import * as ownerMethods from "./owner"
import { config } from "../config"

import {
  contractTransferOwnership,
  contractFillBalance,
  сontractInstantiate,
  contractBalance,
  contractPayback,
} from "../api"

interface CreateOptions {
  name?: string
  owner: string
}

interface UpdateOptions {
  address?: string
  name?: string
}

interface ListOptions {
  short?: boolean
}

interface FillBalance {
  unit?: string
  amount: BN
}

interface TransferOptions {
  owner: string
}

const { assign } = Object

const _print = (data: Contract | Contract[], action?: string) => {
  const table = new Table()

  // prettier-ignore
  const _row = (record: Contract) => {
    table.cell("id", record.id)
    table.cell("name", record.name || "<unnamed>")
    table.cell("🗒️ address", record.address)
    table.cell("🎈 published", record.published ? "Yes" : "No")
    
    record?.owner && table.cell("👤 owner", `id: ${record.owner.id} <${record.owner.name || "unnamed"}>`)
    record?.coupons && table.cell("🎟️ coupons (count)", record.coupons.length)

    table.newRow()
  }

  if (config.logging) {
    if (action) {
      console.log(chalk.green.bgBlack.bold(`Contract successfully ${action}`))
    }

    if (Array.isArray(data)) {
      data.map(_row)
    } else {
      _row(data)
    }

    console.log(table.toString())
  }
}

export async function findOneBySelector(
  repository: Repository<Contract>,
  selector: string,
  relations = false,
) {
  const query = ["contract.address = :q", "contract.name = :q"]
  const params: any = { q: selector }

  const maybeId = parseInt(selector)
  if (!isNaN(maybeId)) {
    query.push("contract.id = :id")
    params.id = maybeId
  }

  let qb = await repository.createQueryBuilder("contract")

  if (relations) {
    qb = qb
      .leftJoinAndSelect("contract.coupons", "coupon")
      .leftJoinAndSelect("contract.owner", "owner")
  }

  const contract = await qb
    .where(query.join(" OR "), params)
    .getOneOrFail()
    .catch(error => {
      console.log(chalk.blackBright.bgRed.bold("Contract not found"))
      throw error
    })

  return contract
}

export async function create(
  dataSource: DataSource,
  address: string,
  { owner: ownerSelector, ...opts }: CreateOptions,
) {
  const ownerRepository = dataSource.getRepository(Owner)
  const repository = dataSource.getRepository(Contract)

  const owner = await ownerMethods.findOneBySelector(ownerRepository, ownerSelector)

  const record = assign(
    new Contract(),
    opts,
    { owner, address },
    { published: !!address },
  )

  if (!address) {
    const pair = keyring.addFromUri(owner.secret)
    const address = await сontractInstantiate(pair)
    record.address = address
    record.published = true
  }

  const contract = await repository.save(record)
  _print(contract, "created")
  return contract
}

export async function update(
  dataSource: DataSource,
  selector: string,
  { address, name }: UpdateOptions,
) {
  if (!name && !address) {
    const error = new Error("Need minimum one of options: --address or --name")
    log(chalk.black.bgRed.bold(error.message))
    throw error
  }

  const repository = dataSource.getRepository(Contract)
  const contract = await findOneBySelector(repository, selector)

  assign(contract, address && { address }, name && { name })
  const updated = await repository.save(contract)

  _print(updated, "updated")
  return updated
}

export async function remove(dataSource: DataSource, selector: string) {
  const repository = dataSource.getRepository(Contract)
  const contract = await findOneBySelector(repository, selector, true)

  _print(contract, "removed")

  const couponTasks = contract.coupons.map(({ id }) =>
    couponMethods.remove(dataSource, id.toString()),
  )

  await Promise.all(couponTasks)
  await repository.remove(contract)

  return contract
}

export async function list(dataSource: DataSource, options: ListOptions) {
  const repository = dataSource.getRepository(Contract)
  const contracts = await repository
    .createQueryBuilder("contract")
    .leftJoinAndSelect("contract.coupons", "coupon")
    .leftJoinAndSelect("contract.owner", "owner")
    .getMany()

  contracts.length > 0
    ? _print(contracts)
    : log(chalk.bgBlackBright.whiteBright("List is empty"))

  return contracts
}

export async function balance(dataSource: DataSource, selector: string) {
  const repository = dataSource.getRepository(Contract)
  const contract = await findOneBySelector(repository, selector, true)
  const balance = await contractBalance(contract)

  log(
    fmtList([
      ["📝 Contract:", `${contract.address} <${contract.name || "unnamed"}>`, "bgGreen"],
      ["👤 Owner:", `${contract.owner.address} <${contract.owner.name || "unnamed"}>`],
      ["--------------------"] as any,
      ["💰 Contract Balance:", fmtBalance(balance)],
    ]),
  )

  return balance
}

export async function fill(
  dataSource: DataSource,
  selector: string,
  { amount: _amount, unit = "Pico" }: FillBalance,
) {
  const amount = getBalance(_amount.toNumber(), BalanceGrade[unit])
  const repository = dataSource.getRepository(Contract)

  const contract = await findOneBySelector(repository, selector, true)
  const balance = await contractFillBalance(contract, amount)

  log(
    fmtList([
      ["📝 Contract:", `${contract.address} <${contract.name || "unnamed"}>`, "bgGreen"],
      ["👤 Owner:", `${contract.owner.address} <${contract.owner.name || "unnamed"}>`],
      ["--------------------"] as any,
      ["💸 Filled for:", fmtBalance(amount)],
      ["💰 Balance:", fmtBalance(balance)],
    ]),
  )

  return balance
}

export async function payback(dataSource: DataSource, selector: string) {
  const repository = dataSource.getRepository(Contract)
  const contract = await findOneBySelector(repository, selector, true)
  await contractPayback(contract)

  log(
    fmtList([
      ["📝 Contract:", `${contract.address} <${contract.name || "unnamed"}>`, "bgGreen"],
      ["👤 Owner:", `${contract.owner.address} <${contract.owner.name || "unnamed"}>`],
      ["--------------------"] as any,
      ["✨ Payback:", "Successfully"],
    ]),
  )

  return true
}

export async function transfer_ownership(
  dataSource: DataSource,
  selector: string,
  { owner: ownerSelector }: TransferOptions,
) {
  const ownerRepository = dataSource.getRepository(Owner)
  const repository = dataSource.getRepository(Contract)

  const contract = await findOneBySelector(repository, selector, true)
  const owner = await ownerMethods.findOneBySelector(ownerRepository, ownerSelector)

  await contractTransferOwnership(contract, owner)

  contract.owner = owner
  const updated = await repository.save(contract)

  _print(updated, "transfered")
  return true
}
