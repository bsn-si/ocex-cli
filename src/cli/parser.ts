import { Command } from "commander"
import { getOption, getArgument } from "./options"

export interface CliMethod {
  options: Record<string, any>
  argument: string[]
  command: string
  method: string
}

export function parse(argv: string[]): CliMethod {
  let parsed

  const setParsed: any =
    (command: string) =>
    (...args) => {
      const {
        processedArgs: argument,
        _optionValues: options,
        _name: method,
      } = args[args.length - 1]

      parsed = {
        argument,
        command,
        options,
        method,
      }
    }

  const program = new Command()
    .name("ocex-cli")
    .description("Tool for interact with ocex - manage contracts & coupons")
    .version("0.1.0")

  const owner = new Command("owner")
    .description("Interact with owner")
    .addCommand(
      new Command("list").description("display all owners").action(setParsed("owner")),
    )
    .addCommand(
      new Command("create")
        .description("create new owner from secret key")
        .addArgument(getArgument("secretKey"))
        .addOption(getOption("name", true))
        .action(setParsed("owner")),
    )
    .addCommand(
      new Command("update")
        .description("!Danger: update owner name or secret")
        .addArgument(getArgument("recordSelector"))
        .addOption(getOption("secretKey", true))
        .addOption(getOption("name", true))
        .action(setParsed("owner")),
    )
    .addCommand(
      new Command("remove")
        .description("!Danger: remove owner with owned contracts & coupons from db")
        .addArgument(getArgument("recordSelector"))
        .action(setParsed("owner")),
    )
    .addCommand(
      new Command("balance")
        .description("Display owner balance")
        .addArgument(getArgument("recordSelector"))
        .action(setParsed("owner")),
    )

  const contract = new Command("contract")
    .description("Interact with contracts")
    .addCommand(
      new Command("list")
        .description("display all contracts")
        .action(setParsed("contract")),
    )
    .addCommand(
      new Command("create")
        .description("create new contract from address or instantiate new on blockchain")
        .addArgument(getArgument("contract", true))
        .addOption(getOption("name", true))
        .addOption(getOption("owner"))
        .action(setParsed("contract")),
    )
    .addCommand(
      new Command("update")
        .description("!Danger: update contract name or address")
        .addArgument(getArgument("recordSelector"))
        .addOption(getOption("contractAddress", true))
        .addOption(getOption("name", true))
        .action(setParsed("contract")),
    )
    .addCommand(
      new Command("remove")
        .description("!Danger: remove contract with owned coupons from db")
        .addArgument(getArgument("recordSelector"))
        .action(setParsed("contract")),
    )
    .addCommand(
      new Command("balance")
        .description("Display contract balance")
        .addArgument(getArgument("recordSelector"))
        .action(setParsed("contract")),
    )
    .addCommand(
      new Command("payback")
        .description("Payback not reserved funds from contract")
        .addArgument(getArgument("recordSelector"))
        .action(setParsed("contract")),
    )
    .addCommand(
      new Command("fill")
        .description("Fill contract balance from owner")
        .addArgument(getArgument("recordSelector"))
        .addOption(getOption("amountUnit", true))
        .addOption(getOption("amount"))
        .action(setParsed("contract")),
    )
    .addCommand(
      new Command("transfer_ownership")
        .description("Transfer contract ownership to another owner")
        .addArgument(getArgument("recordSelector"))
        .addOption(getOption("owner"))
        .action(setParsed("contract")),
    )

  const coupon = new Command("coupon")
    .description("Interact with coupons")
    .addCommand(
      new Command("list").description("display all coupons").action(setParsed("coupon")),
    )
    .addCommand(
      new Command("create")
        .description("add new coupon to contract on blockchain")
        .addArgument(getArgument("secretKey", true))
        .addOption(getOption("amountUnit", true))
        .addOption(getOption("name", true))
        .addOption(getOption("contract"))
        .addOption(getOption("amount"))
        .action(setParsed("coupon")),
    )
    .addCommand(
      new Command("update")
        .description("!Danger: update coupon name or address")
        .addArgument(getArgument("recordSelector"))
        .addOption(getOption("secretKey", true))
        .addOption(getOption("name", true))
        .action(setParsed("coupon")),
    )
    .addCommand(
      new Command("remove")
        .description("!Danger: remove coupon from db and burn in blockchain")
        .addArgument(getArgument("recordSelector"))
        .action(setParsed("coupon")),
    )
    .addCommand(
      new Command("check")
        .description("Check coupon in smartcontract with amount")
        .addArgument(getArgument("recordSelector"))
        .action(setParsed("coupon")),
    )
    .addCommand(
      new Command("activate")
        .description("Activate coupon, if don't have receiver - owner receive funds")
        .addArgument(getArgument("recordSelector"))
        .addOption(getOption("receiverAddress", true))
        .action(setParsed("coupon")),
    )
    .addCommand(
      new Command("burn")
        .description("Burn coupon, and unfreeze contract funds")
        .addArgument(getArgument("recordSelector"))
        .action(setParsed("coupon")),
    )

  // prettier-ignore
  program
    .addCommand(contract)
    .addCommand(coupon)
    .addCommand(owner)

  program.parse(argv)
  return parsed
}
