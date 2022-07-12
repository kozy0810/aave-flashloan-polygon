import { NetworksUserConfig } from "hardhat/types";
import dotenv from 'dotenv';
import { env } from "process";

dotenv.config();

const networks: NetworksUserConfig = {};

if (process.env.PRIVATE_KEY) {
  // https://hardhat.org/hardhat-network/guides/mainnet-forking
  networks.hardhat = {
    forking: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.POLYGON_MAINNET_API_KEY}`,
      blockNumber: 29467974,
    },
    gas: 21000000,
    gasPrice: 4000000000,
    blockGasLimit: 2000000
  }

  networks.mumbai = {
    url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.POLYGON_MUMBAI_API_KEY}`,
    accounts: [process.env.PRIVATE_KEY],
    gas: 21000000,
    gasPrice: 8000000000,
    // blockGasLimit:
  };

  networks.polygon = {
    url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.POLYGON_MAINNET_API_KEY}`,
    accounts: [process.env.PRIVATE_KEY]
  };
}

export default networks;