import { DataSource, Repository } from "typeorm"
import { polkadot } from "ocex-api"
import Table from "easy-table"
import chalk from "chalk"

import { fmtAddress, fmtBalance, fmtList, keyring, log } from "../utils"
import * as contractMethods from "./contract"
import { ownerBalance } from "../api/owner"
import { Owner } from "../entity/owner"
import { config } from "../config"

interface CreateOptions {
  name?: string
  json?: string
}

interface UpdateOptions {
  secret?: string
  name?: string
  json?: string
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

    table.cell(
      `🗒️ address (${config.display.ss58 ? "ss58" : "hex"})`,
      fmtAddress(record.address),
    )

    record?.contracts?.length &&
      table.cell("📝 contracts (count)", record.contracts.length)

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
  { json, name }: CreateOptions,
) {
  if (!secret && !json) {
    const error = new Error("Need minimum one of [secret] argument or --json option")
    log(chalk.black.bgRed.bold(error.message))
    throw error
  }

  if (secret && json) {
    const error = new Error("Choose one of [secret] argument or --json option")
    log(chalk.black.bgRed.bold(error.message))
    throw error
  }

  const repository = dataSource.getRepository(Owner)

  // prettier-ignore
  const address = polkadot.util.u8aToHex(
    polkadot.utilCrypto.decodeAddress(
      secret
        ? keyring.addFromUri(secret).address
        : JSON.parse(json).address,
    ),
  )

  const record = assign(new Owner(), { name, address, json }, secret && { secret })
  const owner = await repository.save(record)

  _print(owner, "created")
  return owner
}

export async function update(
  dataSource: DataSource,
  selector: string,
  { secret, name, json }: UpdateOptions,
) {
  if (!name && !secret && !json) {
    const error = new Error("Need minimum one of options: --secret or --name")
    log(chalk.black.bgRed.bold(error.message))
    throw error
  }

  if (secret && json) {
    const error = new Error("Choose one of options: --secret or --json")
    log(chalk.black.bgRed.bold(error.message))
    throw error
  }

  const repository = dataSource.getRepository(Owner)
  const owner = await findOneBySelector(repository, selector)

  let address
  if (secret || json) {
    // prettier-ignore
    address = polkadot.util.u8aToHex(
      polkadot.utilCrypto.decodeAddress(
        secret
          ? keyring.addFromUri(secret).address
          : JSON.parse(json).address,
      ),
    )
  }

  if (json && owner.secret) {
    delete owner.secret
  }

  if (secret && owner.json) {
    delete owner.json
  }

  assign(
    owner,
    address && { address },
    secret && { secret },
    name && { name },
    json && { json },
  )

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
      ["👤 Owner:", `${fmtAddress(owner.address)} <${owner.name || "unnamed"}>`],
      ["--------------------"] as any,
      ["💰 Owner Balance:", fmtBalance(balance)],
    ]),
  )

  return balance
}
