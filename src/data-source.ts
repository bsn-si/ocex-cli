import { DataSource } from "typeorm"
import fs from "fs"

import { Contract } from "./entity/contract"
import { Coupon } from "./entity/coupon"
import { Owner } from "./entity/owner"
import { DATABASE_PATH } from "./config"

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
