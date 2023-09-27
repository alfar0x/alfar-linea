[![Typing SVG](https://readme-typing-svg.demolab.com/?font=Fira+Code&size=50&pause=1000&vCenter=true&width=350&height=80&lines=alfar-linea&color=2a9d8f)](https://git.io/typing-svg)

This software is designed to manage Linea accounts by simulating user activity through random transactions.

**_It is crucial to read the instructions carefully to fully understand how the software works before running it._**

Check for updates here: [alfar](https://t.me/+FozX3VZA0RIyNWY6)

Donate: `0xeb3F3e28F5c83FCaF28ccFC08429cCDD58Fd571D`

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

## Table of Contents
- [How it works](#how-it-works)
- [Modes](#modes)
- [Suggestions](#suggestions)
- [Installation](#installation)
- [Task Runner](#task-runner)
  - [Create Files](#create-files)
  - [Config](#config)
  - [Available Commands](#available-commands)
  - [Account statuses](#account-statuses)
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

## How It Works

In the main mode `task-runner`, the software creates a `task` for each account, comprising various `steps`, which in turn consist of a list of `transactions`

1. **Step**: Represents transactions sent by real users within 1-2 minutes (e.g., `[approve -> swap]`). Each step can currently include 1-3 transactions.
2. **Task**: Encompasses steps executable by real users within hours/days (e.g., `[swap ETH to USDC] --> [approve USDC -> add USDC to liquidity pool] --> [remove liquidity] --> [approve USDC -> swap to ETH]`). Here, 1 task = 4 steps = 6 transactions. Each task concludes by returning all tokens/liquidity to ETH.

Currently there are 90+ different tasks using 8 web3 services

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

### Fixed Configuration Values

The `fixed` block encompasses static configuration details including:
- `approveMultiplier` - responsible for increasing the value of each approval to avoid making additional transactions each time the software uses the service.
- `files`: Ensure the filenames within the `assets` folder are correctly formatted (e.g., `private_keys.txt` is correct, `private_keys` is not). Include the following:
  - `privateKeys`: Denote the filename in the `assets` folder containing private keys.
  - `proxies`: Designate the filename in the `assets` folder holding proxies. It can be an empty string for `none` proxy type.
- `maxAccountFeeUsd` - Maximum gas limit for all transactions. If the account uses the entire limit, tasks will stop being generated. You can set `1000` if you set right `transactionsLimit` and `maxTxFeeUsd`.
- `minEthBalance`: Indicates the minimum ETH balance required in the account for start step. If account has less than minimum native and there are some tasks in work you can deposit manually on accounts with insufficient balance to continue. 
- `onCurrentTaskEnd` - Determines what should system do with the account after the completion of the current task. This parameter has more significance if the software is launched with a large number of accounts and/or transactions or a long pause between steps. Options:
  - `CREATE_NEXT_TASK`: Create and execute a new task. This is suitable for quickly increasing the number of transactions on each account, as the task will remain in the queue for execution until the transaction limit is reached.
  - `WAIT_OTHERS`: Wait until all accounts have completed their tasks and then create a new one. This option is suitable to increase the number of active days, as new tasks will not be created while there are still accounts in the process of execution.
  - `MOVE_RANDOMLY`: Move the account to a random place in the queue. This option is for cases when the accounts are already satisfactory in active days and transactions overall. It adds randomness to the actions. Some accounts may reach the queue several times more often than others.
- `providers`: List the service providers for this mode. To omit specific blocks, comment them out in the configuration file. For example, the following lines in the config file mean that OPEN_OCEAN will be used while DMAIL won't be:
  ```json
  "OPEN_OCEAN",
  // "DMAIL",
  ```
- `proxy`: Includes proxy settings such as:
  - `type`: Determines the proxy type (`none`, `mobile`, or `server`).
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
  - This configuration provides control over the workload allocated to each account, allowing for balanced distribution and preventing overuse of individual accounts.
- `workingAmountPercent`: Set the minimum and maximum working amount in percentage.

Ensure your config and assets files are prepared, then proceed to run the script as outlined [below](#running).

### Available Commands

During this mode you can write commands directly in terminal:
- **status**: check accounts state
- **exit**: force stop program

### Account statuses

- `TODO` - waiting in queue to generate task and execute it
- `IN_PROGRESS` - account in queue to execute task
- `INSUFFICIENT_BALANCE` - account native balance is less than `minEthBalance` value. If account has less than minimum native and there are some tasks in work you can deposit manually on accounts with insufficient balance to continue. 
- `WAITING` - if you selected `WAIT_OTHERS` value in `onCurrentTaskEnd` account will use this status to wait other accounts to execute tasks
- `DONE` - account min transactions limit reached
- `FEE_LIMIT` - account total fees was reached `maxAccountFeeUsd` value

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
