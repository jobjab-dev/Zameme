import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployZameme: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying MemeFactory...");

  // Uniswap V2 Router & WETH addresses
  const NETWORK_CONFIG: Record<string, { router: string; weth: string }> = {
    sepolia: {
      router: "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008",
      weth: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
    },
    localhost: {
      router: "0x0000000000000000000000000000000000000001",
      weth: "0x0000000000000000000000000000000000000002",
    },
    hardhat: {
      router: "0x0000000000000000000000000000000000000001",
      weth: "0x0000000000000000000000000000000000000002",
    },
  };

  const networkName = hre.network.name;
  const config = NETWORK_CONFIG[networkName];

  if (!config) {
    throw new Error(`Network ${networkName} not supported`);
  }

  const { router: routerAddress, weth: wethAddress } = config;

  if (networkName === "localhost" || networkName === "hardhat") {
    console.log("⚠️  Localhost: Auto-graduate to DEX will not work without Uniswap V2");
  }

  console.log(`📍 Using Uniswap V2 Router: ${routerAddress}`);
  console.log(`📍 Using WETH: ${wethAddress}`);

  const deployment = await deploy("MemeFactory", {
    from: deployer,
    args: [routerAddress, wethAddress],
    log: true,
    autoMine: true,
    waitConfirmations: networkName === "sepolia" ? 5 : 1,
  });

  console.log("✅ MemeFactory deployed at:", deployment.address);
  console.log(`🏭 Each meme token will be deployed as separate ERC-20 contract`);

  // Auto-verify on Sepolia
  if (networkName === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("\n⏳ Waiting for Etherscan to index...");
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log("📝 Verifying MemeFactory on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: deployment.address,
        constructorArguments: [routerAddress, wethAddress],
      });
      console.log("✅ Factory verified!");
      console.log(`🔗 https://sepolia.etherscan.io/address/${deployment.address}#code`);
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  Already verified");
        console.log(`🔗 https://sepolia.etherscan.io/address/${deployment.address}#code`);
      } else {
        console.error("❌ Verification failed:", error.message);
      }
    }
  }
};

export default deployZameme;
deployZameme.tags = ["MemeFactory"];

