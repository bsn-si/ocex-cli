import { polkadot } from "ocex-api"
import chalk from "chalk"

import { getPassword, keyring, log } from "../utils"
import { Owner } from "../entity/owner"
import { config } from "../config"

export async function getSignerFromOwner(owner: Owner) {
  if (owner.json) {
    const { encoding, encoded, meta } = JSON.parse(owner.json)
    const password = await getPassword()

    const decoded = polkadot.decodePair(
      password,
      polkadot.utilCrypto.base64Decode(encoded),
      encoding.type,
    )
    
    return keyring.createFromPair(decoded, meta, "sr25519")
  } else {
    return keyring.addFromUri(owner.secret)
  }
}

export async function getClient(): Promise<polkadot.api.ApiPromise> {
  const endpoint = config.apiUrl
  log(chalk.bgBlue.whiteBright(`🌐 Connect to RPC node: ${endpoint}`))

  const provider = new polkadot.api.WsProvider(endpoint)
  const client = await polkadot.api.ApiPromise.create({ provider })

  return client
}
