## Disclaimer
> 💀 This is a **Work in Progress**.  
> Current status: Common PoC data storage and methods available. Partially tested.   
> **Use at your own risk**.

<h1 align="center">
    🎟️ ✨ OCEX CLI Client 🎁 👛
</h1>

OCEX smartcontract CLI management tool.

## Features
- [Owners](#owners)
    - [Create](#create)
    - [Update](#update)
    - [Remove](#remove)
    - [Balance](#balance)
    - [List](#list)
- [Contracts](#contracts)
    - [Create](#create-1)
    - [Update](#update-1)
    - [Remove](#remove-1)
    - [List](#list-1)    
    - [Balance](#balance-1)
    - [Fill Balance](#fill-balance)
    - [Payback](#payback)
    - [Transfer Ownership](#transfer-ownership)
- [Coupons](#coupons)
    - [Create](#create-2)
    - [Update](#update-2)
    - [Remove](#remove-2)
    - [List](#list-2)    
    - [Check](#check)
    - [Activate](#activate)
    - [Burn](#burn)

## Install && Usage

To give access to `ocex-cli` command in your environment:
```
git clone git@github.com:bsn-si/ocex-cli.git
cd ocex-cli/ && npm run install:global
```
`Tested on MacOS & Linux`

Also you can run cli from docker.

``` bash
git clone git@github.com:bsn-si/ocex-cli.git
cd ocex-cli/
docker build -t ocex-cli:latest .
docker run ocex-cli:latest --help
```

## Before interaction
For some operations a node RPC is needed, by default `127.0.0.1:9944` is used.
You can install [substrate-contracts-node](https://github.com/paritytech/substrate-contracts-node).

### Config
By default you can finds config for cli in `~/.ocex/config.json`, and have these options

``` js
{
  // show result for all command
  "logging": true,
  // trace errors in output
  "trace": true,
  // default endpoint address to node
  "apiUrl": "ws://127.0.0.1:9944",
  // display options
  "display": {
    // show and log all addresses for owner & contracts in ss58 format, if false show address in hex
    "ss58": true,
  },
}
```

Also you can set data directory by environment variable `DATA_DIR`, this can be used for different networks or databases.

## Usage
Please use `--help` to get info about all commands & options.

``` bash
➜  ~ ocex-cli 
Usage: ocex-cli [options] [command]

Tool to interact with OCEX - manage contracts & coupons

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  contract        Interact with contracts
  coupon          Interact with coupons
  owner           Interact with owner
  help [command]  display help for command
```

### Owners
An owner is a user who manages the smart-contract and pays for all management transactions. All contracts need an owner to be assigned.

#### Create
You can sign a new owner with his secret key, and also set alias name to simplify other commands. E.g. adding default keyring `//Alice` account:

``` bash
➜  ~ ocex-cli owner create 0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a --name=Alice
Owner successfully created
id  name   🗒️ address                                                        
--  -----  ------------------------------------------------------------------
1   Alice  0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d
```

Also for production you can save encrypted json to database, and sign all transactions with password.

```
➜  ~ ocex-cli owner create --json=/home/anton/MyAccount.Polkadot.json --name=User
Owner successfully created
id  name  🗒️ address (ss58)                               
--  ----  ------------------------------------------------
1   User  5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty
```

#### Update
You can update owner alias name, or his secret key. E.g. this can be done after transferring ownership of the contract. Secret key should be changed with care as all transactions for existing contracts will be signed with this key.

``` bash
➜  ~ ocex-cli owner update Alice --name=Bob --secret=0x398f0c28f98885e046333d4a41c19cee4c37368a9832c6502f6cfd182e2aef89
Owner successfully updated
id  name  🗒️ address                                                        
--  ----  ------------------------------------------------------------------
1   Bob   0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48
```

#### Remove
An owner can be removed, all related contracts & coupons will be removed from the management tool DB as well. Delete looks like:

``` bash
➜  ~ ocex-cli owner remove Bob
Owner successfully removed
id  name  🗒️ address                                                        
--  ----  ------------------------------------------------------------------
1   Bob   0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48
```

#### List
To see the list of all owners:

``` bash
➜  ~ ocex-cli owner list
id  name   🗒️ address                                                          📝 contracts (count)
--  -----  ------------------------------------------------------------------  --------------------
1   Alice  0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d  1  
```

#### Balance
To check current owner's balance:

``` bash
➜  ~ ocex-cli owner balance Alice
🌐 Connect to RPC node: ws://127.0.0.1:9944
👤 Owner:           0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d <Alice> 
--------------------  
💰 Owner Balance:   1152921 Unit (1152921504606846976 Pico)
```

### Contracts
All methods are called & signed by a related owner.

#### Create
You can create a new contract or add an existing one with preset contract address. To instantiate a new contract:

``` bash
➜  ~ ocex-cli contract create --name=SampleContract --owner=Alice
🌐 Connect to RPC node: ws://127.0.0.1:9944
🗂️ Upload & instantiate contract
🎆 Contract instantiated


Contract successfully created
id  name            🗒️ address                                                          🎈 published  👤 owner     
--  --------------  ------------------------------------------------------------------  ------------  -------------
1   SampleContract  0x903294b33d6b1dc6389cd7e52f4e3de1465090ab9f99c9edc36530957ab3cc94  Yes           id: 1 <Alice>

```

#### Update
You can update contract alias name and address. This should be done with care as history and registered coupons are not transferred to the new contract.

``` bash 
➜  ~ ocex-cli contract update SampleContract --name=MyContract
Contract successfully updated
id  name        🗒️ address                                                          🎈 published
--  ----------  ------------------------------------------------------------------  ------------
1   MyContract  0x903294b33d6b1dc6389cd7e52f4e3de1465090ab9f99c9edc36530957ab3cc94  Yes 
```

#### Remove
All related coupons (with corresponding private keys) will be removed from the management tool DB and not restored even after reconnecting the contract to the CLI. Delete looks like:

``` bash
➜  ~ ocex-cli contract remove MyContract                      
Contract successfully removed
id  name        🗒️ address                                                          🎈 published  👤 owner       🎟️ coupons (count)
--  ----------  ------------------------------------------------------------------  ------------  -------------  ------------------
1   MyContract  0x903294b33d6b1dc6389cd7e52f4e3de1465090ab9f99c9edc36530957ab3cc94  Yes           id: 1 <Alice>  0
```

#### List
List of all contracts

``` bash
➜  ~ ocex-cli contract list
id  name            🗒️ address                                                          🎈 published  👤 owner       🎟️ coupons (count)
--  --------------  ------------------------------------------------------------------  ------------  -------------  ------------------
1   SampleContract  0x693e2e72609187bd24930185e6884e745df59a6df007d5faff9b3db95c328882  Yes           id: 1 <Alice>  0       
```

#### Fill balance
To interact with a contract and register coupons the contract balance should be toped up. With this command you top up the contract's balance with the owner's funds. 

``` bash
➜  ~ ocex-cli contract fill SampleContract --amount=100 --unit=Unit
🌐 Connect to RPC node: ws://127.0.0.1:9944
📝 Contract:        0x693e2e72609187bd24930185e6884e745df59a6df007d5faff9b3db95c328882 <SampleContract> 
👤 Owner:           0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d <Alice> 
--------------------  
💸 Filled for:      100 Unit (100000000000000 Pico) 
💰 Balance:         100 Unit (100000000000000 Pico) 
```

#### Balance
To check the contract's balance

``` bash
➜  ~ ocex-cli contract balance SampleContract                         
🌐 Connect to RPC node: ws://127.0.0.1:9944
📝 Contract:        0x693e2e72609187bd24930185e6884e745df59a6df007d5faff9b3db95c328882 <SampleContract> 
👤 Owner:           0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d <Alice> 
--------------------  
💰 Contract Balance: 100 Unit (100000000000000 Pico) 
```

#### Withdraw
You can withdraw free funds from the contract (that are not reserved for registered coupons).

``` bash
➜  ~ ocex-cli contract payback SampleContract
🌐 Connect to RPC node: ws://127.0.0.1:9944
📝 Contract:        0x693e2e72609187bd24930185e6884e745df59a6df007d5faff9b3db95c328882 <SampleContract> 
👤 Owner:           0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d <Alice> 
--------------------  
✨ Payback:          Successfully 
```

#### Transfer ownership
You can transfer ownership to another owner from you database (notice: the new owner should bу previously added to the DB).

``` bash
➜  ~ ocex-cli contract transfer_ownership SampleContract --owner=Bob
🌐 Connect to RPC node: ws://127.0.0.1:9944
Contract successfully transfered
id  name            🗒️ address                                                          🎈 published  👤 owner     🎟️ coupons (count)
--  --------------  ------------------------------------------------------------------  ------------  -----------  ------------------
1   SampleContract  0x693e2e72609187bd24930185e6884e745df59a6df007d5faff9b3db95c328882  Yes           id: 2 <Bob>  0 
```

### Coupons
You can add new coupons to the contract, activate them, check coupon's balance and burn.

#### Create
You can create coupons and add to the smart-contract.

``` bash
➜  ~ ocex-cli coupon create --amount=10 --unit=Unit --contract=SampleContract
🌐 Connect to RPC node: ws://127.0.0.1:9944
Coupon successfully created
id  name            🎟️ coupon public                                                    🎈 published  📝 contract             👤 owner   
--  --------------  ------------------------------------------------------------------  ------------  ----------------------  -----------
1   <not assigned>  0x3e7ea8de731b02a4428e06864809c54e777f99486f0cb3da3e4d58ec49eadd25  Yes           id: 1 <SampleContract>  id: 2 <Bob>
```

#### Update
You can update coupon alias name and secret key. This feature is just for testing purposes as it doesn't sync the new alias or the secret key with the contract. Can be blocked in product versions.

``` bash
➜  ~ ocex-cli coupon update 1 --name=SampleCoupon
Coupon successfully updated
id  name          🎟️ coupon public                                                    🎈 published
--  ------------  ------------------------------------------------------------------  ------------
1   SampleCoupon  0x3e7ea8de731b02a4428e06864809c54e777f99486f0cb3da3e4d58ec49eadd25  Yes  
```

#### Check
You can check coupon and get it's details

``` bash
➜  ~ ocex-cli coupon check SampleCoupon
🌐 Connect to RPC node: ws://127.0.0.1:9944
🎟️ Coupon:         0x3e7ea8de731b02a4428e06864809c54e777f99486f0cb3da3e4d58ec49eadd25 <SampleCoupon> 
📝 Contract:        0x693e2e72609187bd24930185e6884e745df59a6df007d5faff9b3db95c328882 <SampleContract> 
👤 Owner:           0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48 <Bob> 
--------------------  
🔎 Exists:          Yes 
🔥 Activated:       Not 
💰 Amount:          10 Unit (10000000000000 Pico) 
```

#### Activate
Coupon activation and transferring funds.

``` bash
➜  ~ ocex-cli coupon activate SampleCoupon --address=0x90b5ab205c6974c9ea841be688864633dc9ca8a357843eeacf2314649965fe22
🌐 Connect to RPC node: ws://127.0.0.1:9944
Coupon:             0x3e7ea8de731b02a4428e06864809c54e777f99486f0cb3da3e4d58ec49eadd25 <SampleCoupon> 
📝 Contract:        0x693e2e72609187bd24930185e6884e745df59a6df007d5faff9b3db95c328882 <SampleContract> 
👤 Owner:           0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48 <Bob> 
--------------------  
✨ Activated:        Yes, and funds transfered to '0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48'
```

#### Burn
An owner can burn a coupon. The coupon gets a "burnt" mark and releases reserved funds. A burnt coupon can not get reactivated. 

``` bash
➜  ~ ocex-cli coupon burn 2                                                  
🌐 Connect to RPC node: ws://127.0.0.1:9944
Coupon:             0x8887cbeecc45fabd92f07fc23f67ef1bbae471edbfa9a8637b8e637d5cf61959 <unnamed> 
📝 Contract:        0x693e2e72609187bd24930185e6884e745df59a6df007d5faff9b3db95c328882 <SampleContract> 
👤 Owner:           0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48 <Bob> 
--------------------  
🔥 Burned:          Yes 
```

#### List
List of all coupons.

``` bash
➜  ~ ocex-cli coupon list
id  name            🎟️ coupon public                                                    🎈 published  📝 contract             👤 owner   
--  --------------  ------------------------------------------------------------------  ------------  ----------------------  -----------
1   SampleCoupon    0x3e7ea8de731b02a4428e06864809c54e777f99486f0cb3da3e4d58ec49eadd25  Yes           id: 1 <SampleContract>  id: 2 <Bob>
2   <not assigned>  0x8887cbeecc45fabd92f07fc23f67ef1bbae471edbfa9a8637b8e637d5cf61959  Yes           id: 1 <SampleContract>  id: 2 <Bob>
```

#### Remove
Remove a coupon from the management tool DB.

``` bash
➜  ~ ocex-cli coupon remove SampleCoupon
Coupon successfully removed
id  name          🎟️ coupon public                                                    🎈 published
--  ------------  ------------------------------------------------------------------  ------------
1   SampleCoupon  0x3e7ea8de731b02a4428e06864809c54e777f99486f0cb3da3e4d58ec49eadd25  Yes         
```

## License
[Apache License 2.0](https://github.com/bsn-si/ocex-cli/blob/main/LICENSE) © Bela Supernova ([bsn.si](https://bsn.si))
