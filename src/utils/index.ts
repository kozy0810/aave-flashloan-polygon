import { ethers } from "ethers";

export const getBigNumber = (amount: number, decimals = 18) => {
  return ethers.utils.parseUnits(amount.toString(), decimals);
};