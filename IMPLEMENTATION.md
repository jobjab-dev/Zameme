# 🎯 Zameme Implementation Guide

## ✅ สิ่งที่ทำเสร็จแล้ว

### 1. Smart Contract - ZamemeBondingCurve.sol

**ตาม Goals.prompts ทุกประการ:**

#### ✅ Bonding Curve แบบ pump.fun
- **Progress-based** (ไม่มีเวลา time-based)
- Linear bonding curve ราคาเพิ่มตาม demand
- Graduation threshold: **10 ETH**
- Auto-graduate เมื่อถึง threshold

#### ✅ Dual Storage System
```solidity
// Public - สำหรับ curve calculation
uint256 public totalRaised;      // ยอดรวมทั้งหมด
uint256 public tokensSold;       // จำนวน token ที่ขายไปแล้ว

// Private - FHE encrypted สำหรับ receipt
mapping(address => euint64) private userContributions;  // ยอดที่ผู้ใช้ซื้อ
mapping(address => euint64) private userTokenBalances;  // token ที่ได้รับ
```

**ทำไมต้อง dual storage?**
- Bonding curve ต้องการ **plaintext** เพื่อคำนวณราคา
- แต่เราต้องการ **privacy** สำหรับยอดรายคน
- **วิธีแก้**: เก็บทั้งสองแบบ
  - `totalRaised` (plaintext) → ใช้คำนวณ curve
  - `userContributions` (encrypted) → private receipt

#### ✅ Public Functions (ตามที่ goals ต้องการ)
```solidity
getCurrentPrice(tokenId)        // ราคาปัจจุบัน (เพิ่มตาม progress)
getProgress(tokenId)            // % ความคืบหน้า 0-100%
getRemainingToGraduate()        // ETH ที่เหลือจน graduate
```

#### ✅ Private Functions (ต้อง decrypt ด้วย EIP-712)
```solidity
getMyContribution(tokenId)      // ยอดที่ฉันซื้อ (encrypted)
getMyTokenBalance(tokenId)      // token ที่ฉันได้ (encrypted)
```

#### ✅ Graduate System
- Auto-graduate เมื่อ `totalRaised >= 10 ETH`
- Manual graduate โดย creator (กรณี stuck)
- พร้อม hook สำหรับ DEX listing

---

### 2. Frontend Implementation

#### ✅ FhevmProvider Setup
```tsx
// app/providers.tsx
<FhevmProvider
  config={{
    network: 'localhost',
    provider: window.ethereum,
    mockChains: { 31337: 'localhost' }
  }}
>
  {children}
</FhevmProvider>
```

#### ✅ Custom Hook - useZameme
ครบทุกฟีเจอร์:
- `createToken()` - สร้าง token ใหม่
- `buyTokens()` - ซื้อพร้อม encrypt amount
- `getTokenInfo()` - ดูข้อมูล public
- `getMyContribution()` - ดูยอดของฉัน (encrypted handle)
- `getMyTokenBalance()` - ดู token ของฉัน (encrypted handle)
- `graduate()` - graduate token

#### ✅ UI Components

**1. BrowseTokens.tsx** - ตาม goals ทุกข้อ
```tsx
// แสดงข้อมูล PUBLIC เท่านั้น:
✅ Progress bar (%)
✅ Current price (เพิ่มตาม demand)
✅ Total raised / 10 ETH target
✅ Remaining to graduate
✅ Number of contributors (แต่ไม่แสดงว่าใครซื้อเท่าไร)
✅ Graduated status

// ไม่แสดง:
❌ ยอดรายคน (เก็บเป็น encrypted)
❌ รายชื่อ + ยอดของแต่ละคน
```

**2. CreateToken.tsx**
- สร้าง token ใหม่
- แสดง graduation threshold และ curve info
- Real-time feedback

**3. MyPrivateReceipts.tsx** - Private Receipt System
```tsx
// ใช้ EIP-712 signature
1. ผู้ใช้กด "Sign to View"
2. Sign EIP-712 message ด้วย wallet
3. Decrypt ด้วย useDecrypt hook
4. แสดง:
   - ยอดที่ฉันซื้อ (ETH)
   - จำนวน token ที่ฉันได้
   - เฉพาะฉันเท่านั้นเห็น
```

---

## 🎯 ความแตกต่างจาก pump.fun

| Feature | pump.fun | Zameme (ของเรา) |
|---------|----------|-----------------|
| **Bonding Curve** | ✅ Linear | ✅ Linear |
| **No Time Limit** | ✅ Progress-based | ✅ Progress-based |
| **Individual Amounts** | ❌ Public | ✅ **Private (FHE encrypted)** |
| **Total Progress** | ✅ Public | ✅ Public |
| **Price Discovery** | ✅ Public | ✅ Public |
| **Private Receipt** | ❌ None | ✅ **EIP-712 decrypt** |
| **Graduate** | ✅ Auto | ✅ Auto + Manual |

**สรุป:** เราเหมือน pump.fun **ทุกประการ** แต่เพิ่ม **privacy layer** ด้วย FHE!

---

## 📋 วิธีใช้งาน

### ขั้นตอนที่ 1: Deploy Contract

```bash
cd packages/hardhat

# ติดตั้ง dependencies (ถ้ายังไม่ได้ทำ)
npm install

# Compile contract
npx hardhat compile

# Deploy to localhost
pnpm chain              # Terminal 1
pnpm deploy:localhost   # Terminal 2

# หรือ deploy to Sepolia
pnpm deploy:sepolia     # (ต้องมี .env ก่อน)
```

### ขั้นตอนที่ 2: อัพเดท Contract Address

หลัง deploy เสร็จ จะได้ address ใหม่:

