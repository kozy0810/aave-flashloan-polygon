import { ethers } from "hardhat";
import { dodoV2Pool, erc20Address } from "../constants/addresses";
import { findRouterFromProtocol } from "../utils/";

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

  // const [owner] = await ethers.getSigners();
  const signer = new ethers.Wallet(
    process.env.PRIVATE_KEY as string,
    provider
  );

  const contract = await ethers.getContractAt(
    "Flashloan",
    "0xa98b9f2D8426DF201F4732947635C52841b04a25",
    signer
  );

  // const USDC = await getERC20ContractFromAddress(erc20Address.USDC);

  console.log(ethers.utils.defaultAbiCoder.encode(
    ["address"],
    [findRouterFromProtocol(1)]
  ));

  const tx = await contract.aaveFlashLoan(
    {
      flashLoanPool: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
      loanToken: erc20Address.USDC,
      loanAmount: "10",
      routes: [
        {
          hops: [
            {
              protocol: "1",
              data:  ethers.utils.defaultAbiCoder.encode(
                ["address"],
                [findRouterFromProtocol(2)]
              ),
              path: [
                erc20Address.USDC,
                erc20Address.WETH
              ]
            },
            {
              protocol: "1",
              data:  ethers.utils.defaultAbiCoder.encode(
                ["address"],
                [findRouterFromProtocol(2)]
              ),
              path: [
                erc20Address.WETH,
                erc20Address.USDC
              ]
            }
          ],
          part: "10000"
        },
      ],
    },
    {
      gasLimit: 2000000,
      gasPrice: 4000000000
    }
  );
  console.log(tx);
  console.log(await tx.wait());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });