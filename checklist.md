## Create a New Smart Contract
* [ ] Use the correct case for the contract name - `CONTRACT_NAME`
* [ ] Add the contract ABI to `src/abi/sources/<CONTRACT_NAME>.ts`
* [ ] Generate contract types using the `yarn gent` command
* [ ] Create and export the contract name in `src/common/constants/contracts.ts`
* [ ] Add the address to the following chain in `src/chain/<chain_name>/contracts.ts`
* [ ] Add the contract type to `src/utils/getContract.ts`

## Create a New Action
* [ ] Use the correct case for the action name - `ACTION_NAME`
* [ ] Create and export the action name in `src/common/constants/actions.ts` 
* [ ] Add it as a name variable in the action class in `src/actions/<action_name>/<file_name>.ts` 

## Create a New Block
* [ ] Use the correct case for the block name - `BLOCK_NAME`
* [ ] Create and export the block name in `src/common/constants/blocks.ts` 
* [ ] Add it as a name variable in the block class in `src/block/<block_name>/<file_name>.ts` 
* [ ] Add the name to the block example `config/block.example.json5`  
* [ ] Add it to the available blocks in `src/config/block/availableBlocks.ts`  
* [ ] Add the block class to the worker so it can use it in `src/worker/block/initializeBlocks.ts`
* [ ] Add the block description in README file `README.md`