```typescript
// packages/nextjs/hooks/useZameme.ts
const CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_ADDRESS'; // อัพเดทที่นี่
```

### ขั้นตอนที่ 3: Run Frontend

```bash
cd ../..
pnpm start              # Terminal 3

# เปิด browser
http://localhost:3000
```

### ขั้นตอนที่ 4: ทดสอบ

**A. สร้าง Token**
1. เชื่อม wallet
2. ไปที่แท็บ "Launch"
3. กรอกข้อมูล token
4. กด "LAUNCH TOKEN"

**B. ซื้อ Token**
1. ไปแท็บ "Browse"
2. เลือก token ที่ต้องการ
3. ใส่จำนวน ETH
4. กด "Buy (Amount Private)"
5. ยอดที่ซื้อจะถูก **encrypt** และเก็บ on-chain

**C. ดู Private Receipt**
1. ไปแท็บ "My Receipts"
2. กด "Sign to View"
3. Sign EIP-712 ด้วย MetaMask
4. กด expand token ที่ซื้อ
5. **Decrypt** และดูยอดของคุณ (เฉพาะคุณเท่านั้น!)

---

## 🔐 Privacy Model

### สิ่งที่เป็น PUBLIC (ทุกคนเห็น):
✅ Total raised (10 ETH)
✅ Progress (67%)
✅ Current price (0.000000067 ETH)
✅ Remaining to graduate (3.3 ETH)
✅ Number of contributors (15 people)
✅ Graduated status

### สิ่งที่เป็น PRIVATE (FHE encrypted):
🔒 ใครซื้อเท่าไร (user A ซื้อ 2 ETH, user B ซื้อ 0.5 ETH)
🔒 ใครได้ token เท่าไร
🔒 Individual balances

**วิธีดูของตัวเอง:**
1. เรียก `getMyContribution(tokenId)` → ได้ encrypted handle
2. Sign EIP-712 message
3. Decrypt ด้วย `useDecrypt` hook
4. เห็นยอดของตัวเองเท่านั้น

---

## 🧪 Testing Guide

### Test 1: Bonding Curve
```bash
# Terminal 1: Run blockchain
pnpm chain

# Terminal 2: Run frontend
pnpm start

# ทดสอบ:
1. สร้าง token
2. ซื้อ 0.1 ETH → เช็คราคา
3. ซื้อ 0.5 ETH → เช็คราคา (ต้องสูงขึ้น)
4. ซื้อ 1 ETH → เช็คราคา (สูงขึ้นอีก)
✅ Expected: ราคาเพิ่มขึ้นตาม linear curve
```

### Test 2: Privacy (Dual Storage)
```bash
# ทดสอบ:
1. User A ซื้อ 0.5 ETH
2. User B ซื้อ 1.0 ETH
3. เช็ค totalRaised → ต้องเห็น 1.5 ETH (public)
4. User A ดู "My Receipts" → เห็น 0.5 ETH (private)
5. User B ดู "My Receipts" → เห็น 1.0 ETH (private)
6. User A พยายามดูยอดของ User B → ไม่ได้ (encrypted)
✅ Expected: Privacy works!
```

### Test 3: Graduation
```bash
# ทดสอบ:
1. สร้าง token
2. ซื้อจน totalRaised >= 10 ETH
3. เช็คสถานะ → ต้องเป็น "Graduated"
✅ Expected: Auto-graduate ที่ 10 ETH
```

### Test 4: EIP-712 Decryption
```bash
# ทดสอบ:
1. ซื้อ token
2. ไปแท็บ "My Receipts"
3. กด "Sign to View"
4. Sign ด้วย MetaMask
5. Expand token
✅ Expected: เห็นยอดที่ซื้อและ token ที่ได้
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                 FRONTEND                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Browse   │  │ Launch   │  │ Private  │     │
│  │ Tokens   │  │ Token    │  │ Receipts │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │              │           │
│       └─────────────┴──────────────┘           │
│                     │                          │
│            ┌────────▼────────┐                 │
│            │  useZameme Hook │                 │
│            │  + SDK Hooks    │                 │
│            └────────┬────────┘                 │
└─────────────────────┼──────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐         ┌────────▼────────┐
│ FHEVM SDK      │         │  Smart Contract │
│ (jobjab)       │         │  ZamemeCurve    │
│                │         │                 │
│ - Encrypt      │◄───────►│ Dual Storage:   │
│ - Decrypt      │         │                 │
│ - EIP-712      │         │ PUBLIC:         │
└────────────────┘         │ - totalRaised   │
                           │ - tokensSold    │
                           │ - progress      │
                           │                 │
                           │ PRIVATE (FHE):  │
                           │ - contributions │
                           │ - balances      │
                           └─────────────────┘
```

---

## 🚀 Next Steps (Optional Improvements)

1. **DEX Integration**
   - เชื่อม Uniswap V2/V3
   - Auto-create pool เมื่อ graduate
   - Transfer liquidity

2. **Charts & Analytics**
   - Price chart (public)
   - Progress chart
   - Trading volume

3. **Token Metadata**
   - Upload image to IPFS
   - Token standards (ERC-20)
   - Metadata JSON

4. **Advanced Features**
   - Referral system
   - Fee mechanism
   - Creator rewards

---

## 📝 Summary

✅ **Smart Contract**: Bonding curve + Dual storage (public + encrypted)  
✅ **Frontend**: Full integration with FHEVM SDK  
✅ **Privacy**: Individual amounts encrypted, only owner can decrypt  
✅ **UX**: Beautiful UI แบบ pump.fun  
✅ **ตาม Goals 100%**: Progress-based, no time limit, privacy first  

**พร้อมใช้งานแล้ว!** 🎉

