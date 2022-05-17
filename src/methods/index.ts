import * as contract from "./contract"
import * as coupon from "./coupon"
import * as owner from "./owner"

const methods = {
  contract,
  coupon,
  owner,
}

export function getMethod(group: string, method: string): (...args) => Promise<void> {
  const _default = async (_, ...args) => console.log("void", args)
  const _fn = methods?.[group]?.[method]

  return _fn ? _fn : _default
}
