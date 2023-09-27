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

The `dynamic` block encompasses values that can be modified in real-time during program execution. It includes:

- **`delaySec`**: 
  - **Description**: Manages delays in two distinct areas.
  - **Sub-settings**:
    - **`step`**: 
      - **Description**: Determines the minimum and maximum delay, in seconds, between steps.
      - **Note**: Minimum value is 20 seconds.
    - **`transaction`**: 
      - **Description**: Sets the minimum and maximum delay, in seconds, between transactions.
      - **Note**: Minimum value is 60 seconds.

- **`maxLineaGwei`**: 
  - **Description**: Specifies the upper limit for Linea Gwei. 
  - **Function**: The system verifies this limit before executing each transaction.

- **`maxParallelAccounts`**: 
  - **Description**: Designates the highest number of accounts that can operate concurrently.

- **`maxTxFeeUsd`**: 
  - **Description**: Establishes the maximum permissible transaction cost in USD for gas fees. 
  - **Function**: Triggers an error and terminates ongoing account task steps if the cost exceeds this value.
  - **Note**: Set to `100` to have the system ignore this setting until the transaction cost reaches $100, if not concerned about transaction cost.

### Fixed Configuration Values

The `fixed` block encompasses static configuration details including:

- **`approveMultiplier`**: 
  - **Description**: Responsible for increasing the value of each approval to avoid making additional transactions each time the software uses the service.

- **`files`**: 
  - **Description**: Ensure the filenames within the `assets` folder are correctly formatted (e.g., `private_keys.txt` is correct; `private_keys` is not).
    - **`privateKeys`**: 
      - **Description**: Denote the filename in the `assets` folder containing private keys.
    - **`proxies`**: 
      - **Description**: Designate the filename in the `assets` folder holding proxies. It can be an empty string for `none` proxy type.

- **`maxAccountFeeUsd`**: 
  - **Description**: Maximum gas limit for all transactions. 
  - **Note**: If the account uses the entire limit, tasks will stop being generated. You can set `1000` if you set the right `transactionsLimit` and `maxTxFeeUsd`.

- **`minEthBalance`**: 
  - **Description**: Indicates the minimum ETH balance required in the account for the start step. 
  - **Note**: If an account has less than the minimum balance and tasks are in progress, you can manually deposit into accounts with insufficient balance to continue.

- **`onCurrentTaskEnd`**: 
  - **Description**: Determines what the system should do with the account after the completion of the current task. 
  - **Options**:
    - **`CREATE_NEXT_TASK`**: 
      - **Description**: Create and execute a new task. Suitable for quickly increasing the number of transactions on each account, as the task will remain in the queue for execution until the transaction limit is reached.
    - **`WAIT_OTHERS`**: 
      - **Description**: Wait until all accounts have completed their tasks and then create a new one. Suitable to increase the number of active days, as new tasks will not be created while there are still accounts in the process of execution.
    - **`MOVE_RANDOMLY`**: 
      - **Description**: Move the account to a random place in the queue, adding randomness to the actions. Some accounts may reach the queue several times more often than others.

- **`providers`**: 
  - **Description**: Lists the service providers for this mode. 
  - **Note**: To omit specific blocks, comment them out in the configuration file. 
  - **Example**: Below lines in the config file mean that `OPEN_OCEAN` will be used while `DMAIL` won't be:
    ```json
    "OPEN_OCEAN",
    // "DMAIL",
    ```

- **`proxy`**: 
  - **Description**: Includes proxy settings.
  - **Sub-settings**:
    - **`type`**: 
      - **Description**: Determines the proxy type (`none`, `mobile`, or `server`).
    - **`mobileIpChangeUrl`**: 
      - **Description**: If using a mobile proxy, specify the rotation URL here.
    - **`serverIsRandom`**: 
      - **Description**: A boolean setting (`true` or `false`) associated with the use of server proxies.
      - **Details**: 
        - If `true`, the system will allocate a random proxy from your proxy list to each account for every task. This setting ensures enhanced anonymity and reduced likelihood of account flagging.
        - If `false`, each account will use a dedicated proxy for all its operations. Ensure the number of proxies is equal to or more than the number of accounts.

