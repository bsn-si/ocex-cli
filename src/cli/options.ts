import { Argument, Option } from "commander"
import * as validator from "./validators"

const amountUnitTypes = ["Pico", "Nano", "Micro", "Milli", "Unit", "Kilo", "Mill"]

// prettier-ignore
const cmdArguments = {
  contract: ["<address>", "contract address, without this option - instantiate new", validator.address],
  recordSelector: ["<selector>", "id, name or address in hex format", validator.queryAddress],
  secretKey: ["<secret_key>", "sr25519 secret key in hex format", validator.secretKey],
}

// prettier-ignore
const cmdOptions = {
  receiverAddress: ["--address <address>", "coupon receiver address in hex", validator.address],
  contractAddress: ["--address <address>", "contract address in hex", validator.address],
  amountUnit: ["--unit <type>", "amount unit type", undefined, amountUnitTypes],
  owner: ["--owner <selector>", "owner of contract - id, name or address in hex", validator.queryAddress],
  contract: ["--contract <selector>", "contract - id, name or address in hex", validator.queryAddress],
  secretKey: ["--secret <secret_key>", "sr25519 secret key in hex format", validator.aliasName],
  name: ["--name <name>", "alias name for simple access from cli", validator.aliasName],
  amount: ["--amount <int>", "amount of funds", validator.isValidAmount],
  short: ["--short", "display short info"],
}

export function getOption(name: string, isOptional = false) {
  const [_opt, desc, validator, choices] = cmdOptions[name]
  const opt = isOptional ? _opt : _opt.replaceAll("<", "[").replaceAll(">", "]")
  const option = new Option(opt, desc)

  if (isOptional) {
    option.optional = true
  }

  if (validator) {
    option.argParser(validator)
  }

  if (choices) {
    option.choices(choices)
  }

  return option
}

export function getArgument(name: string, isOptional = false) {
  const [opt, desc, validator] = cmdArguments[name]
  const option = new Argument(opt, desc)

  if (isOptional) {
    option.argOptional()
  }

  if (validator) {
    option.argParser(validator)
  }

  return option
}
