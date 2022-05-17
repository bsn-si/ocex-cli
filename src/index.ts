#!/usr/bin/env node

import "reflect-metadata"

import { polkadot } from "ocex-api"
import * as process from "process"

import { AppDataSource } from "./data-source"
import { cli } from "./cli"

async function main() {
  await polkadot.utilCrypto.cryptoWaitReady()

  try {
    const dataSource = await AppDataSource.initialize()
    await cli(dataSource)
  } finally {
    process.exit(0)
  }
}

main()
