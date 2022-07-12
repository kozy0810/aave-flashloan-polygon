import {
  aavePoolAddressesProvider,
  uniswapRouter
} from "../constants/addresses";

module.exports = async ({ getNamedAccounts, deployments }: any) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("Flashloan", {
    from: deployer,
    args: [
      aavePoolAddressesProvider
    ],
    log: true,
  });
};
module.exports.tags = ["Flashloan"];