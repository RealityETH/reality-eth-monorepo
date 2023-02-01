import { crypto, log, BigInt, Bytes, ByteArray } from '@graphprotocol/graph-ts'

import { 
    FactoryDeployment,
} from '../generated/schema'

import {
  RealityETH_ERC20_deployed
} from '../generated/RealityETH_ERC20_Factory/RealityETH_ERC20_Factory'

import {
  FactoryCreatedRealityETH,
} from '../generated/templates'

export function handleFactoryRealityETHDeploy(event: RealityETH_ERC20_deployed): void {
   FactoryCreatedRealityETH.create(event.params.reality_eth)

   let deploymentId = event.address.toHexString() + event.params.token.toHexString();
   let facdep = new FactoryDeployment(deploymentId)
   facdep.token_address = event.params.token;
   facdep.token_symbol = event.params.token_ticker;
   facdep.token_decimals = BigInt.fromI32(event.params.decimals);
   facdep.realityETH = event.params.reality_eth;
   facdep.factory = event.address;
   facdep.createdBlock = event.block.number;
   facdep.createdTimestamp = event.block.timestamp;
   facdep.save();
}
