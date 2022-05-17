import { polkadot, fmtBalance as _fmtBalance, BalanceGrade } from "ocex-api"
import chalk from "chalk"
import BN from "bn.js"

import { config } from "./config"

export const keyring = new polkadot.keyring.Keyring({ type: "sr25519" })

export function log(...args) {
  if (config.logging) {
    console.log(...args)
  }
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
