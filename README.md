# 🎯 Zameme - Confidential Fair Launch

> **Fair meme token launches with private contributions powered by Zama FHE**

[![Theme](https://img.shields.io/badge/theme-Yellow%20%26%20Black-FFD700)]()
[![FHEVM](https://img.shields.io/badge/FHEVM-Powered-purple.svg)](https://docs.zama.ai/)

**Built with:** [Universal FHEVM SDK](https://github.com/jobjab-dev/fhevm-react-template) - our own SDK from Bounty Track!

---

## 💡 What is Zameme?

**Zameme** is a confidential fair launch platform for meme tokens, similar to pump.fun but with **privacy-first design** using Zama's FHE technology.

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

### Quick Start

```bash
# Clone Zameme
git clone <zameme-repo>
cd Zameme

# Install (will auto-fetch SDK from GitHub)
pnpm install

# Run (3 terminals)
pnpm chain          # Terminal 1 - Blockchain
pnpm deploy         # Terminal 2 - Deploy contracts
pnpm start          # Terminal 3 - Frontend
```

Open http://localhost:3000 🎉

### How SDK is Used

The app automatically installs SDK from GitHub:
```json
{
  "dependencies": {
    "fhevm-sdk": "git+https://github.com/jobjab-dev/fhevm-react-template.git#main"
  }
}
```

**No manual SDK setup needed!** pnpm handles everything ✅

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
- **Frontend:** Next.js 14 + TailwindCSS
- **SDK:** Universal FHEVM SDK (our own!)
- **Encryption:** Zama FHE
- **Wallet:** RainbowKit + Wagmi

---

## 📦 Project Structure

```
Zameme/
├── packages/
│   ├── hardhat/       # Smart contracts
│   │   └── contracts/
│   │       └── MemeLaunch.sol
│   └── nextjs/        # Frontend app
│       └── app/
│           └── page.tsx
└── README.md
```

---

## 🎯 Roadmap

**MVP (Week 1-2):**
- ✅ Create launches
- ✅ Private contributions
- ✅ Reveal totals
- ✅ Private receipts

**Plus (Week 3-4):**
- 📋 Secret voting/rating
- 📋 Private referrals
- 📋 Trending/Hot tags
- 📋 Leaderboard

---

## 📄 License

BSD-3-Clause-Clear

---

**Made with ❤️ for Zama Builder Program - October 2025**

> Using our own Universal FHEVM SDK!

