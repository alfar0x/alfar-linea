[![Typing SVG](https://readme-typing-svg.demolab.com/?font=Fira+Code&size=50&pause=1000&vCenter=true&width=350&height=80&lines=alfar-linea&color=2a9d8f)](https://git.io/typing-svg)

Project designed to manage linea accounts. It utilizes REALLY RANDOM transactions to simulate user activity on accounts. Each account comprises a `job` consisting of `steps`, which represent a list of `transactions`.

1. A list of transactions (one step) consists of transactions sent to the blockchain by real users within a specific time frame. Approvals and swaps are completed in approximately 30 seconds for example. Step can currently consist of 1-3 transactions 
2. A list of steps (job) can be executed by real users within hours/days. Activities may include swapping ETH to USDC, then swapping back, or adding liquidity to a pool than removing it. Each job concludes by returning all tokens/liquidity to ETH.

**Use it at your own risk. The script was not tested on large volumes.**

Check for updates here: [alfar](https://t.me/+FozX3VZA0RIyNWY6)

Donate: `0xeb3F3e28F5c83FCaF28ccFC08429cCDD58Fd571D`

![console screenshot](./img/screenshot.png)

 <details>
    <summary> Click here to see all current possible blocks (if all providers turned on) </summary>

    Swap eth -> token -> eth: 55
    OPEN_OCEAN_SWAP_ETH_IUSD -> OPEN_OCEAN_SWAP_IUSD_ETH
    OPEN_OCEAN_SWAP_ETH_IZI -> OPEN_OCEAN_SWAP_IZI_ETH
    OPEN_OCEAN_SWAP_ETH_USDC -> OPEN_OCEAN_SWAP_USDC_ETH
    OPEN_OCEAN_SWAP_ETH_USDC -> PANCAKE_SWAP_USDC_ETH
    OPEN_OCEAN_SWAP_ETH_USDC -> SYNCSWAP_SWAP_USDC_ETH
    OPEN_OCEAN_SWAP_ETH_USDC -> VELOCORE_SWAP_USDC_ETH
    OPEN_OCEAN_SWAP_ETH_USDC -> WOOFI_SWAP_USDC_ETH
    OPEN_OCEAN_SWAP_ETH_USDC -> XY_FINANCE_SWAP_USDC_ETH
    OPEN_OCEAN_SWAP_ETH_WBTC -> OPEN_OCEAN_SWAP_WBTC_ETH
    OPEN_OCEAN_SWAP_ETH_WBTC -> SYNCSWAP_SWAP_WBTC_ETH
    OPEN_OCEAN_SWAP_ETH_wAVAX -> OPEN_OCEAN_SWAP_wAVAX_ETH
    OPEN_OCEAN_SWAP_ETH_wBNB -> OPEN_OCEAN_SWAP_wBNB_ETH
    OPEN_OCEAN_SWAP_ETH_wMATIC -> OPEN_OCEAN_SWAP_wMATIC_ETH
    PANCAKE_SWAP_ETH_USDC -> OPEN_OCEAN_SWAP_USDC_ETH
    PANCAKE_SWAP_ETH_USDC -> PANCAKE_SWAP_USDC_ETH
    PANCAKE_SWAP_ETH_USDC -> SYNCSWAP_SWAP_USDC_ETH
    PANCAKE_SWAP_ETH_USDC -> VELOCORE_SWAP_USDC_ETH
    PANCAKE_SWAP_ETH_USDC -> WOOFI_SWAP_USDC_ETH
    PANCAKE_SWAP_ETH_USDC -> XY_FINANCE_SWAP_USDC_ETH
    SYNCSWAP_SWAP_ETH_USDC -> OPEN_OCEAN_SWAP_USDC_ETH
    SYNCSWAP_SWAP_ETH_USDC -> PANCAKE_SWAP_USDC_ETH
    SYNCSWAP_SWAP_ETH_USDC -> SYNCSWAP_SWAP_USDC_ETH
    SYNCSWAP_SWAP_ETH_USDC -> VELOCORE_SWAP_USDC_ETH
    SYNCSWAP_SWAP_ETH_USDC -> WOOFI_SWAP_USDC_ETH
    SYNCSWAP_SWAP_ETH_USDC -> XY_FINANCE_SWAP_USDC_ETH
    SYNCSWAP_SWAP_ETH_WBTC -> OPEN_OCEAN_SWAP_WBTC_ETH
    SYNCSWAP_SWAP_ETH_WBTC -> SYNCSWAP_SWAP_WBTC_ETH
    SYNCSWAP_SWAP_ETH_ceBUSD -> SYNCSWAP_SWAP_ceBUSD_ETH
    SYNCSWAP_SWAP_ETH_ceBUSD -> VELOCORE_SWAP_ceBUSD_ETH
    SYNCSWAP_SWAP_ETH_ceBUSD -> XY_FINANCE_SWAP_ceBUSD_ETH
    VELOCORE_SWAP_ETH_USDC -> OPEN_OCEAN_SWAP_USDC_ETH
    VELOCORE_SWAP_ETH_USDC -> PANCAKE_SWAP_USDC_ETH
    VELOCORE_SWAP_ETH_USDC -> SYNCSWAP_SWAP_USDC_ETH
    VELOCORE_SWAP_ETH_USDC -> VELOCORE_SWAP_USDC_ETH
    VELOCORE_SWAP_ETH_USDC -> WOOFI_SWAP_USDC_ETH
    VELOCORE_SWAP_ETH_USDC -> XY_FINANCE_SWAP_USDC_ETH
    VELOCORE_SWAP_ETH_ceBUSD -> SYNCSWAP_SWAP_ceBUSD_ETH
    VELOCORE_SWAP_ETH_ceBUSD -> VELOCORE_SWAP_ceBUSD_ETH
    VELOCORE_SWAP_ETH_ceBUSD -> XY_FINANCE_SWAP_ceBUSD_ETH
    WOOFI_SWAP_ETH_USDC -> OPEN_OCEAN_SWAP_USDC_ETH
    WOOFI_SWAP_ETH_USDC -> PANCAKE_SWAP_USDC_ETH
    WOOFI_SWAP_ETH_USDC -> SYNCSWAP_SWAP_USDC_ETH
    WOOFI_SWAP_ETH_USDC -> VELOCORE_SWAP_USDC_ETH
    WOOFI_SWAP_ETH_USDC -> WOOFI_SWAP_USDC_ETH
    WOOFI_SWAP_ETH_USDC -> XY_FINANCE_SWAP_USDC_ETH
    XY_FINANCE_SWAP_ETH_USDC -> OPEN_OCEAN_SWAP_USDC_ETH
    XY_FINANCE_SWAP_ETH_USDC -> PANCAKE_SWAP_USDC_ETH
    XY_FINANCE_SWAP_ETH_USDC -> SYNCSWAP_SWAP_USDC_ETH
    XY_FINANCE_SWAP_ETH_USDC -> VELOCORE_SWAP_USDC_ETH
    XY_FINANCE_SWAP_ETH_USDC -> WOOFI_SWAP_USDC_ETH
    XY_FINANCE_SWAP_ETH_USDC -> XY_FINANCE_SWAP_USDC_ETH
    XY_FINANCE_SWAP_ETH_USDT -> XY_FINANCE_SWAP_USDT_ETH
    XY_FINANCE_SWAP_ETH_ceBUSD -> SYNCSWAP_SWAP_ceBUSD_ETH
    XY_FINANCE_SWAP_ETH_ceBUSD -> VELOCORE_SWAP_ceBUSD_ETH
    XY_FINANCE_SWAP_ETH_ceBUSD -> XY_FINANCE_SWAP_ceBUSD_ETH

    Supply -> redeem eth: 1
    LINEA_BANK_SUPPLY_ETH

    Swap eth -> token -> supply -> redeem -> eth: 40
    OPEN_OCEAN_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> OPEN_OCEAN_SWAP_USDC_ETH
    OPEN_OCEAN_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> PANCAKE_SWAP_USDC_ETH
    OPEN_OCEAN_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> SYNCSWAP_SWAP_USDC_ETH
    OPEN_OCEAN_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> VELOCORE_SWAP_USDC_ETH
    OPEN_OCEAN_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> WOOFI_SWAP_USDC_ETH
    OPEN_OCEAN_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> XY_FINANCE_SWAP_USDC_ETH
    OPEN_OCEAN_SWAP_ETH_WBTC -> LINEA_BANK_SUPPLY_WBTC -> OPEN_OCEAN_SWAP_WBTC_ETH
    OPEN_OCEAN_SWAP_ETH_WBTC -> LINEA_BANK_SUPPLY_WBTC -> SYNCSWAP_SWAP_WBTC_ETH
    PANCAKE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> OPEN_OCEAN_SWAP_USDC_ETH
    PANCAKE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> PANCAKE_SWAP_USDC_ETH
    PANCAKE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> SYNCSWAP_SWAP_USDC_ETH
    PANCAKE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> VELOCORE_SWAP_USDC_ETH
    PANCAKE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> WOOFI_SWAP_USDC_ETH
    PANCAKE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> XY_FINANCE_SWAP_USDC_ETH
    SYNCSWAP_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> OPEN_OCEAN_SWAP_USDC_ETH
    SYNCSWAP_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> PANCAKE_SWAP_USDC_ETH
    SYNCSWAP_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> SYNCSWAP_SWAP_USDC_ETH
    SYNCSWAP_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> VELOCORE_SWAP_USDC_ETH
    SYNCSWAP_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> WOOFI_SWAP_USDC_ETH
    SYNCSWAP_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> XY_FINANCE_SWAP_USDC_ETH
    SYNCSWAP_SWAP_ETH_WBTC -> LINEA_BANK_SUPPLY_WBTC -> OPEN_OCEAN_SWAP_WBTC_ETH
    SYNCSWAP_SWAP_ETH_WBTC -> LINEA_BANK_SUPPLY_WBTC -> SYNCSWAP_SWAP_WBTC_ETH
    VELOCORE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> OPEN_OCEAN_SWAP_USDC_ETH
    VELOCORE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> PANCAKE_SWAP_USDC_ETH
    VELOCORE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> SYNCSWAP_SWAP_USDC_ETH
    VELOCORE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> VELOCORE_SWAP_USDC_ETH
    VELOCORE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> WOOFI_SWAP_USDC_ETH
    VELOCORE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> XY_FINANCE_SWAP_USDC_ETH
    WOOFI_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> OPEN_OCEAN_SWAP_USDC_ETH
    WOOFI_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> PANCAKE_SWAP_USDC_ETH
    WOOFI_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> SYNCSWAP_SWAP_USDC_ETH
    WOOFI_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> VELOCORE_SWAP_USDC_ETH
    WOOFI_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> WOOFI_SWAP_USDC_ETH
    WOOFI_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> XY_FINANCE_SWAP_USDC_ETH
    XY_FINANCE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> OPEN_OCEAN_SWAP_USDC_ETH
    XY_FINANCE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> PANCAKE_SWAP_USDC_ETH
    XY_FINANCE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> SYNCSWAP_SWAP_USDC_ETH
    XY_FINANCE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> VELOCORE_SWAP_USDC_ETH
    XY_FINANCE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> WOOFI_SWAP_USDC_ETH
    XY_FINANCE_SWAP_ETH_USDC -> LINEA_BANK_SUPPLY_USDC -> XY_FINANCE_SWAP_USDC_ETH

    Random blocks: 1
    DMAIL_SEND_MAIL
</details>

## Modes 
There are several modes available:
- Job generator - the main script responsible for generating/executing transactions. 
- Eth returner - this script swaps all tokens used by the main script to ETH and removes all liquidity. It serves as a backup in case errors occur in jobs generator mode.
- Depositor - this mode facilitates deposits to linea accounts.
- Checker - check your accounts analytics.

## Suggestions
- Avoid modifying the **example** files. Instead, make copies of the files you need and customize them. Updates may be released in the future for example files.
- Rather than downloading a zip file of the project, use the `git` command to install it (instructions below). Updates, including new providers and modes, will be available in the near future, so it will be easier to stay up to date using the git command. 
- You can create multiple configuration/private_keys/proxies files with different settings to run them in separate terminals.
- Linea mainnet still throws some errors. It can suddenly stop. Don't use large volumes. The script was created to increase the number of transactions, not volume

## Installation

1. Install `Node.js` from the [official website](https://nodejs.org/en/download)
1. Install `git` from the [official website](https://git-scm.com/downloads)  
1. Install `yarn` using `npm install -g yarn` command
1. Clone the project using the terminal command `git clone https://github.com/alfar0x/alfar-linea.git`
1. Create a `.env` file in the root folder and provide variables using the example file `.env.example`:
    - `NODE_ENV` - simply set it to `prod` 
1. Run the `yarn install` command in the project root to install dependencies

## Running
1. Create a file for private keys and place them in the `assets` folder
2. Create a file for proxies and add them to the `assets` folder (`host:port:username:password`)
3. Copy the required config file in the `config` folder (instructions on how to modify it are provided below)
4. Run `yarn start`
5. Select the desired mode and the corresponding config file

## Job generator
The job generator mode uses private keys, proxies (optional), and configurations to execute jobs. It generates jobs and executes them.

### Config
There are two main block types: `fixed` and `dynamic`. The `dynamic` config block allows for real-time adjustments, such as changing the maximum Linea gas price if needed. Values can be changed during program run. To get started, copy the `config/block.example.json5` file, rename it as needed, and adjust the following values:
- `dynamic`:
    - `maxLineaGwei` - the maximum Linea Gwei limit. System will check it before each transaction
    - `minEthBalance` - minimum ETH balance on account to work with (generate job/start new block). To forcefully stop the script and complete all current steps, set value to `100`. It will skip next blocks due to insufficient balance.
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

<details>
    <summary>Run example</summary>

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
acc3 (min tx limit = 6) - []; <- steps are not generated yet because of max accounts is 2
acc4 (min tx limit = 5) - []; <- steps are not generated yet

--- next iteration acc2 was run
acc1 (min tx limit = 8) - [step1,step2,step3]; <- working account
acc2 (min tx limit = 2) - [step2]; <- working account
acc3 (min tx limit = 6) - [];
acc4 (min tx limit = 5) - [];

--- next iteration acc1 was run
acc1 (min tx limit = 8) - [step2,step3]; <- working account
acc2 (min tx limit = 2) - [step2]; <- working account
acc3 (min tx limit = 6) - [];
acc4 (min tx limit = 5) - [];

--- next iteration acc1 was run
acc1 (min tx limit = 8) - [step3]; <- working account
acc2 (min tx limit = 2) - [step2]; <- working account
acc3 (min tx limit = 6) - [];
acc4 (min tx limit = 5) - [];

--- next iteration acc2 was run
acc1 (min tx limit = 8) - [step3]; <- working account
acc2 (min tx limit = 2) - []; <- working account. As soon as min transactions limit was reached it will be removed from jobs list.
acc3 (min tx limit = 6) - [step1,step2]; <- new account steps was generated
acc4 (min tx limit = 5) - [];

--- next iteration acc3 was run
acc1 (min tx limit = 8) - [step3]; <- working account
acc3 (min tx limit = 6) - [step2]; <- working account
acc4 (min tx limit = 5) - [];

--- next iteration acc1 was run
acc1 (min tx limit = 8) - [step4,step5,step6]; <- working account. Min transactions limit was not reached. New steps were generated
acc3 (min tx limit = 6) - [step2]; <- working account
acc4 (min tx limit = 5) - [];

and so on...
```

</details>

## Eth returner
**Disabled** for now until it is implemented

## Deposit
**Disabled** for now until it is implemented

## Checker
Check accounts nonce and tokens that are used by script. Copy `config/checker.example.json5` to create config (rename it if needed): 
- `dynamic` - just empty block
- `fixed`:
    - `files`:
        - `addresses` - specify the file name in the `assets` folder containing addresses
        - `privateKeys` - specify the file name in the `assets` folder containing private keys. Either privateKeys or addresses must be filled in.
        - `proxies` - specify the file name in the `assets` folder containing proxies. Can be empty string for `none` proxy type
    - `maxParallelAccounts` - set the maximum number of parallel accounts (see the run example below). If mobile proxy used it can be only 1 parallel account.
    - `delayBetweenChunkSec` - set delay between parallel accounts requests
    - `hideBalanceLessThanUsd` - set usd value of token that can be hidden. Set `-1` to see all tokens. 
    - `proxy`: 
        - `type` - specify the type of proxy to be used, choosing from `none`/`mobile`/`server`. Currently only `none` type can be used.
        - `mobileIpChangeUrl` - if you want the system to use a mobile proxy, add it to your proxies file in one line and specify the rotation URL here
        - `serverIsRandom` - when using a server proxy, enable this option by setting it to `true` if you want the system to use a random proxy for each account. Setting it to `false` means that each account has its proxy, so the number of proxies must match the number of accounts.
    - `rpc`: 
        - `linea` - specify the linea RPC

## Additional Links:

Explore our scripts on our telegram channel [alfar](https://t.me/+FozX3VZA0RIyNWY6). Feel free to suggest improvements or engage in discussions at our chat (link in channel)
