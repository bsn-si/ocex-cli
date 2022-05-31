import { InvalidArgumentError } from "commander"
import { polkadot } from "ocex-api"
import * as path from "path"
import * as fs from "fs"
import BN from "bn.js"

import { keyring } from "../utils"

const ALIAS_NAME_REGEX = /^[a-zA-Z0-9]+$/

export const isValidAddress = (address: string) => {
  try {
    polkadot.keyring.encodeAddress(
      polkadot.util.isHex(address)
        ? polkadot.util.hexToU8a(address)
        : polkadot.keyring.decodeAddress(address),
    )
    return true
  } catch (error) {
    return false
  }
}

export const isValidAmount = (value: string) => {
  try {
    const number = new BN(value)
    return number
  } catch (error) {
    throw new InvalidArgumentError("Accepted only integer number")
  }
}

export const queryAddress = (value: string) => {
  if ((value && isValidAddress(value)) || ALIAS_NAME_REGEX.test(value)) {
    return value
  } else {
    throw new InvalidArgumentError("Accepted only contract name on db or address")
  }
}

export const address = (value: string) => {
  if (value && isValidAddress(value)) {
    return value
  } else {
    throw new InvalidArgumentError("Accepted only contract address in hex")
  }
}

export const secretKey = (value: string) => {
  try {
    keyring.addFromUri(value)
    return value
  } catch (error) {
    throw new InvalidArgumentError(
      "Accepted only 'sr25519' hex secret keys or subkey values",
    )
  }
}

export const aliasName = (value: string) => {
  if (value && ALIAS_NAME_REGEX.test(value)) {
    return value
  } else {
    throw new InvalidArgumentError(
      `Accepted only simple name (like ${ALIAS_NAME_REGEX.toString()})`,
    )
  }
}

export const encryptedJson = (jsonPath: string) => {
  try {
    const file = fs.readFileSync(path.resolve(jsonPath), { encoding: "utf8" })
    const account = JSON.parse(file)
    
    if (
      typeof account !== "object" ||
      !account.encoded ||
      !account.encoding ||
      !account.address ||
      !account.meta
    ) {
      throw new Error("Invalid json scheme")
    }

    return JSON.stringify(account)
  } catch (error) {
    throw new InvalidArgumentError(error.message)
  }
}
