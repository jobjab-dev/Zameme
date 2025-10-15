import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployMemeLaunch: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("MemeLaunch", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
};

export default deployMemeLaunch;
deployMemeLaunch.tags = ["MemeLaunch"];

