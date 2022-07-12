import { ethers } from "hardhat";
import { dodoV2Pool, erc20Address } from "../constants/addresses";
import { Flashloan__factory } from "../typechain-types";
import {
  findRouterFromProtocol,
  getBigNumber,
  getContractFromAddress,
  getERC20ContractFromAddress,
} from "../utils";
import { getErc20Balance } from "../utils/token";

import dotenv from 'dotenv';
dotenv.config();


/**
 * @dev This is an example that shows how to execute a flash loan with your deployed contract.
 * Usage
 * 1. Input your deployed contract address in the script
 * 2. Edit each parameter to your needs (For more information, see "https://github.com/yuichiroaoki/poly-flash/wiki/Supporting-Dex-Protocols")
 * 3. Run the script with `npx hardhat run scripts/flashloan.ts`
 */
async function main() {
  const provider = ethers.getDefaultProvider("http://127.0.0.1:8545/");
  // const provider = new ethers.providers.AlchemyProvider(
  //   "polygon",
  //   `https://polygon-mumbai.g.alchemy.com/v2/${process.env.POLYGON_MUMBAI_API_KEY}`
  // );

  const [owner] = await ethers.getSigners();
  const signer = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );

  const contract = await ethers.getContractAt(
    "Flashloan",
    "0xa524FFD704A4E33566C230bfcd3567251ca42aD8",
    signer
  );

  const USDC = await getERC20ContractFromAddress(erc20Address.USDC);

  const tx = await contract.dodoFlashLoan(
    {
      flashLoanPool: dodoV2Pool.WETH_USDC,
      loanAmount: getBigNumber(1000, 6),
      routes: [
        {
          hops: [
            {
              // protocol number
              protocol: 1,
              // // trading ratio (100% -> 10000, 1% -> 100)
              // part: 10000,
              // byte data used for swapping
              data: ethers.utils.defaultAbiCoder.encode(
                ["address"],
                [findRouterFromProtocol(1)]
              ),
              path: [erc20Address.USDC, erc20Address.WETH],
            },
          ],
          part: 10000,
        },
        {
          hops: [
            {
              // UniswapV3
              protocol: 0,
              // part: 10000,
              data: ethers.utils.defaultAbiCoder.encode(
                ["address", "uint24"],
                // 0.05 % => 500 (Input USDC/WETH pool fee)
                [findRouterFromProtocol(0), 500]
              ),
              path: [erc20Address.WETH, erc20Address.USDC],
            },
          ],
          part: 10000,
        }
      ]
    },
    {
      gasLimit: 1000000,
      gasPrice: ethers.utils.parseUnits("60", "gwei"),
    }
  );
  // console.log(tx)
  // console.log(tx.hash);
  await getErc20Balance(USDC, owner.address, "balance", 6);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });