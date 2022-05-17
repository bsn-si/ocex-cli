import { DataSource } from "typeorm"
import { config } from "../config"

import { getMethod } from "../methods"
import { parse } from "./parser"

export async function cli(dataSource: DataSource) {
  const { argument, options, command, method } = parse(process.argv)

  const action = getMethod(command, method)

  try {
    const args: any = [dataSource, options]

    if (argument.length > 0) {
      args.splice(1, 0, ...argument)
    }

    await action(...args)
  } catch (error) {
    if (config.trace) {
      console.error(error)
    }
  }
}
