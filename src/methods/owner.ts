import { DataSource, Repository } from "typeorm"
import { polkadot } from "ocex-api"
import Table from "easy-table"
import chalk from "chalk"

import { fmtBalance, fmtList, keyring, log } from "../utils"
import * as contractMethods from "./contract"
import { ownerBalance } from "../api/owner"
import { Owner } from "../entity/owner"
import { config } from "../config"

interface CreateOptions {
  name?: string
}

interface UpdateOptions {
  secret?: string
  name?: string
}

interface ListOptions {
  short?: boolean
}

const { assign } = Object

const _print = (data: Owner | Owner[], action?: string) => {
  const table = new Table()

  const _row = (record: Owner) => {
    table.cell("id", record.id)
    table.cell("name", record.name || "<not assigned>")
    table.cell("🗒️ address", record.address)
    record?.contracts?.length && table.cell("📝 contracts (count)", record.contracts.length)

    table.newRow()
  }

  if (config.logging) {
    if (action) {
      console.log(chalk.green.bgBlack.bold(`Owner successfully ${action}`))
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
  repository: Repository<Owner>,
  selector: string,
  relations = false,
) {
  const query = ["owner.address = :q", "owner.name = :q"]
  const params: any = { q: selector }

  const maybeId = parseInt(selector)
  if (!isNaN(maybeId)) {
    query.push("owner.id = :id")
    params.id = maybeId
  }

  let qb = repository.createQueryBuilder("owner")

  if (relations) {
    qb = qb.leftJoinAndSelect("owner.contracts", "contract")
  }

  const owner = await qb
    .where(query.join(" OR "), params)
    .getOneOrFail()
    .catch(error => {
      console.log(chalk.blackBright.bgRed.bold("Owner not found"))
      throw error
    })

  return owner
}

export async function create(
  dataSource: DataSource,
  secret: string,
  opts: CreateOptions,
) {
  const repository = dataSource.getRepository(Owner)
  const address = polkadot.util.u8aToHex(keyring.addFromUri(secret).addressRaw)

  const record = assign(new Owner(), { secret, address }, opts)
  const owner = await repository.save(record)

  _print(owner, "created")
  return owner
}

export async function update(
  dataSource: DataSource,
  selector: string,
  { secret, name }: UpdateOptions,
) {
  if (!name && !secret) {
    const error = new Error("Need minimum one of options: --secret or --name")
    log(chalk.black.bgRed.bold(error.message))
    throw error
  }

  const repository = dataSource.getRepository(Owner)

  const owner = await findOneBySelector(repository, selector)
  const address = secret && polkadot.util.u8aToHex(keyring.addFromUri(secret).addressRaw)

  assign(owner, secret && { secret }, address && { address }, name && { name })
  const updated = await repository.save(owner)

  _print(updated, "updated")
  return updated
}

export async function remove(dataSource: DataSource, selector: string) {
  const repository = dataSource.getRepository(Owner)
  const owner = await findOneBySelector(repository, selector, true)

  _print(owner, "removed")

  const contractTasks = owner.contracts.map(({ id }) =>
    contractMethods.remove(dataSource, id.toString()),
  )

  await Promise.all(contractTasks)
  await repository.remove(owner)

  return owner
}

export async function list(dataSource: DataSource, options: ListOptions) {
  const repository = dataSource.getRepository(Owner)
  const owners = await repository.find({
    relations: ["contracts"],
  })

  owners.length > 0 ? _print(owners) : log(chalk.bgBlue.white("List is empty"))

  return owners
}

export async function balance(dataSource: DataSource, selector: string) {
  const repository = dataSource.getRepository(Owner)
  const owner = await findOneBySelector(repository, selector, true)
  const balance = await ownerBalance(owner)

  log(
    fmtList([
      ["👤 Owner:", `${owner.address} <${owner.name || "unnamed"}>`],
      ["--------------------"] as any,
      ["💰 Owner Balance:", fmtBalance(balance)],
    ]),
  )

  return balance
}
