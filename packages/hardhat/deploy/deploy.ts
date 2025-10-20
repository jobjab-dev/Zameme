import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployZameme: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying ZamemeBondingCurve...");

  const deployment = await deploy("ZamemeBondingCurve", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("✅ ZamemeBondingCurve deployed at:", deployment.address);
};

export default deployZameme;
deployZameme.tags = ["ZamemeBondingCurve"];

