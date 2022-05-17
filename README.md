> 💀 This is a **Work in Progress**.  
> Current status: Common PoC data storage and methods available. Partially tested.   
> **Use at your own risk**.

<h1 align="center">
    🎟️ ✨ OCEX CLI Client 🎁 👛
</h1>

OCEX smartcontract cli for interact with smartcontract.

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
After that you give access to `ocex-cli` command in you environment.
`Tested on MacOS & Linux`

```
git clone git@github.com:bsn-si/ocex-cli.git
cd ocex-cli/ && npm run install:global
```

## Before interact
Some operations need for node RPC. By default used `127.0.0.1:9944` for connect dev enviroment. For that you can install [substrate-contracts-node](https://github.com/paritytech/substrate-contracts-node).

## Usage
By default you can use `--help` for give info about all commands & options.

``` bash
➜  ~ ocex-cli 
Usage: ocex-cli [options] [command]

Tool for interact with ocex - manage contracts & coupons

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
Owners is users who interact with contracts and who pay for all transactions. And all contracts need assign to owner.

#### Create
You can add new owner from secret key, and also set alias name to simple use owner for other commands. As example for add default keyring `//Alice` account:

``` bash
➜  ~ ocex-cli owner create 0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a --name=Alice
Owner successfully created
id  name   🗒️ address                                                        
--  -----  ------------------------------------------------------------------
1   Alice  0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d
```

#### Update
You can update owner alias name, or secret key - but remebmer, its dangerous because all transactions for exists contracts will signed with this key.

``` bash
➜  ~ ocex-cli owner update Alice --name=Bob --secret=0x398f0c28f98885e046333d4a41c19cee4c37368a9832c6502f6cfd182e2aef89
Owner successfully updated
id  name  🗒️ address                                                        
--  ----  ------------------------------------------------------------------
1   Bob   0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48
```

#### Remove
Its dangerous operation, because with owner will be remove all related contract & coupons from database. Delete looks like:

``` bash
➜  ~ ocex-cli owner remove Bob
Owner successfully removed
id  name  🗒️ address                                                        
--  ----  ------------------------------------------------------------------
1   Bob   0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48
```

#### List
For see list of all owners.

``` bash
➜  ~ ocex-cli owner list
id  name   🗒️ address                                                          📝 contracts (count)
--  -----  ------------------------------------------------------------------  --------------------
1   Alice  0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d  1  
```

#### Balance
You can check current owner balance.

``` bash
➜  ~ ocex-cli owner balance Alice
🌐 Connect to RPC node: ws://127.0.0.1:9944
👤 Owner:           0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d <Alice> 
--------------------  
💰 Owner Balance:   1152921 Unit (1152921504606846976 Pico)
```

### Contracts
You can interact with ocex contracts instances, you can instantiate new contracts, and call all methods. All methods called & signed by related owner.

#### Create
You can create new contract, with preset exist contract address - or instantiate new. For instantiate new contract:

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
You can update contract alias name and address - but its dangerous operation, because required coupons may not published for another contract instance.

``` bash 
➜  ~ ocex-cli contract update SampleContract --name=MyContract
Contract successfully updated
id  name        🗒️ address                                                          🎈 published
--  ----------  ------------------------------------------------------------------  ------------
1   MyContract  0x903294b33d6b1dc6389cd7e52f4e3de1465090ab9f99c9edc36530957ab3cc94  Yes 
```

#### Remove
Its dangerous operation, because with contract will be remove all related coupons from database. Delete looks like:

``` bash
➜  ~ ocex-cli contract remove MyContract                      
Contract successfully removed
id  name        🗒️ address                                                          🎈 published  👤 owner       🎟️ coupons (count)
--  ----------  ------------------------------------------------------------------  ------------  -------------  ------------------
1   MyContract  0x903294b33d6b1dc6389cd7e52f4e3de1465090ab9f99c9edc36530957ab3cc94  Yes           id: 1 <Alice>  0
```

#### List
List all contracts

``` bash
➜  ~ ocex-cli contract list
id  name            🗒️ address                                                          🎈 published  👤 owner       🎟️ coupons (count)
--  --------------  ------------------------------------------------------------------  ------------  -------------  ------------------
1   SampleContract  0x693e2e72609187bd24930185e6884e745df59a6df007d5faff9b3db95c328882  Yes           id: 1 <Alice>  0       
```

#### Fill balance
For interact with you contract and add coupons - you need fill balance. With this command you fill contract balance from their owner funds. 

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
For check contract balance

``` bash
➜  ~ ocex-cli contract balance SampleContract                         
🌐 Connect to RPC node: ws://127.0.0.1:9944
📝 Contract:        0x693e2e72609187bd24930185e6884e745df59a6df007d5faff9b3db95c328882 <SampleContract> 
👤 Owner:           0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d <Alice> 
--------------------  
💰 Contract Balance: 100 Unit (100000000000000 Pico) 
```

#### Payback
You can payback not reserved funds from you contract.

``` bash
➜  ~ ocex-cli contract payback SampleContract
🌐 Connect to RPC node: ws://127.0.0.1:9944
📝 Contract:        0x693e2e72609187bd24930185e6884e745df59a6df007d5faff9b3db95c328882 <SampleContract> 
👤 Owner:           0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d <Alice> 
--------------------  
✨ Payback:          Successfully 
```

#### Transfer ownership
You can transfer ownership to another owner from you database. At now you can`t transfer ownership to another users not from cli db.

``` bash
➜  ~ ocex-cli contract transfer_ownership SampleContract --owner=Bob
🌐 Connect to RPC node: ws://127.0.0.1:9944
Contract successfully transfered
id  name            🗒️ address                                                          🎈 published  👤 owner     🎟️ coupons (count)
--  --------------  ------------------------------------------------------------------  ------------  -----------  ------------------
1   SampleContract  0x693e2e72609187bd24930185e6884e745df59a6df007d5faff9b3db95c328882  Yes           id: 2 <Bob>  0 
```

### Coupons
Interact with contract coupons, you can add new, check its, burn, and activate that.

#### Create
You can create coupons and add to blockchain store.

``` bash
➜  ~ ocex-cli coupon create --amount=10 --unit=Unit --contract=SampleContract
🌐 Connect to RPC node: ws://127.0.0.1:9944
Coupon successfully created
id  name            🎟️ coupon public                                                    🎈 published  📝 contract             👤 owner   
--  --------------  ------------------------------------------------------------------  ------------  ----------------------  -----------
1   <not assigned>  0x3e7ea8de731b02a4428e06864809c54e777f99486f0cb3da3e4d58ec49eadd25  Yes           id: 1 <SampleContract>  id: 2 <Bob>
```

#### Update
You can update coupon alias name and secret key, but its dangerous because not be sync with contract.

``` bash
➜  ~ ocex-cli coupon update 1 --name=SampleCoupon
Coupon successfully updated
id  name          🎟️ coupon public                                                    🎈 published
--  ------------  ------------------------------------------------------------------  ------------
1   SampleCoupon  0x3e7ea8de731b02a4428e06864809c54e777f99486f0cb3da3e4d58ec49eadd25  Yes  
```

#### Check
You can check coupon, and give common details

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
You can activate coupon, and give funds or enter receiver.

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
You can burn coupon, after that this mark as burned, and free reserved funds. After that nobody can activate this coupon. 

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
List all coupons.

``` bash
➜  ~ ocex-cli coupon list
id  name            🎟️ coupon public                                                    🎈 published  📝 contract             👤 owner   
--  --------------  ------------------------------------------------------------------  ------------  ----------------------  -----------
1   SampleCoupon    0x3e7ea8de731b02a4428e06864809c54e777f99486f0cb3da3e4d58ec49eadd25  Yes           id: 1 <SampleContract>  id: 2 <Bob>
2   <not assigned>  0x8887cbeecc45fabd92f07fc23f67ef1bbae471edbfa9a8637b8e637d5cf61959  Yes           id: 1 <SampleContract>  id: 2 <Bob>
```

#### Remove
Remove coupon from database.

``` bash
➜  ~ ocex-cli coupon remove SampleCoupon
Coupon successfully removed
id  name          🎟️ coupon public                                                    🎈 published
--  ------------  ------------------------------------------------------------------  ------------
1   SampleCoupon  0x3e7ea8de731b02a4428e06864809c54e777f99486f0cb3da3e4d58ec49eadd25  Yes         
```

## License
[Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/) © Bela Supernova ([bsn.si](https://bsn.si))
