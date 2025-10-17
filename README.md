# 🎯 Zameme.fun - Confidential Fair Launch

> **Fair meme token launches with private contributions powered by Zama FHE**

[![Theme](https://img.shields.io/badge/theme-Yellow%20%26%20Black-FFD700)]()
[![FHEVM](https://img.shields.io/badge/FHEVM-Powered-purple.svg)](https://docs.zama.ai/)

**Built with:** [Universal FHEVM SDK](https://github.com/jobjab-dev/fhevm-react-template) - our own SDK!

---

## 💡 What is Zameme?

**Zameme** is a confidential fair launch platform for meme tokens with **privacy-first design** using Zama's FHE technology.

### 🔒 Privacy Features

- **Private Contributions** - Individual amounts stay encrypted
- **Fair Distribution** - No whale watching, no copycats
- **Secret Voting** - Rate memes without bias
- **Private Receipts** - Only you can see your contribution

### ⚡ How It Works

1. **Creator** uploads meme → Sets target amount
2. **Contributors** back meme with **encrypted amounts**
3. **Platform** shows only: contributor count + time left
4. **After launch** ends: Reveal **total only** → Distribute tokens fairly
5. **Contributors** can decrypt **their own** amounts anytime

---

## 🚀 Quick Start

**Prerequisites:**
```bash
npm install -g pnpm
```

---

### Option 1: Local (No ETH Needed!)

```bash
git clone https://github.com/jobjab-dev/Zameme.git
cd Zameme
pnpm install

# 3 terminals
pnpm chain              # Terminal 1
pnpm deploy:localhost   # Terminal 2 (wait 5 sec)
pnpm start              # Terminal 3
```

**Then:**
1. http://localhost:3000
2. MetaMask → Hardhat Local
3. Import: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
4. Launch memes! 🚀

---

### Option 2: Sepolia (Real Testnet)

**Setup .env:**
```bash
cd packages/hardhat
```

Create `.env`:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_WITH_SEPOLIA_ETH
```

**Deploy:**
```bash
cd ../..
pnpm deploy:sepolia
pnpm start
```

Get Sepolia ETH: https://sepoliafaucet.com/

---

### SDK Integration

**Zameme uses jobjab-fhevm-sdk from npm:**
```json
"dependencies": {
  "jobjab-fhevm-sdk": "^0.1.0"  // Installs automatically!
}
```

---

## 🎨 Features

### For Creators
- ✅ Create meme token launches
- ✅ Set target amounts
- ✅ Track contributor count (not amounts!)
- ✅ Withdraw funds after success

### For Contributors  
- ✅ Browse active launches
- ✅ Contribute with **encrypted amounts**
- ✅ View **your own** contributions (decrypt with signature)
- ✅ Fair token allocation

### Privacy Benefits
- 🔒 No whale watching
- 🔒 No front-running
- 🔒 No copycat strategies
- 🔒 Fair for everyone

---

## 🛠️ Tech Stack

- **Smart Contracts:** Solidity + FHEVM
- **Frontend:** Next.js 14 + TailwindCSS (Yellow-Black Zama theme)
- **SDK:** jobjab-fhevm-sdk (from npm!)
- **Encryption:** Zama FHE
- **Wallet:** RainbowKit + Wagmi
- **Networks:** Localhost or Sepolia

---

## 📦 Project Structure

```
Zameme/
├── packages/
│   ├── hardhat/                 # Smart contracts
│   │   ├── contracts/
│   │   │   └── MemeLaunch.sol  # Confidential launch contract
│   │   ├── deploy/
│   │   └── hardhat.config.ts   # Sepolia + localhost config
│   │
│   └── nextjs/                  # Frontend (Zama theme)
│       ├── app/
│       │   ├── page.tsx        # Main app (3 tabs)
│       │   └── providers.tsx   # Wagmi + RainbowKit
│       ├── components/
│       │   ├── CreateLaunch.tsx
│       │   ├── BrowseLaunches.tsx
│       │   └── MyContributions.tsx
│       └── hooks/
│           └── useMemeLaunch.ts # Uses jobjab-fhevm-sdk
│
└── scripts/
    └── generateTsAbis.ts
```

**SDK Integration:**
```json
"dependencies": {
  "jobjab-fhevm-sdk": "^0.1.0"  // From npm!
}
```

---

## 🎯 Development Status

**Completed:**
- ✅ Smart contract (MemeLaunch.sol)
- ✅ Frontend UI (Yellow-Black Zama theme)
- ✅ SDK integration (jobjab-fhevm-sdk)
- ✅ Sepolia deployment ready

**To Complete:**
- 🔨 Wire up contract calls
- 🔨 Integrate encryption
- 🔨 Add decryption UI
- 🔨 Deploy to Sepolia
- 🔨 Test on testnet

## 📝 Commands

```bash
# Local development
pnpm chain              # Start blockchain
pnpm deploy:localhost   # Deploy contracts
pnpm start              # Start app

# Sepolia deployment
pnpm deploy:sepolia     # Deploy to Sepolia
pnpm start              # Start app (connects to Sepolia)

# Development
pnpm compile            # Compile contracts
pnpm test               # Run tests
```

---

## 📄 License

BSD-3-Clause-Clear

---

**Made with ❤️ for Zama Builder Program - October 2025**

> Using our own Universal FHEVM SDK!

