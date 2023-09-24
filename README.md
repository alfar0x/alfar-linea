[![Typing SVG](https://readme-typing-svg.demolab.com/?font=Fira+Code&size=50&pause=1000&vCenter=true&width=350&height=80&lines=alfar-linea&color=2a9d8f)](https://git.io/typing-svg)

This software is designed to manage Linea accounts by simulating user activity through random transactions.

## Overview

**_It is crucial to read the instructions carefully to fully understand how the software works before running it._**

### Main Features:

- **Simple Setup**: Get started easily without hassle.
- **Wide Interaction**: Engage with various services like syncswap, velocore, dmail, open ocean, xy finance, pancake, woofi, linea bank and more.
- **Dynamic Gas Limit**: Adjust the gas limit on the fly during the program execution.
- **Service Selection**: Choose which services to work with.
- **Multi-terminal Operation**: Operate in several terminals with different settings/accounts.
- **Blockchain Information Collection**: Collect token balances and transaction numbers for accounts from the blockchain.
- **Enhanced Security**: Encrypt private keys, proxies, and addresses with a password for server use.
- **True Randomization**: Enjoy automatic and truly randomized transaction paths through different services.
- **Proxy Use**: Utilize mobile/server proxies for operations.

**_Note: The Linea mainnet may occasionally encounter errors and cease to function unexpectedly. It's advised to avoid making large transactions using this software, as it primarily aims to increase the transaction count. It is considered safe to add $20 to an account and set the working volume to 1-7%._**

## How It Works

In the main mode `task-runner`, the software creates a `task` for each account, comprising various `steps`, which in turn consist of a list of `transactions`.

### Transaction Workflow:

1. **Step**: Represents transactions sent by real users within 1-2 minutes (e.g., `[approve -> swap]`). Each step can currently include 1-3 transactions.
2. **Task**: Encompasses steps executable by real users within hours/days (e.g., `[swap ETH to USDC] --> [approve USDC -> add USDC to liquidity pool] --> [remove liquidity] --> [approve USDC -> swap to ETH]`). Here, 1 task = 4 steps = 6 transactions. Each task concludes by returning all tokens/liquidity to ETH.

Check for updates here: [alfar](https://t.me/+FozX3VZA0RIyNWY6)

Donate: `0xeb3F3e28F5c83FCaF28ccFC08429cCDD58Fd571D`

![Console Screenshot](./img/screenshot.png)

<details>
  <summary> Click here to see all current possible tasks (if all providers are turned on) </summary>

```
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

Random: 1
DMAIL_SEND_MAIL
```

</details>

## Table of Contents

- [Modes](#modes)
- [Suggestions](#suggestions)
- [Installation](#installation)
- [Task Runner](#task-runner)
  - [Create Files](#create-files)
  - [Config](#config)
  - [Available Commands](#available-commands)
  - [Example](#example)
- [Checker](#checker)
  - [Create Files](#create-files-1)
  - [Config](#config-1)
- [Encrypter](#encrypter)
  - [Create Files](#create-files-2)
  - [Config](#config-2)
- [Eth Returner](#eth-returner)
- [Depositor](#depositor)
- [Running](#running)
- [Additional Links](#additional-links)

## Modes

- **Task Runner:** The core script for generating and executing transactions.
- **Checker:** Use this to see your accounts' details like transactions and balances.
- **Encrypter:** Use this to make your asset files (private keys, addresses, proxies) safe for using the Task Runner on a server.
- **Eth Returner:** This part changes all tokens used by the main script back to ETH and takes out all liquidity. This is a backup in case there are errors in the Task Runner mode.
- **Depositor:** This part makes it easy to put deposits into Linea accounts.

## Suggestions

- Don't change the **example** files. Make copies of the files you need and change those copies. There may be updates in the future for example files.
- Instead of downloading a zip file of the software, use the `git` command to install it. This way, it will be easier to get updates in the future. Instructions for using `git` are given below.
- You can make many configuration, private key, or proxy files with different settings to use them in different terminals.
- Be careful with the Linea mainnet. It can have errors or stop suddenly. Keep volumes low. The software is made to increase the number of transactions, not the volume.
- If you want to use the software on a server, you can make any file in the `assets` folder safe using the Encrypter mode on your own computer. Then, move the safe file to the server.
- If you get some critical/unexpected errors please contact developer in [chat](https://t.me/+VdlGPwVJx11mMTZi)

## Installation

[Watch this quick install video for help](https://www.loom.com/share/fbb6b2c7ca0c40cd87c89d4b90523316)

### Follow these steps to install:

1. **Download and Install Node.js:**
  - Go to the [Node.js website](https://nodejs.org/en/download) and download Node.js.

2. **Download and Install Git:**
  - Go to the [Git website](https://git-scm.com/downloads) and download Git.
  - Install it and keep all the options as they are.

3. **Open a Command Terminal:**
  - For Windows: 
    - Hold the Shift key and right-click in the folder where you want the software.
    - Choose "Open PowerShell window here."
  - For macOS:
    - Press Command + Space to search.
    - Type "Terminal" and press Enter.
    - In the Terminal, type `cd` and the path to your folder. Like this: 
      ```bash
      cd ~/Desktop/alfar-linea
      ```
    - Press Enter.

4. **Type these Commands:**
  - In the command terminal, type and enter these commands one by one:
    ```bash
    npm install -g yarn
    git clone https://github.com/alfar0x/alfar-linea.git
    cd alfar-linea
    yarn install
    ```
  - Windows note: If you see an error, type this command and try `yarn install` again:
    ```bash
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted
    ```
    [More help here](https://stackoverflow.com/a/49112322)

5. **Open the Software Folder:**
  - Go to the software folder in your files.

6. **Make a Copy of a File:**
  - Find the `.env.example` file.
  - Make a copy and name it `.env.prod`.
  
## Task Runner

[Quick setup video](https://www.loom.com/share/722b554afdbd44f991d7be15b79d6248)

Execute tasks efficiently using the Task Runner mode, leveraging private keys, optional proxies, and configurations. It not only generates tasks but also ensures their smooth execution.

### Create Files

Before embarking on the first run, ensure the creation of essential files:

1. **Navigate to the `assets` folder**:
  - Generate a file for private keys (e.g., `private_keys.txt`). Enter each private key on a separate line. Acceptable formats include both with and without `0x`. Optionally, designate the account name following the private key, separated by a semicolon (`;`). For instance: `0xaaaaa;account_name`. Absence of a name defaults to using the short address.
  - Optionally, if utilizing a proxy, establish a file (e.g., `proxies.txt`) and populate with proxy data in this format: `host:port:username:password`.
  - **Note**: Opt for the [Encrypter](#encrypter) mode to encrypt any file within the `assets` folder.

2. **Access the `config` folder**:
  - Duplicate the necessary config file (e.g., `tasks.example.json5`) for this mode. Guidance for modifications is detailed below.
   
## Config

The configuration is categorized into two primary sections: `dynamic` and `fixed`.

### Dynamic Configuration Values

The `dynamic` block contains values that can be altered in real-time during program execution. It includes the following fields:

- `delaySec`: Manages delays in two areas:
  - `step`: Determines the minimum and maximum delay, in seconds, between steps (minimum value is 20 seconds).
  - `transaction`: Sets the minimum and maximum delay, in seconds, between transactions (minimum value is 60 seconds).
- `maxLineaGwei`: Specifies the upper limit for Linea Gwei. The system verifies this limit before executing each transaction.
- `maxParallelAccounts`: Designates the highest number of accounts that can operate concurrently.
- `maxTxFeeUsd`: Establishes the maximum permissible transaction cost in USD for gas fees. If the cost exceeds this value, an error is triggered, and the ongoing account task steps are terminated. If you're not concerned about the transaction cost, set this value to `100` so system will then ignore this setting until the transaction cost reaches $100.
- `minEthBalance`: Indicates the minimum ETH balance required in the account for start task. To halt the script abruptly, assign a value of `100`.

### Fixed Configuration Values

The `fixed` block encompasses static configuration details including:

- `files`: Ensure the filenames within the `assets` folder are correctly formatted (e.g., `private_keys.txt` is correct, `private_keys` is not). Include the following:
  - `privateKeys`: Denote the filename in the `assets` folder containing private keys.
  - `proxies`: Designate the filename in the `assets` folder holding proxies. It can be an empty string for `none` proxy type.
- `isAccountsShuffle`: A boolean value (`true` or `false`) determining whether to shuffle the private keys file.
- `isCheckBalanceOnStart`: A boolean value deciding whether to examine the balance before the onset of work, based on `minEthBalance`. Note: balances will be checked before each task in any case.
- `isShuffleAccountOnStepsEnd`: This is a boolean parameter (`true` or `false`). When set to `true`, it ensures that an account that has completed its current task is placed back in a random position within the queue for further tasks. This setting can be useful for running the program indefinitely, especially when a high number of transactions (`transactionsLimit`) is specified. 

  By enabling this setting, after the completion of the current task for an account, the account is moved to a random position in the queue. If there are many accounts, this account might have to wait for a significant time before being assigned a new task, allowing the system to naturally create new tasks over time. 

  Caution: When this setting is enabled (`true`), the opportunity for each account to start decreases. Even with high frequency and time delay, some accounts may not initiate at all, as they are continuously being moved within the queue. Use it after all accounts transactions is 

- `providers`: List the service providers for this mode. To omit specific blocks, comment them out in the configuration file. For example, the following lines in the config file mean that OPEN_OCEAN will be used while DMAIL won't be:
  ```json
  "OPEN_OCEAN",
  // "DMAIL",
  ```
- `proxy`: Includes proxy settings such as:
  - `type`: Determines the proxy type (`none`, `mobile`, or `server`). Currently, only `none` type is operable.
  - `mobileIpChangeUrl`: If using a mobile proxy, specify the rotation URL here.
  - `serverIsRandom`: This configuration option is a boolean setting (`true` or `false`) associated with the use of server proxies. 
    - When set to `true`, the system will allocate a random proxy from your proxy list to each account for every task. This setting ensures that the same account does not use the same proxy repeatedly, enhancing anonymity and reducing the likelihood of the account getting flagged or banned by networks or services due to consistent access from the same proxy. But you can use 10 proxies for 50 accounts for example.
    - If set to `false`, each account will be assigned a dedicated proxy from the proxy list, and will use this same proxy for all its operations and transactions. In this configuration, the number of proxies in your proxy list should be equal to or more than the number of accounts to ensure each account has a proxy assigned to it.
    This configuration setting allows users to manage the proxy allocation strategy for accounts, providing a balance between anonymity and consistent proxy assignment.
- `rpc`: Holds the Linea RPC details in the `linea` field.
- `transactionsLimit`: This setting controls the minimum and maximum number of transactions that will be generated for each account. 
  - The value is set as a range (e.g., `1-5`). 
  - The system will randomly select a limit within this range for each account. For example, if the `transactionsLimit` is set to `3-5`, one account might have a limit of 4 transactions, while another might have a limit of 5.
  - This limit represents the total number of transactions an account will perform before it stops generating new tasks. If this limit is reached, the account will not generate any more tasks. If the limit is not reached, a new task will be created for the account, ensuring that the account continues to operate until it hits the transaction limit.
  
  The `transactionsLimit` configuration provides control over the workload allocated to each account, allowing for balanced distribution and preventing overuse of individual accounts.
- `workingAmountPercent`: Set the minimum and maximum working amount in percentage.

Ensure your config and assets files are prepared, then proceed to run the script as outlined [below](#running).

### Available Commands

During this mode you can write commands directly in terminal:
- **status**: check current tasks
- **exit**: force stop program

### Example

<details>
  <summary>Click here to see a run example</summary>

Assume the following configurations are set:

- **Maximum Parallel Accounts**: 2
- **Minimum/Maximum Step Delay**: 300/3600 seconds
- **Minimum/Maximum Transaction Delay**: 30/240 seconds
- **Minimum/Maximum Transactions Limit**: 2/10
- **Total Accounts Added**: 4 
- **isShuffleAccountOnStepsEnd**: false

Given these settings, the system will initially generate tasks for the first two accounts.

**First Iteration:**
- acc1 (min tx limit = 8) - [step1, step2, step3]; (working account)
- acc2 (min tx limit = 2) - [step1, step2]; (working account)
- acc3 (min tx limit = 6) - []; (waiting)
- acc4 (min tx limit = 5) - []; (waiting)

**Next Iteration (acc2 was run):**
- acc1 (min tx limit = 8) - [step1, step2, step3]; (working account)
- acc2 (min tx limit = 2) - [step2]; (working account)
- acc3 (min tx limit = 6) - []; (waiting)
- acc4 (min tx limit = 5) - []; (waiting)

**Next Iteration (acc1 was run):**
- acc1 (min tx limit = 8) - [step2, step3]; (working account)
- acc2 (min tx limit = 2) - [step2]; (working account)
- acc3 (min tx limit = 6) - []; (waiting)
- acc4 (min tx limit = 5) - []; (waiting)

**Next Iteration (acc2 was run):**
- acc1 (min tx limit = 8) - [step3]; (working account)
- acc2 (min tx limit = 2) - []; (done, removed from queue)
- acc3 (min tx limit = 6) - [step1, step2]; (new working account)
- acc4 (min tx limit = 5) - []; (waiting)

**Next Iteration (acc1 was run):**
- acc1 (min tx limit = 8) - [step3]; (working account)
- acc3 (min tx limit = 6) - [step2]; (working account)
- acc4 (min tx limit = 5) - []; (waiting)

**Next Iteration (acc1 was run):**
- acc1 (min tx limit = 8) - [step4, step5, step6]; (new steps generated, working account)
- acc3 (min tx limit = 6) - [step2]; (working account)
- acc4 (min tx limit = 5) - []; (waiting)

...and so on. The process continues to cycle through the accounts, executing steps and transactions, generating new steps as needed, and introducing new accounts into the task list as others complete their minimum transaction limit and are removed from the queue.

</details>

## Checker

Check your accounts' analytics (transactions count (nonce) and balances).

### Create Files

Before the first run, you must create the following files:

1. **Navigate to the `assets` folder**:
  - Generate a file for private keys (e.g., `private_keys.txt`). Enter each private key on a separate line. Acceptable formats include both with and without `0x`. Optionally, designate the account name following the private key, separated by a semicolon (`;`). For instance: `0xaaaaa;account_name`. Absence of a name defaults to using the short address.
  - If using addresses, create a file for addresses (e.g., `addresses.txt`). Enter each address on a new line, starting with `0x`. Optionally, specify the account name as in the private keys file.
  - **Note**: Opt for the [Encrypter](#encrypter) mode to encrypt any file within the `assets` folder.

2. **Access the `config` folder**:
  - Duplicate the necessary config file (e.g., `checker.example.json5`) for this mode. Guidance for modifications is detailed below.

### Config:

- `dynamic`: This is just an empty block, no configuration is needed here.
- `fixed`:
  - `files`:
    - `addresses`: Specify the filename in the `assets` folder containing addresses.
    - `privateKeys`: Specify the filename in the `assets` folder containing private keys (e.g., `private_keys.txt`). Either private_keys or addresses must be filled in. You can fill both of them and add to config. It will check accounts from both files and show in one table.
  - `maxParallelAccounts` - Set the maximum number of parallel accounts to check.
  - `delayBetweenChunkSec` - Set the delay between parallel accounts' requests.
  - `hideBalanceLessThanUsd` - Set the USD value of tokens that can be hidden. Set `-1` to see all tokens.
  - `rpc`: Holds the Linea RPC details in the `linea` field.

## Encrypter

Encrypt your assets files (`private_keys`, `addresses`, `proxies`) for secure use on the server with the task runner.

### Create Files

Before the first run, perform the following steps:

1. Open the `config` folder in the file explorer.
   - Copy the required example config file (e.g., `encrypter.example.json5`) for this mode. Instructions for modification are outlined below.

### Config

- `dynamic`: This is just an empty block, no configuration is needed here.
- `fixed`:
    - `encryptedFileName`: Specify the name of the file in the `assets` folder containing decrypted data. The software will create a new file in the `assets` folder with encrypted data.
    
## Eth Returner

**Disabled for now until it is implemented.**

## Depositor

**Disabled for now until it is implemented.**

## Running

After configuring your desired mode, you can run the software by following these steps:

1. Open a command terminal in the software folder (as described above).
2. Run the command: `yarn start`.
3. Select the desired mode and the corresponding config file:
   - Use the arrow keys to navigate and select.
   - Press Enter to confirm your choice.
4. Confirm the run if necessary.

Your selected mode will now start running based on the configurations you have set.

To force stop program use Ctrl+C/Command+C shortcut in terminal

## Additional Links

Explore our scripts on our Telegram channel [alfar](https://t.me/+FozX3VZA0RIyNWY6). Your feedback is invaluable, feel free to suggest improvements or engage in discussions in our chat (link provided in the channel). Together, let's enhance the functionality and efficiency of our tools.
