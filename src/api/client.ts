import { polkadot } from "ocex-api"
import chalk from "chalk"

import { config } from "../config"
import { log } from "../utils"

export async function getClient(): Promise<polkadot.api.ApiPromise> {
  const endpoint = `ws://${config.apiUrl}`
  log(chalk.bgBlue.whiteBright(`🌐 Connect to RPC node: ${endpoint}`))
  
  const provider = new polkadot.api.WsProvider(endpoint)
  const client = await polkadot.api.ApiPromise.create({ provider })

  return client
}
