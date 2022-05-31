import * as path from "path"
import * as fs from "fs"
import * as os from "os"
import chalk from "chalk"

import { log } from "./utils"

export const config = {
  // show result for all command
  logging: true,
  // trace errors in output
  trace: true,
  // default endpoint address to node
  apiUrl: "ws://127.0.0.1:9944",
  // display options
  display: {
    // show and log all addresses for owner & contracts in ss58 format
    ss58: true,
  },
}

export const CONFIG_PATH = path.join(os.homedir(), ".ocex/config.json")

export function extendsConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const file = fs.readFileSync(CONFIG_PATH, "utf-8")
      const params = JSON.parse(file)
      Object.assign(config, params)
    } else {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8")
    }
  } catch (error) {
    log(chalk.black.bgRed.bold(`Invalid JSON config at ${CONFIG_PATH}`))
  }
}
