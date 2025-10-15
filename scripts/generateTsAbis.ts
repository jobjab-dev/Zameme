/**
 * Generate TypeScript ABIs from deployed contracts
 */

import * as fs from 'fs';

const DEPLOYMENTS_DIR = './packages/hardhat/deployments';
const TARGET_DIR = './packages/nextjs/contracts/';

function generateTsAbis() {
  if (!fs.existsSync(DEPLOYMENTS_DIR)) {
    console.log('⚠️  No deployments found. Deploy contracts first.');
    return;
  }

  const chainDirs = fs.readdirSync(DEPLOYMENTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const allContracts: any = {};

  for (const chainName of chainDirs) {
    const chainId = fs.readFileSync(`${DEPLOYMENTS_DIR}/${chainName}/.chainId`).toString().trim();
    const contracts: any = {};

    const files = fs.readdirSync(`${DEPLOYMENTS_DIR}/${chainName}`)
      .filter(f => f.endsWith('.json') && !f.startsWith('.'));

    for (const file of files) {
      const contractName = file.replace('.json', '');
      const data = JSON.parse(
        fs.readFileSync(`${DEPLOYMENTS_DIR}/${chainName}/${file}`).toString()
      );

      contracts[contractName] = {
        address: data.address,
        abi: data.abi,
      };
    }

    allContracts[chainId] = contracts;
  }

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const content = `
/**
 * Auto-generated contract definitions
 * Do not edit manually
 */

export const deployedContracts = ${JSON.stringify(allContracts, null, 2)} as const;

export default deployedContracts;
`;

  fs.writeFileSync(`${TARGET_DIR}/deployedContracts.ts`, content);
  console.log('✅ Generated TypeScript ABIs');
}

generateTsAbis();

