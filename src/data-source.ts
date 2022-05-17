import { DataSource } from "typeorm"
import path from "path"
import os from "os"
import fs from "fs"

import { Contract } from "./entity/contract"
import { Coupon } from "./entity/coupon"
import { Owner } from "./entity/owner"

const DATABASE_PATH = path.join(os.homedir(), ".ocex/ocex.sqlite")
const synchronize = !fs.existsSync(DATABASE_PATH)

export const AppDataSource = new DataSource({
  database: DATABASE_PATH,
  type: "better-sqlite3",
  logging: false,
  synchronize,

  entities: [Owner, Contract, Coupon],
  subscribers: [],
  migrations: [],
})
