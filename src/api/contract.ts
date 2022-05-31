import { Ocex, polkadot } from "ocex-api"
import fs from "fs/promises"
import chalk from "chalk"
import path from "path"
import BN from "bn.js"

import { getClient, getSignerFromOwner } from "./client"
import { Contract } from "../entity/contract"
import { Owner } from "../entity/owner"
import { log } from "../utils"

export async function сontractInstantiate(owner: Owner) {
  const wasm = await fs.readFile(path.join(__dirname, "../assets/ocex.wasm"))
  const pair = await getSignerFromOwner(owner)
  const client = await getClient()

  log(chalk.bgBlue.whiteBright("🗂️ Upload & instantiate contract"))
  const contract = await Ocex.instantiateWithCode(client, pair, wasm)
  log(chalk.bgBlue.whiteBright("🎆 Contract instantiated"))
  log("\n")

  const address = contract.address.toHex()
  return address
}

export async function contractBalance(record: Contract): Promise<BN> {
  const pair = await getSignerFromOwner(record.owner)
  const client = await getClient()
  const { address } = record

  const contract = await Ocex.fromAddress(client, pair, address)
  const balance = await contract.contractBalance()

  return balance
}

export async function contractFillBalance(record: Contract, amount: BN): Promise<BN> {
  const pair = await getSignerFromOwner(record.owner)
  const client = await getClient()
  const { address } = record

  const contract = await Ocex.fromAddress(client, pair, address)
  const balance = await contract.fillBalance(amount)

  return balance
}

export async function contractPayback(record: Contract): Promise<boolean> {
  const pair = await getSignerFromOwner(record.owner)
  const client = await getClient()
  const { address } = record

  const contract = await Ocex.fromAddress(client, pair, address)
  await contract.paybackNotReservedFunds()
  return true
}

export async function contractTransferOwnership(record: Contract, owner: Owner) {
  const pair = await getSignerFromOwner(record.owner)
  const client = await getClient()
  const { address } = record

  const contract = await Ocex.fromAddress(client, pair, address)
  return contract.transferOwnership(owner.address)
}
