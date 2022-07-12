import { getBigNumber } from "./utils";
import { getPriceOnUniswapV2 } from  "./price/uniswap/uniswapV2";
import { erc20Address, uniswapRouter } from "../constants/addresses";


export const main = async () => {
  const amountOut = await getPriceOnUniswapV2(
    erc20Address.USDC,
    erc20Address.WETH,
    getBigNumber(1),
    uniswapRouter.POLYGON_APESWAP
  );
  console.log(amountOut.toString());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
})