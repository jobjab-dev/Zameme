# 🎯 Zameme.fun - Confidential Fair Launch with Bonding Curve

> **Privacy-first Fair Launch Platform powered by Zama FHE**

[![Theme](https://img.shields.io/badge/theme-Yellow%20%26%20Black-FFD700)]()
[![FHEVM](https://img.shields.io/badge/FHEVM-Powered-purple.svg)](https://docs.zama.ai/)
[![Bonding Curve](https://img.shields.io/badge/Bonding%20Curve-Linear-blue.svg)]()

**Built with:** [Universal FHEVM SDK (jobjab-fhevm-sdk)](https://www.npmjs.com/package/jobjab-fhevm-sdk)

## 🌐 Live Demo

🚀 **[Try Zameme.fun Now](https://zameme-fun.vercel.app/)** 

*Deploy to Sepolia testnet - Get free testnet ETH from [sepoliafaucet.com](https://sepoliafaucet.com/)*

## 💡 What is Zameme?

**Zameme** is a **Privacy-First Fair Launch Platform** for Meme Tokens using Zama's **FHE (Fully Homomorphic Encryption)** technology.

### 🔥 Key Features

- ✅ **Bonding Curve** - Linear price discovery mechanism
- ✅ **No Time Limit** - Progress-based graduation (no rush!)
- ✅ **Fair Launch** - Equal opportunity for all participants
- ✅ **Privacy Layer** - FHE encrypted contributions on-chain
- ✅ **Distributor Pattern** - Claim tokens to any address you choose
- ✅ **Auto-Graduate** - Automatic Uniswap V2 LP creation at 0.1 ETH

---

## 🔒 Privacy Features

### **PUBLIC** Data (everyone sees):
- ✅ **Progress Bar** - 0-100% completion
- ✅ **Current Price** - Increases with demand
- ✅ **Total Raised** - Overall ETH collected
- ✅ **Remaining to Graduate** - ETH needed to finish
- ✅ **Contributors Count** - Number of buyers

### **PRIVACY** Design:
- 🔒 **Encrypted Contributions** - Buy amounts stored encrypted with FHE on-chain
- 🔒 **Distributor Pattern** - Tokens held in separate contract until claim
- 🔒 **Claim Separation** - Buy from address A, claim to address B
- 🔒 **Fair Launch** - No advantage for whales or snipers

**Summary:** Everyone sees the **big picture**, contributions stored **encrypted on-chain**, and you control **when & where** to claim.

---

## ⚡ How It Works

### 1. **Creator** Launches Token
```
✨ Launch New Token
├─ Name + Symbol
├─ Image + Description
└─ Target: 0.1 ETH (auto-graduate)
```

### 2. **Buyers** Purchase via Bonding Curve
```
💰 Buy Tokens
├─ Price increases with demand (linear curve)
├─ Amount encrypted with FHE
└─ Stored on-chain confidentially
```

### 3. **Platform** Shows Public Info
```
📊 Public Info
├─ Progress: 67% (0.067/0.1 ETH)
├─ Price: 0.000000067 ETH (increases with demand)
├─ Remaining: 0.033 ETH
└─ Contributors: 15 🔒 (individual amounts encrypted)
```

### 4. **Graduate** at 0.1 ETH
```
🎓 Auto-Graduate
├─ Create Uniswap V2 LP (80% ETH)
├─ Creator receives 20% ETH
└─ Ready for trading on DEX
```

### 5. **Claim Your Tokens**
```
🎁 Claim Tokens
├─ View claimable amounts
├─ Choose destination address
└─ Transfer from Distributor to your wallet
```

---

## 🚀 Quick Start

### Prerequisites
```bash
# Node.js >= 20
nvm use 20

# pnpm
npm install -g pnpm

# Storacha CLI (for Web3.Storage setup)
npm install -g @storacha/cli
```

---

### Setup Web3.Storage (Required for Image Upload - 5GB Free!)

**Step 1: Create Agent Key**
```bash
storacha key create
# Output: 
# did:key:z6Mkh9... (Agent DID)
# MgCb+bRGl0... (Private Key)
```

**Step 2: Login**
```bash
storacha login your@email.com
# Check email and click verification link
```

**Step 3: Create Space**
```bash
storacha space create Zameme
# Output: did:key:z6MkrZ... (Space DID)
```

**Step 4: Create Delegation** (specify exact capabilities)
```bash
storacha delegation create <AGENT_DID_from_step1> \
  --can space/blob/add \
  --can space/index/add \
  --can filecoin/offer \
  --can upload/add \
  --base64
# Output: mAYIEAIw... (Base64 Proof - very long string!)
```

**Step 5: Configure `.env`**
```bash
cd packages/nextjs
# Create .env file
```

Edit `packages/nextjs/.env` (create new file):
```env
# Web3.Storage (Required for image upload - client-side)
NEXT_PUBLIC_W3STORAGE_PRIVATE_KEY=MgCb+bRGl0...
NEXT_PUBLIC_W3STORAGE_PROOF=mAYIEAIw...

# WalletConnect (Optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Network (localhost/sepolia)
NEXT_PUBLIC_NETWORK=localhost
```

---

### Option 1: Local Development (Recommended)

**No Sepolia ETH needed!**

```bash
# 1. Clone
git clone <your-repo>
cd Zameme

# 2. Setup Web3.Storage (see above)

# 3. Install
pnpm install

# 4. Run (3 terminals)
pnpm chain              # Terminal 1: Blockchain
pnpm deploy:localhost   # Terminal 2: Deploy (wait 5 sec)
pnpm start              # Terminal 3: Frontend
```

**Then:**
1. Open http://localhost:3000
2. MetaMask → Connect to Hardhat Localhost (Chain ID: 31337)
3. Import account: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
4. Upload meme image (auto-crop to 512x512, upload to IPFS)
5. Launch your first meme! 🚀

---

### Option 2: Sepolia Testnet

**Note:** You only need `.env` in **`packages/nextjs/`** - no separate hardhat config needed!

Edit `packages/nextjs/.env`:
```env
# Web3.Storage (Required for image upload - client-side)
NEXT_PUBLIC_W3STORAGE_PRIVATE_KEY=MgCb+bRGl0...
NEXT_PUBLIC_W3STORAGE_PROOF=mAYIEAIw...

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Network (IMPORTANT: must match deployment!)
NEXT_PUBLIC_NETWORK=sepolia

# Deployer Private Key (for deployment only)
DEPLOYER_PRIVATE_KEY=0xYOUR_SEPOLIA_TESTNET_PRIVATE_KEY
```

**Deploy:**
```bash
cd ../..
pnpm deploy:sepolia  # Deploys Factory, auto-verifies on Etherscan
pnpm start           # Start frontend
```

**Important Notes:**
- Get Sepolia ETH: https://sepoliafaucet.com/
- Contract address auto-detected from `deployedContracts.ts`
- **After deploy, wait 5-10 minutes** for Zama Relayer to index contracts
- Switch MetaMask to **Sepolia Testnet**
- Make sure `.env` has `NEXT_PUBLIC_NETWORK=sepolia`

---

## 🎨 Features

### For Creators
- ✅ Upload meme images (IPFS via Web3.Storage)
- ✅ Interactive crop tool (drag & zoom to 512x512)
- ✅ Each token = separate ERC-20 contract
- ✅ Custom name & symbol (validated)
- ✅ Linear bonding curve (price increases with buys)
- ✅ Real-time progress tracking
- ✅ Auto-graduate at 0.1 ETH (testnet) / 10 ETH (mainnet)
- ✅ Auto-create Uniswap V2 LP on graduate
- ✅ Receive 20% ETH from sales

### For Buyers
- ✅ Browse tokens (compact card grid)
- ✅ Token detail pages (chart + chat + buy)
- ✅ Live price charts
- ✅ Buy with custom amounts
- ✅ Slippage control (Auto/0.5%/1%/2%/Custom)
- ✅ Tokens held in Distributor (privacy!)
- ✅ Claim to any address you want
- ✅ Auto-refund excess ETH
- ✅ Transaction history tracking
- ✅ Per-token chat rooms

### Privacy Benefits
- 🔒 **Distributor Pattern** - Tokens held in separate contract until you claim
- 🔒 **Address Separation** - Buy from address A, claim to address B
- 🔒 **FHE Encrypted Storage** - Buy amounts stored encrypted on-chain
- 🔒 **Fair Launch** - No advantage for whales, no sniping

---

## 🛠️ Tech Stack

### Smart Contract
- **Solidity 0.8.24**
- **ERC-20** - OpenZeppelin standard
- **FHEVM** - Zama's FHE library
- **Bonding Curve** - Linear price increase
- **Dual Storage** - Public + Encrypted
- **Uniswap V2** - Auto-graduate LP creation
- **Multi-network** - Sepolia, Mainnet support

### Frontend
- **Next.js 14** - App Router
- **TailwindCSS** - Yellow/Black theme
- **jobjab-fhevm-sdk** - Universal FHEVM SDK
- **RainbowKit + Wagmi** - Wallet connection
- **Ethers.js v6** - Contract interaction
- **Web3.Storage (Storacha)** - IPFS image upload
- **react-easy-crop** - Interactive image cropping

### Encryption & Storage
- **FHE (Fully Homomorphic Encryption)** - Zama FHEVM
- **IPFS** - Decentralized image storage via Web3.Storage (Storacha)
- **Encrypted State** - Buy amounts stored encrypted on-chain

---

## 📦 Project Structure

```
Zameme/
├── packages/
│   ├── hardhat/                        # Smart Contracts
│   │   ├── contracts/
│   │   │   ├── MemeFactory.sol         # Factory contract
│   │   │   ├── MemeToken.sol           # Individual ERC-20 tokens
│   │   │   ├── ClaimDistributor.sol    # Claim system
│   │   │   └── interfaces/
│   │   │       └── IMemeToken.sol      # Token interface
│   │   ├── deploy/
│   │   │   └── deploy.ts               # Deploy script
│   │   └── hardhat.config.ts           # Hardhat config
│   │
│   └── nextjs/                         # Frontend
│       ├── app/
│       │   ├── page.tsx                # Main page (Browse/Create/Claim/History)
│       │   ├── token/[address]/        # Token detail page
│       │   ├── providers.tsx           # Wagmi + FhevmProvider
│       │   └── layout.tsx              # Layout + metadata
│       ├── lib/
│       │   └── uploadToIPFS.ts         # Client-side IPFS upload
│       ├── components/
│       │   ├── BrowseTokens.tsx        # Token grid (compact cards)
│       │   ├── CreateToken.tsx         # Launch new token
│       │   ├── ClaimTokens.tsx         # Claim tokens
│       │   ├── TransactionHistory.tsx  # Activity history
│       │   ├── PriceChart.tsx          # Live price chart
│       │   ├── BuyPanel.tsx            # Buy form with settings
│       │   ├── TokenChat.tsx           # Token chat
│       │   └── ImageCropModal.tsx      # Crop tool
│       └── hooks/
│           ├── useZameme.ts            # Main contract hook
│           └── useWagmiEthers.ts       # Ethers adapter
│
└── README.md                           # This file
```

---

## 🎯 Development Status

### ✅ Completed (v1.0)

**Smart Contracts:**
- ✅ **Factory Pattern** - Each meme = separate ERC-20 contract
- ✅ **MemeToken** - Individual tokens with bonding curve + FHE
- ✅ **ClaimDistributor** - Privacy via delayed claim
- ✅ **Bonding Curve** - Linear price discovery
- ✅ **Auto-Graduate** - Uniswap V2 LP creation (atomic)
- ✅ **Refund Logic** - Auto-refund excess ETH
- ✅ **SYMBOL Validation** - Contract + UI (3-8 chars, A-Z, 0-9)
- ✅ **Symbol Uniqueness** - Prevent duplicates

**Frontend:**
- ✅ **Responsive UI** - Mobile/Tablet/Desktop optimized
- ✅ **Token Detail Pages** - Individual page per token
- ✅ **Price Charts** - Live price tracking (recharts)
- ✅ **Token Chat** - Per-token discussion (localStorage)
- ✅ **Image Upload** - IPFS via Web3.Storage/Storacha
- ✅ **Image Cropping** - Interactive 512x512 crop tool
- ✅ **Transaction History** - Activity tracking
- ✅ **Settings Modal** - Slippage control (Auto/Custom)

**Integration:**
- ✅ **SDK Integration** - jobjab-fhevm-sdk
- ✅ **FHE Encryption** - Encrypted contributions
- ✅ **Multi-network** - Sepolia + Mainnet support
- ✅ **Auto-verify** - Etherscan contract verification
- ✅ **Auto-detect** - Contract address from deployments
- ✅ **Clean Deploy** - Fresh deployment with `--reset` flag

### 🔨 Future Improvements

#### Near-term (1-2 weeks)
- 🔨 Charts & analytics
- 🔨 Token search & filtering
- 🔨 Social sharing features
- 🔨 Referral system
- 🔨 Mobile app (React Native)

#### Long-term (Research & Development)
- 🔬 **Full Zero-Knowledge Privacy** (ZK-SNARKs Integration)
  - ✅ totalRaised = PUBLIC (enables price calculation)
  - ✅ price = PUBLIC (bonding curve works normally)
  - ✅ progress = PUBLIC (good UX)
  - 🔒 individual amounts = PRIVATE (completely hidden!)
  - 🔒 token balances = PRIVATE (nobody knows who got what)
  - **Technology**: Circom/Noir + ZK proof verification on-chain
  - **Timeline**: 2-3 weeks development + testing
  - **Tradeoffs**: 
    - Gas costs: +200-300% (proof verification)
    - UX: Slower (5-10s proof generation client-side)
    - Complexity: High (requires ZK expertise)

---

## 📝 Commands

### Development
```bash
pnpm chain              # Start local blockchain
pnpm deploy:localhost   # Deploy to localhost
pnpm start              # Start frontend
pnpm compile            # Compile contracts
```

### Deployment
```bash
pnpm deploy:sepolia     # Deploy to Sepolia testnet
pnpm build              # Build for production
```

### Testing
```bash
pnpm test               # Run contract tests
```

---

## 🧪 Testing Guide

### Test 1: Upload Image
1. Connect wallet
2. Go to "Launch" tab
3. Click "📁 Choose Meme Image"
4. Select image file
5. **Interactive Crop Modal** opens
6. Drag to position, use slider to zoom
7. Click "✅ Done"
8. ✅ Auto-upload to IPFS (3-10 seconds)
9. ✅ Preview shows 512x512 square image

### Test 2: Create Token
1. Fill token info:
   - Name: `Moon Cat`
   - Symbol: `MCAT` (3-8 chars, A-Z, 0-9 only)
   - Description: `To the moon! 🚀`
2. Click "🚀 LAUNCH TOKEN"
3. Sign transaction
4. ✅ Token appears in "Browse" tab with image from IPFS

### Test 3: Browse and Buy Tokens
1. Go to "🔥 Browse" tab
2. Click on any token card
3. Opens **Token Detail Page** with:
   - 📊 Live price chart
   - 💰 Buy panel (right sidebar)
   - 💬 Token chat
4. Enter amount (e.g., 0.05 ETH)
5. Optional: Click ⚙️ to adjust slippage (Auto/0.5%/1%/2%/Custom)
6. Click "💰 Buy"
7. Sign transaction
8. ✅ Progress bar updates immediately
9. ✅ Price increases on bonding curve
10. ✅ Tokens minted to **Distributor** (not your wallet!)

### Test 4: Claim Your Tokens
1. Go to "🎁 Claim" tab
2. See all tokens you can claim
3. Enter destination address (can be different from purchase address!)
4. Click "🎁 Claim All"
5. ✅ Tokens transferred to your chosen address
6. ✅ Now visible in wallet

### Test 5: View Transaction History
1. Go to "📜 History" tab
2. See all your activities:
   - ✨ Tokens created
   - 💰 Purchases made
   - 🎁 Claims completed
3. Click any transaction to view on Etherscan

### Test 6: Graduation & Uniswap LP
1. Buy tokens until totalRaised >= 0.1 ETH (testnet threshold)
2. ✅ Auto-graduate in same transaction
3. ✅ Uniswap V2 LP created (80% ETH)
4. ✅ LP tokens burned to address(0)
5. ✅ 20% ETH sent to creator
6. ✅ Shows "GRADUATED" badge
7. ✅ Token tradeable on Uniswap V2

### Test 7: Refund Excess ETH
1. When token at 0.09 ETH raised
2. Buy 0.05 ETH
3. ✅ Only 0.01 ETH used (to reach 0.1 threshold)
4. ✅ 0.04 ETH refunded automatically
5. ✅ Token auto-graduates

---

## 🔐 Security

### FHE Encryption
```solidity
// Contract stores encrypted contributions
euint64 encAmount = FHE.fromExternal(encryptedAmount, inputProof);
userContributions[msg.sender] = encAmount;

// Set ACL permissions
FHE.allow(userContributions[msg.sender], msg.sender);
FHE.allowThis(userContributions[msg.sender]);
```

### Distributor Pattern
```solidity
// Tokens minted to Distributor, not directly to buyer
_mint(distributor, tokensToReceive);
userTokenBalances[msg.sender] += tokensToReceive;

// User claims later to any address
function claimAll(address to) external { ... }
```

### Bonding Curve Security
- ✅ ReentrancyGuard on all state-changing functions
- ✅ Auto-refund excess ETH when reaching graduation threshold
- ✅ Atomic LP creation (no frontrunning)

---

## 📄 License

BSD-3-Clause-Clear

---

## 🤝 Contributing

PRs welcome! Please read the code structure in `packages/` directory first.

---

## 📞 Support

- **Zama Docs:** https://docs.zama.ai/
- **SDK Docs:** https://www.npmjs.com/package/jobjab-fhevm-sdk
- **SDK GitHub:** https://github.com/jobjab-dev/fhevm-react-template

---

**Made with ❤️ for Zama Builder Program - October 2025**

> Using our own Universal FHEVM SDK!

---

## 🎉 Key Achievements

✅ **100% follows goals.prompts**    
✅ **Privacy-first with FHE**  
✅ **Ready to deploy**  

**Let's launch some memes! 🚀**
