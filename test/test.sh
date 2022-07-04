#!/bin/bash
shopt -s expand_aliases

TEST_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
PROJECT_DIR="$(dirname "$TEST_DIR")"

EXEC_PATH="${PROJECT_DIR}/dist/index.js"
DB_DIR="${TEST_DIR}/ocex"

if [ -f "$EXEC_PATH" ]; then
    echo "Start interaction."
else
    echo "Cli does not exist. Please build before interaction."
    echo "You can build cli with 'npm run build'"
    exit 1
fi

# Alias to cli, with tmp dir for save data
alias ocex-cli="DATA_DIR=${DB_DIR} node ${EXEC_PATH}"

echo "Clean test db"
rm -rf ${DB_DIR}

echo "Owner"

echo "Owner create from secret key"
ocex-cli owner create 0x398f0c28f98885e046333d4a41c19cee4c37368a9832c6502f6cfd182e2aef89 --name Bob
ocex-cli owner create 0xbc1ede780f784bb6991a585e4f6e61522c14e1cae6ad0895fb57b9a205a8f938 --name Charlie

echo "Owner create from encrypted json"
ocex-cli owner create --json ${TEST_DIR}/test-account.json --name Test

echo "Update owner params"
echo "you can change account '--secret' - but its danger if you already have contracts"
echo "you can update account alias '--name'"
ocex-cli owner update Bob \
  --secret 0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a \
  --name Alice

echo "List of owners"
ocex-cli owner list

echo "Get account balance"
ocex-cli owner balance Alice

echo "Remove owner record from database with all associated items"
ocex-cli owner remove Test


echo "Contract"

echo "Instantiate new contract in blockchain"
ocex-cli contract create --owner Alice --name MyName
ocex-cli contract create --owner Alice --name SecondContract

echo "List of contracts"
ocex-cli contract list

echo "Update contract"
ocex-cli contract update MyName --name Contract

echo "Contract balance"
ocex-cli contract balance Contract

echo "Fill contract balance from owner funds"
ocex-cli contract fill Contract --amount 100 --unit Unit

echo "Transfer ownership"
ocex-cli contract transfer_ownership Contract --owner Charlie

echo "Remove contract"
ocex-cli contract remove SecondContract


echo "Coupons"

echo "Generate new coupon and add to contract"
ocex-cli coupon create --contract Contract --name Coupon --amount 10 --unit Unit
ocex-cli coupon create --contract Contract --amount 10 --unit Unit

echo "List of coupons"
ocex-cli coupon list

echo "Update exists contract"
ocex-cli coupon update 2 --name SecondCoupon

echo "Show exists coupon record"
ocex-cli coupon show Coupon

echo "Check coupon status in blockchain"
ocex-cli coupon check Coupon

echo "Activate coupon"
ocex-cli coupon activate Coupon --address=0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d

echo "Burn coupon"
ocex-cli coupon burn SecondCoupon

echo "Remove coupon"
ocex-cli coupon remove SecondCoupon

echo "Contract withdraw"
ocex-cli contract payback Contract 

echo "Cleanup"
rm -rf ${DB_DIR}