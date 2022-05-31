#!/usr/bin/env node

import "reflect-metadata"

import { polkadot } from "ocex-api"
import * as process from "process"

import { AppDataSource } from "./data-source"
import { extendsConfig } from "./config"
import { cli } from "./cli"

async function main() {
  await polkadot.utilCrypto.cryptoWaitReady()

  try {
    const dataSource = await AppDataSource.initialize()
    extendsConfig()

    await cli(dataSource)
  } finally {
    process.exit(0)
  }
}

main()
