## Create a New Smart Contract
* [ ] Add the contract ABI to `src/abi/sources/<CONTRACT_NAME>.ts`
* [ ] Generate contract types using the `yarn gent` command
* [ ] Create and export the contract name in `src/common/constants/contracts.ts`
* [ ] Add the address to the following chain in `src/chain/<chain_name>/contracts.ts`
* [ ] Add the contract type to `src/utils/getContract.ts`

## Create a New Action
* [ ] Add new provider (if needed) to `src/common/constants/actionProviders.ts` 
* [ ] Add new type (if needed) to `src/common/constants/actionTypes.ts` 
* [ ] Add provider (if needed) to example `config/tasksRunner.example.json5`  
* [ ] Create and export the action name in `src/common/constants/actions.ts` 
* [ ] Add it as a name variable in the action class in `src/actions/<action_name>/<file_name>.ts` 
* [ ] Add it to the factory in `src/worker/tasksRunner/initializeFactory/get<type>.ts`  
* [ ] Add the action description in README file `README.md`