- **`rpc`**: 
  - **Description**: Holds the Linea RPC url in the `linea` field.

- **`transactionsLimit`**: 
  - **Description**: Controls the minimum and maximum number of transactions that will be generated for each account. 
  - **Format**: Set as a range (e.g., `1-5`). The system will randomly select a limit within this range for each account.
  - **Function**: Determines the total number of transactions an account will perform before stopping task generation.

- **`workingAmountPercent`**: 
  - **Description**: Set the minimum and maximum working amount in percentage.
  - **Purpose**: Provides control over the workload allocated to each account, allowing for balanced distribution and preventing overuse.

Ensure your config and assets files are prepared, then proceed to run the script as outlined [below](#running).

### Available Commands

During this mode, you can enter commands directly in the terminal:
- **`status`**: 
  - **Description**: Check the accounts' state.
- **`exit`**: 
  - **Description**: Force stop the program.

### Account Statuses

This section outlines the various statuses an account can hold and their implications.

- **`TODO`**: 
  - **Description**: Account is in the queue, awaiting task generation and execution.
  
- **`IN_PROGRESS`**:
  - **Description**: Account is in the queue for task execution.
  
- **`INSUFFICIENT_BALANCE`**: 
  - **Description**: Account's native balance is lower than the `minEthBalance` value.
  - **Note**: Manually deposit funds into accounts with insufficient balance to continue task execution if there are tasks in progress.
  
- **`WAITING`**: 
  - **Description**: Account is waiting for other accounts to execute tasks.
  - **Condition**: This status is active if `WAIT_OTHERS` value is selected in `onCurrentTaskEnd`.
  
- **`DONE`**: 
  - **Description**: Account has reached the minimum transactions limit.
  
- **`FEE_LIMIT`**: 
  - **Description**: Account has reached the `maxAccountFeeUsd` value, signaling the total fee limit.
  
Each status offers a glimpse into the account’s present condition, aiding in effective account management and understanding.

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

- **`dynamic`**:
  - **Description**: This is just an empty block, no configuration is needed here.

- **`fixed`**:
  - **Sub-settings**:
    - **`files`**: 
      - **Sub-settings**:
        - **`addresses`**: 
          - **Description**: Specify the filename in the `assets` folder containing addresses.
        - **`privateKeys`**: 
          - **Description**: Specify the filename in the `assets` folder containing private keys (e.g., `private_keys.txt`).
          - **Note**: Either `privateKeys` or `addresses` must be filled in. Filling both will check accounts from both files and display in one table.
    - **`maxParallelAccounts`**: 
      - **Description**: Set the maximum number of parallel accounts to check.
    - **`delayBetweenChunkSec`**: 
      - **Description**: Set the delay between parallel accounts' requests.
    - **`hideBalanceLessThanUsd`**: 
      - **Description**: Set the USD value of tokens that can be hidden.
      - **Note**: Set to `-1` to see all tokens.
    - **`rpc`**: 
      - **Description**: Holds the Linea RPC details in the `linea` field.

## Encrypter

Encrypt your assets files (`private_keys`, `addresses`, `proxies`) for secure use on the server with the task runner.

### Create Files

Before the first run, perform the following steps:

1. Open the `config` folder in the file explorer.
   - Copy the required example config file (e.g., `encrypter.example.json5`) for this mode. Instructions for modification are outlined below.

### Config

- **`dynamic`**:
  - **Description**: This is just an empty block, no configuration is needed here.

- **`fixed`**:
  - **Sub-settings**:
    - **`encryptedFileName`**: 
      - **Description**: Specify the name of the file in the `assets` folder containing decrypted data.
      - **Note**: The software will create a new file in the `assets` folder with encrypted data.

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
