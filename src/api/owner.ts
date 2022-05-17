import BN from "bn.js"

import { Owner } from "../entity/owner"
import { getClient } from "./client"

export async function ownerBalance(record: Owner): Promise<BN> {
  const client = await getClient()

  const {
    data: { free },
  } = (await client.query.system.account(record.address)) as any
  return free
}
