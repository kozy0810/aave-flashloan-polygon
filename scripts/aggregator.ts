import { ethers } from "hardhat";
import { dodoV2Pool, erc20Address, oracle } from "../constants/addresses";
const { BigNumber } = require('ethers');

const offchainOracleABI = require("../utils/abis/1inch-offchain-oracle.json");
const multicallABI = require("../utils/abis/MultiCall.abi.json");

import dotenv from 'dotenv';
dotenv.config();

async function singlePrice() {

  const offChainOracleContract = await ethers.getContractAt(
    offchainOracleABI,
    oracle.OffchainOracle
  );

  const token = {
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // USDT
    decimals: 18,
  };

  const resp = await offChainOracleContract.getRateToEth(
    token.address,
    true
  )
  .then((resp: any) => {
    const numerator = BigNumber.from(10).pow(token.decimals);
    const denominator = BigNumber.from(10).pow(18); // eth decimals
    const price = BigNumber.from(resp).mul(numerator).div(denominator);
    console.log("numerator: ", numerator.toString());
    console.log("denominator: ", denominator.toString());
    console.log("price: ", price.toString()); // 472685293218315
  })


  // const tx = await contract.aaveFlashLoan(erc20Address.USDC, 10000, {
  //   gasLimit: 2000000,
  //   gasPrice: 4000000000
  // }

  // );
  // console.log(tx);
  // console.log(await tx.wait());
}

// async function multiplePrices() {
//   const offChainOracleContract = await ethers.getContractAt(
//     offchainOracleABI,
//     oracle.OffchainOracle
//   );

//   const multiCallContract = await ethers.getContractAt(
//     multicallABI,
//     "0x59a0A6d73e6a5224871f45E6d845ce1574063ADe"
//   );

//   const tokens = [
//     {
//         address: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
//         decimals: 18,
//     },
//     {
//         address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
//         decimals: 6,
//     },
//     {
//         address: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
//         decimals: 6,
//     }, {
//         address: '0x111111111117dc0aa78b770fa6a738034120c302', // 1INCH
//         decimals: 18,
//     },
//   ];

//   const abiCoder = new ethers.utils.AbiCoder;

//   const callData = tokens.map((token) => ({
//     to: oracle.OffchainOracle,
//     data: abiCoder.encode(
//       ["address", "bool"],
//       offChainOracleContract.getRateToEth(token.address, true),
//     )
//     // data: offChainOracleContract.getRateToEth(
//     //     token.address,
//     //     true, // use wrapper
//     // )
//   }));
//   console.log(callData);

//   // const resp = await multiCallContract.multicall(callData);
//   // console.log(resp);
// }

function main() {
  // singlePrice();
  // multiplePrices();
}

main();
  // .then(() => process.exit(0))
  // .catch((error) => {
  //   console.error(error);
  //   process.exit(1);
  // });