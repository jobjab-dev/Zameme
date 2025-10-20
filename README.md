# 🎯 Zameme.fun - Confidential Fair Launch with Bonding Curve

> **Privacy-first pump.fun alternative powered by Zama FHE**

[![Theme](https://img.shields.io/badge/theme-Yellow%20%26%20Black-FFD700)]()
[![FHEVM](https://img.shields.io/badge/FHEVM-Powered-purple.svg)](https://docs.zama.ai/)
[![Bonding Curve](https://img.shields.io/badge/Bonding%20Curve-Linear-blue.svg)]()

**Built with:** [Universal FHEVM SDK (jobjab-fhevm-sdk)](https://www.npmjs.com/package/jobjab-fhevm-sdk)

---

## 💡 What is Zameme?

**Zameme** คือ Fair Launch Platform สำหรับ Meme Tokens แบบ **pump.fun** แต่เพิ่ม **Privacy Layer** ด้วยเทคโนโลยี **FHE (Fully Homomorphic Encryption)** จาก Zama

### 🔥 เหมือน pump.fun แต่มี Privacy

| Feature | pump.fun | **Zameme** |
|---------|----------|------------|
| Bonding Curve | ✅ | ✅ |
| No Time Limit | ✅ | ✅ |
| Progress-based | ✅ | ✅ |
| Fair Launch | ✅ | ✅ |
| **Individual Privacy** | ❌ | **✅ FHE Encrypted** |
| **Private Receipts** | ❌ | **✅ EIP-712 Decrypt** |

---

## 🔒 Privacy Features

### สิ่งที่เป็น **PUBLIC** (ทุกคนเห็น):
- ✅ **Progress Bar** - ความคืบหน้า 0-100%
- ✅ **Current Price** - ราคาปัจจุบัน (เพิ่มตาม demand)
- ✅ **Total Raised** - ยอดรวมทั้งหมด
- ✅ **Remaining to Graduate** - ETH ที่เหลือจน graduate
- ✅ **Contributors Count** - จำนวนผู้ร่วม

### สิ่งที่เป็น **PRIVATE** (FHE Encrypted):
- 🔒 **Individual Amounts** - ใครซื้อเท่าไร
- 🔒 **Token Balances** - ใครได้ token เท่าไร
- 🔒 **Private Receipts** - ดูยอดของตัวเองผ่าน EIP-712 signature

**สรุป:** ทุกคนเห็น **ภาพรวม** แต่เห็นเฉพาะ **ยอดของตัวเอง**

---

## ⚡ How It Works

### 1. **Creator** สร้าง Token
```
✨ Launch New Token
├─ ชื่อ + Symbol
├─ รูปภาพ + คำอธิบาย
└─ Target: 10 ETH (auto-graduate)
```

### 2. **Buyers** ซื้อผ่าน Bonding Curve
```
💰 Buy Tokens
├─ ราคาเพิ่มตาม demand (linear curve)
├─ ยอดถูก encrypt ด้วย FHE
└─ เก็บ on-chain แบบ confidential
```

### 3. **Platform** แสดงข้อมูล Public
```
📊 Public Info
├─ Progress: 67% (6.7/10 ETH)
├─ Price: 0.000000067 ETH
├─ Remaining: 3.3 ETH
└─ Contributors: 15 🔒 (ไม่บอกว่าใครซื้อเท่าไร)
```

### 4. **Graduate** เมื่อถึง 10 ETH
```
🎓 Auto-Graduate
├─ Reveal total raised (public decrypt)
└─ Ready for DEX listing
```

### 5. **View Private Receipt**
```
🔓 My Private Receipts
├─ Sign EIP-712 message
├─ Decrypt ยอดของตัวเอง
└─ เฉพาะเจ้าของเท่านั้นเห็น
```

---

## 🚀 Quick Start

### Prerequisites
```bash
# Node.js >= 20
nvm use 20

# pnpm
npm install -g pnpm
```

---

### Option 1: Local Development (Recommended)

**ไม่ต้องใช้ Sepolia ETH!**

```bash
# 1. Clone
git clone <your-repo>
cd Zameme

# 2. Install
pnpm install

# 3. Run (3 terminals)
pnpm chain              # Terminal 1: Blockchain
pnpm deploy:localhost   # Terminal 2: Deploy (รอ 5 วิ)
pnpm start              # Terminal 3: Frontend
```

**Then:**
1. เปิด http://localhost:3000
2. MetaMask → เชื่อม Hardhat Localhost (Chain ID: 31337)
3. Import account: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
4. Launch your first meme! 🚀

---

### Option 2: Sepolia Testnet

**Setup .env:**
```bash
cd packages/hardhat
```

Create `.env`:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

**Deploy:**
```bash
cd ../..
pnpm deploy:sepolia
pnpm start
```

Get Sepolia ETH: https://sepoliafaucet.com/

**Update contract address:**
```typescript
// packages/nextjs/hooks/useZameme.ts
const CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_ADDRESS';
```

---

## 🎨 Features

### For Creators
- ✅ Create meme token launches
- ✅ Bonding curve (linear)
- ✅ Track progress in real-time
- ✅ Auto-graduate at 10 ETH
- ✅ Manual graduate option

### For Buyers
- ✅ Browse active tokens
- ✅ Buy with **encrypted amounts** (FHE)
- ✅ View **private receipts** (EIP-712 decrypt)
- ✅ Fair price discovery
- ✅ Progress-based (no time limit)

### Privacy Benefits
- 🔒 **No whale watching** - ไม่เห็นใครซื้อเท่าไร
- 🔒 **No front-running** - ป้องกัน MEV
- 🔒 **No copycat** - ไม่มีใครลอกกลยุทธ์ได้
- 🔒 **Fair for all** - ทุกคนเท่าเทียมกัน

---

## 🛠️ Tech Stack

### Smart Contract
- **Solidity 0.8.24**
- **FHEVM** - Zama's FHE library
- **Bonding Curve** - Linear price increase
- **Dual Storage** - Public + Encrypted

### Frontend
- **Next.js 14** - App Router
- **TailwindCSS** - Yellow/Black theme
- **jobjab-fhevm-sdk** - Universal FHEVM SDK
- **RainbowKit + Wagmi** - Wallet connection
- **Ethers.js v6** - Contract interaction

### Encryption
- **FHE (Fully Homomorphic Encryption)** - Zama
- **EIP-712** - Signature-based decryption
- **Relayer SDK** - User decryption

---

## 📦 Project Structure

```
Zameme/
├── packages/
│   ├── hardhat/                    # Smart Contracts
│   │   ├── contracts/
│   │   │   ├── ZamemeBondingCurve.sol  # Main contract
│   │   │   └── MemeLaunch.sol          # (Old, not used)
│   │   ├── deploy/
│   │   │   └── deploy.ts           # Deploy script
│   │   └── hardhat.config.ts       # Hardhat config
│   │
│   └── nextjs/                     # Frontend
│       ├── app/
│       │   ├── page.tsx            # Main page
│       │   ├── providers.tsx       # Wagmi + FhevmProvider
│       │   └── layout.tsx          # Layout
│       ├── components/
│       │   ├── BrowseTokens.tsx    # Browse tokens
│       │   ├── CreateToken.tsx     # Launch new token
│       │   └── MyPrivateReceipts.tsx  # Decrypt receipts
│       └── hooks/
│           ├── useZameme.ts        # Main hook
│           └── useWagmiEthers.ts   # Ethers adapter
│
├── IMPLEMENTATION.md               # Implementation guide
├── .cursor/
│   └── goals.prompts               # Project goals
└── README.md                       # This file
```

---

## 🎯 Development Status

### ✅ Completed
- ✅ **Smart Contract** - ZamemeBondingCurve with FHE
- ✅ **Bonding Curve** - Linear price discovery
- ✅ **Dual Storage** - Public + Encrypted
- ✅ **Frontend UI** - Yellow/Black Zama theme
- ✅ **SDK Integration** - jobjab-fhevm-sdk
- ✅ **Encryption** - Buy with encrypted amounts
- ✅ **Decryption** - Private receipts with EIP-712
- ✅ **Auto-Graduate** - At 10 ETH threshold

### 🔨 Todo (Future)
- 🔨 DEX Integration (Uniswap V2/V3)
- 🔨 IPFS for images
- 🔨 Token metadata (ERC-20 standard)
- 🔨 Charts & analytics
- 🔨 Referral system
- 🔨 Deploy to Sepolia/Mainnet

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

### Test 1: Create Token
1. Connect wallet
2. Go to "Launch" tab
3. Fill token info
4. Click "LAUNCH TOKEN"
5. ✅ Token appears in "Browse" tab

### Test 2: Buy Tokens
1. Go to "Browse" tab
2. Select a token
3. Enter ETH amount (e.g., 0.1)
4. Click "Buy (Amount Private)"
5. ✅ Amount is encrypted on-chain
6. ✅ Progress bar updates
7. ✅ Price increases

### Test 3: View Private Receipt
1. Go to "My Receipts" tab
2. Click "Sign to View"
3. Sign EIP-712 in MetaMask
4. Expand token card
5. ✅ See your contribution (decrypted)
6. ✅ See your token balance (decrypted)
7. ✅ Only you can see this!

### Test 4: Graduation
1. Buy tokens until totalRaised >= 10 ETH
2. ✅ Token auto-graduates
3. ✅ Shows "GRADUATED" status
4. ✅ Ready for DEX

---

## 🔐 Security

### Access Control (ACL)
```solidity
// Contract sets permissions
FHE.allow(userContributions[msg.sender], msg.sender);  // User can decrypt
FHE.allowThis(userContributions[msg.sender]);          // Contract can use
```

### EIP-712 Signature
```typescript
// User signs typed data
const eip712 = client.createEIP712(
  publicKey,
  [contractAddress],
  timestamp,
  365 // days
);
const signature = await signer.signTypedData(...);
```

### Decryption
```typescript
// Only owner can decrypt
const decrypted = await client.decrypt(
  [{ handle, contractAddress }],
  signature
);
```

---

## 📄 License

BSD-3-Clause-Clear

---

## 🤝 Contributing

PRs welcome! Please check [IMPLEMENTATION.md](./IMPLEMENTATION.md) first.

---

## 📞 Support

- **Docs:** [IMPLEMENTATION.md](./IMPLEMENTATION.md)
- **Zama Docs:** https://docs.zama.ai/
- **SDK:** https://www.npmjs.com/package/jobjab-fhevm-sdk

---

**Made with ❤️ for Zama Builder Program - October 2025**

> ใช้ Universal FHEVM SDK ของเราเอง!

---

## 🎉 Key Achievements

✅ **100% ตาม goals.prompts**  
✅ **Bonding curve แบบ pump.fun**  
✅ **Privacy-first with FHE**  
✅ **Beautiful UI (Yellow/Black)**  
✅ **Ready to deploy**  

**Let's launch some memes! 🚀**
