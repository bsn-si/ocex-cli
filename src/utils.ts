import { polkadot, fmtBalance as _fmtBalance, BalanceGrade } from "ocex-api"
import * as readline from "readline"
import chalk from "chalk"
import BN from "bn.js"

import { config } from "./config"

export const keyring = new polkadot.keyring.Keyring({ type: "sr25519" })

export function getPassword(): Promise<string> {
  return new Promise((resolve, reject) => {
    const rl: any = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.stdoutMuted = true

    rl.question("Account Password: ", (password: string) => {
      console.log("\n")

      if (!password.length) {
        reject(new Error("password cannot be empty"))
      } else {
        resolve(password)
      }

      rl.close()
    })

    rl._writeToOutput = stringToWrite => {
      if (rl.stdoutMuted) rl.output.write("*")
      else rl.output.write(stringToWrite)
    }
  })
}

export function log(...args) {
  if (config.logging) {
    console.log(...args)
  }
}

export const fmtAddress = (address: string) => {
  return config.display.ss58 ? polkadot.utilCrypto.encodeAddress(address) : address
}

export const fmtBalance = (balance: BN) => {
  let grade, value

  if (balance.lt(new BN(BalanceGrade.Unit))) {
    if (balance.lt(new BN(BalanceGrade.Milli))) {
      value = _fmtBalance(balance, BalanceGrade.Micro)
      grade = "Micro"
    } else {
      value = _fmtBalance(balance, BalanceGrade.Milli)
      grade = "Milli"
    }
  } else {
    value = _fmtBalance(balance, BalanceGrade.Unit)
    grade = "Unit"
  }

  return chalk.bold(`${value} ${grade}`) + ` (${balance.toString()} Pico)`
}

export const fmtWidth = (message: string, width: number) => {
  const rest = width - message.length
  const ws = new Array(rest > 0 ? rest : 1).join(" ")
  return message + ws
}

export const fmtList = (list: ([string, string] | [string, string, string])[]) => {
  let message = ""

  list.forEach(([title, value, bgStyle]) => {
    const styledBg = bgStyle ? chalk[bgStyle] : chalk
    const styledText = bgStyle ? chalk.black : chalk

    message += styledBg(
      styledText.bold(fmtWidth(title, 20)),
      value ? styledText(value) : "",
      "\n",
    )
  })

  return message
}
