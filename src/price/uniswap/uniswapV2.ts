import { BigNumber, ethers } from "ethers";
import UniswapV2Router from "../../abis/IUniswapV2Router02.json";

import dotenv from 'dotenv';
dotenv.config();

// const provider = new ethers.providers.AlchemyProvider(
//   "polygon",
//   // `https://polygon-mumbai.g.alchemy.com/v2/${process.env.POLYGON_MAINNET_API_KEY}`
//   "https://polygon-mainnet.g.alchemy.com/v2/1vyz1xWysUjs05ok5houcsa5vVMgFp0r"
// );

const provider = new ethers.providers.JsonRpcProvider(
  "https://polygon-mainnet.g.alchemy.com/v2/1vyz1xWysUjs05ok5houcsa5vVMgFp0r"
);

export const getPriceOnUniswapV2 = async (
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  routerAddress: string
): Promise<BigNumber> => {
  const v2Router = new ethers.Contract(
    routerAddress,
    UniswapV2Router.abi,
    provider
  );
  const amountsOut = await v2Router.getAmountsOut(amountIn, [
    tokenIn,
    tokenOut
  ]);
  if (!amountsOut || amountsOut.length !== 2) {
    return getBigNumber(0);
  }
  return amountsOut[1];
}

export const getBigNumber = (amount: number, decimals = 18) => {
  return ethers.utils.parseUnits(amount.toString(), decimals);
};