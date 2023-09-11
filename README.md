# Alfar linea

Project designed to manage linea accounts. It utilizes REALLY RANDOM transactions to simulate user activity on accounts. Each account comprises a `job` consisting of `steps`, which represent a list of `transactions`. 

1. A list of transactions (one step) consists of transactions sent to the blockchain by real users within a specific time frame. Approvals and swaps are completed in approximately 30 seconds for example. Step can currently consist of 1-3 transactions 
2. A list of steps (job) can be executed within hours. Activities may include swapping to USDC, then swapping to ETH, or adding and removing liquidity from a pool. Each block concludes by returning all tokens/liquidity to ETH.

**Use it at your own risk. The script was not tested on large volumes.**

Check for updated here: [alfar](https://t.me/+FozX3VZA0RIyNWY6)

Donate: `0xeb3F3e28F5c83FCaF28ccFC08429cCDD58Fd571D`

## Modes 
There are several modes available for the account manager (script runner) to use (some of them are currently disabled but will be implemented in the near future):
1. Job generator - the main script responsible for generating/executing transactions. 
2. Eth returner - this script swaps all tokens used by the main script to ETH and removes all liquidity. It serves as a backup in case errors occur in block mode.
3. Depositor - this mode facilitates deposits to linea accounts.
4. Checker - check your accounts analytics.
5. Config creator - used to create configuration files for different modes.

## Suggestions
1. Avoid modifying the **example** files. Instead, make copies of the files you need and customize them. Updates may be released in the future for example files.
2. Rather than downloading a zip file of the project, use the `git` command to install it (instructions below). Updates, including new blocks and modes, will be available in the near future, so it will be easier to stay up to date using the git command. 
3. You can create multiple configuration/private_keys/proxies files with different settings to run them in separate terminals.
4. Linea mainnet still throws some errors. It can suddenly stop. Don't use large volumes. The script was created to increase the number of transactions, not volume

## Installation

1. Install `Node.js` from the [official website](https://nodejs.org/en/download)
2. Install `yarn` by running the command `npm install -g yarn`
3. Install `git` from the [official website](https://git-scm.com/downloads)  
4. Clone the project using the terminal command `git clone https://github.com/alfar0x/alfar-linea.git`
5. Create a `.env` file in the root folder and provide variables using the example file `.env.example`:
    - `NODE_ENV` - simply set it to `prod` 
6. Run the `yarn` command in the project root to install dependencies

## Running
1. Create a file for private keys and place them in the `assets` folder
2. Create a file for proxies and add them to the `assets` folder (`host:port:username:password`)
3. Copy the required config file in the `config` folder (instructions on how to modify it are provided below)
4. Run `yarn start`
5. Select the desired mode and the corresponding config file

## Job generator
The block mode uses private keys, proxies (optional), and configurations to execute jobs. It generates jobs and executes them. Currently next blocks are available (they can cross each other open ocean swap eth -> usdc, send dmail, xy finance swap usdc -> eth for example):
1. dmail - send random email
1. syncswap - swap eth -> usdc -> eth
1. syncswap - swap eth -> cebusd -> eth
1. syncswap - swap eth -> wbtc -> eth
1. velocore - swap eth -> usdc -> eth
1. velocore - swap eth -> cebusd -> eth
1. open ocean - swap eth -> usdc -> eth
1. open ocean - swap eth -> iusd -> eth
1. open ocean - swap eth -> izi -> eth
1. open ocean - swap eth -> wavax -> eth
1. open ocean - swap eth -> wmatic -> eth
1. open ocean - swap eth -> wbnb -> eth
1. open ocean - swap eth -> cebusd -> eth
1. xy finance - swap eth -> cebusd -> eth
1. xy finance - swap eth -> usdc -> eth
1. xy finance - swap eth -> usdt -> eth
1. pancake - swap eth -> usdc -> eth
1. woofi - swap eth -> usdc -> eth
1. linea bank - supply eth -> redeem eth


### Config
There are two main block types: `fixed` and `dynamic`. The dynamic config block allows for real-time adjustments, such as changing the maximum Linea gas price if needed. To get started, copy the `config/block.example.json5` file, rename it as needed, and adjust the following values:
- `dynamic`:
    - `maxLineaGwei` - the maximum Linea Gwei limit. System will check it before each transaction
    - `minEthBalance` - minimum ETH balance on account to work with (generate job/start new block). To forcefully stop the script and complete all current blocks, set value to `100`. It will skip next blocks due to insufficient balance.
- `fixed`:
    - `delaySec`:
        - `step` - set the minimum and maximum step delay in seconds 
        - `transaction` - set the minimum and maximum transaction delay in seconds 
    - `files`:
        - `privateKeys` - specify the file name in the `assets` folder containing private keys
        - `proxies` - specify the file name in the `assets` folder containing proxies. Can be empty string for `none` proxy type
    - `isAccountsShuffle` - determine whether the private keys file should be shuffled (set to `true` or `false`)
    - `maxParallelAccounts` - set the maximum number of parallel accounts (see the run example below). If mobile proxy used it can be only 1 parallel account.
    - `providers` - specify the services to be used in this mode. All possible values are already defined in the example config file. To exclude certain blocks, simply comment them out (add `//` before the block ID). For example, the following lines in the config file mean that OPEN_OCEAN will be used while DMAIL won't be:
        ```
        "OPEN_OCEAN",
        // "DMAIL",
        ```
    - `proxy`: 
        - `type` - specify the type of proxy to be used, choosing from `none`/`mobile`/`server`. Currently only `none` type can be used.
        - `mobileIpChangeUrl` - if you want the system to use a mobile proxy, add it to your proxies file in one line and specify the rotation URL here
        - `serverIsRandom` - when using a server proxy, enable this option by setting it to `true` if you want the system to use a random proxy for each account. Setting it to `false` means that each account has its proxy, so the number of proxies must match the number of accounts.
    - `rpc`: 
        - `linea` - specify the linea RPC
    - `transactionsLimit` - set the minimum and maximum number of transactions generated for **each** account. Script will generate min limit between this values. It is not exact value will be performed. It will end jobs generation for account If in the end of the job limit will be reached. Otherwise new job will be generated  
    - `workingAmountPercent` - set the minimum and maximum working amount in percent

### Run example
Let's assume the following values were configured:
- Proxy type - none
- Maximum parallel accounts - 2
- Minimum/maximum step delay - 300/3600
- Minimum/maximum transaction delay - 30/240
- Minimum/maximum transactions limit - 2/10
- Added 4 accounts 

The system will generate 6 jobs. It will select a random job from the first 5 jobs in the generated list, then proceed to the next step and transaction. After executing a transaction, if there are more transactions within the step, it will sleep for 60-240 seconds before moving on. After completing the transactions in a step, it will sleep for 300-6000 seconds before next step in random job (account) and so on: 
```
acc1 (min tx limit = 8) - [step1,step2,step3]; <- working account
acc2 (min tx limit = 2) - [step1,step2]; <- working account
acc3 (min tx limit = 6) - [step1,step2];
acc4 (min tx limit = 5) - [step1,step2,step3,step4];

--- next iteration acc2 was run
acc1 (min tx limit = 8) - [step1,step2,step3]; <- working account
acc2 (min tx limit = 2) - [step2]; <- working account
acc3 (min tx limit = 6) - [step1,step2];
acc4 (min tx limit = 5) - [step1,step2,step3,step4];

--- next iteration acc1 was run
acc1 (min tx limit = 8) - [step2,step3]; <- working account
acc2 (min tx limit = 2) - [step2]; <- working account
acc3 (min tx limit = 6) - [step1,step2];
acc4 (min tx limit = 5) - [step1,step2,step3,step4];

--- next iteration acc1 was run
acc1 (min tx limit = 8) - [step3]; <- working account
acc2 (min tx limit = 2) - [step2]; <- working account
acc3 (min tx limit = 6) - [step1,step2];
acc4 (min tx limit = 5) - [step1,step2,step3,step4];

--- next iteration acc2 was run
acc1 (min tx limit = 8) - [step3]; <- working account
acc2 (min tx limit = 2) - []; <- working account. As soon as min transactions limit was reached it will be removed from jobs list.
acc3 (min tx limit = 6) - [step1,step2];
acc4 (min tx limit = 5) - [step1,step2,step3,step4];

--- next iteration acc3 was run
acc1 (min tx limit = 8) - [step3]; <- working account
acc3 (min tx limit = 6) - [step2]; <- working account
acc4 (min tx limit = 5) - [step1,step2,step3,step4];

--- next iteration acc1 was run
acc1 (min tx limit = 8) - [step4,step5,step6]; <- working account. Transactions was not reached. New steps were generated
acc3 (min tx limit = 6) - [step2]; <- working account
acc4 (min tx limit = 5) - [step1,step2,step3,step4];

and so on...
```

## Eth returner
**Disabled** for now until it is implemented

## Deposit
**Disabled** for now until it is implemented

## Checker
**Disabled** for now until it is implemented

## Config creator
**Disabled** for now until it is implemented. Please use the `config/*.example.json5` files for the time now.

## Additional Links:

Explore our scripts on our telegram channel [alfar](https://t.me/+FozX3VZA0RIyNWY6). Feel free to suggest improvements or engage in discussions at our chat (link in channel)
