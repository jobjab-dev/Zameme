// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ZamemeBondingCurve - Confidential Fair Launch with Bonding Curve
 * @notice Pump.fun-like bonding curve with privacy using FHE
 * @dev Dual storage: plaintext for curve calculation + encrypted for private receipts
 * 
 * Key Features:
 * - Progress-based (no time limit)
 * - Linear bonding curve
 * - Private individual ETH amounts (FHE encrypted) - receipt only
 * - Public total raised & price (for curve calculation)
 * - Public token amounts (calculated from curve)
 * - Graduate at threshold
 */
contract ZamemeBondingCurve is SepoliaConfig {
    
    struct Token {
        string name;
        string symbol;
        string imageUrl;
        string description;
        address creator;
        uint256 createdAt;
        bool isGraduated;
    }
    
    // Constants for bonding curve
    uint256 public constant GRADUATION_THRESHOLD = 10 ether; // 10 ETH to graduate
    uint256 public constant TOKEN_SUPPLY = 1_000_000_000 * 1e18; // 1B tokens
    uint256 public constant INITIAL_PRICE = 0.00000001 ether; // Starting price per token
    uint256 public constant MIN_PURCHASE = 0.001 ether;
    
    // Storage
    mapping(uint256 => Token) public tokens;
    mapping(uint256 => uint256) public totalRaised; // Public - for curve calculation
    mapping(uint256 => uint256) public tokensSold; // Public - for curve calculation
    mapping(uint256 => uint256) public contributorCount;
    
    // Public token balances (calculated from curve)
    mapping(uint256 => mapping(address => uint256)) public userTokenBalances; // Public
    
    // Private storage (FHE encrypted) - only ETH contributions
    mapping(uint256 => mapping(address => euint64)) private userContributions; // Private receipt
    mapping(uint256 => mapping(address => bool)) public hasContributed;
    
    uint256 public nextTokenId;
    
    // Events
    event TokenCreated(
        uint256 indexed tokenId,
        string name,
        string symbol,
        address indexed creator
    );
    
    event Purchase(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 ethAmount,
        uint256 tokensReceived
    );
    
    event Graduated(
        uint256 indexed tokenId,
        uint256 totalRaised,
        uint256 tokensSold
    );
    
    /**
     * @notice Create new token with bonding curve
     */
    function createToken(
        string memory name,
        string memory symbol,
        string memory imageUrl,
        string memory description
    ) external returns (uint256) {
        uint256 tokenId = nextTokenId++;
        
        tokens[tokenId] = Token({
            name: name,
            symbol: symbol,
            imageUrl: imageUrl,
            description: description,
            creator: msg.sender,
            createdAt: block.timestamp,
            isGraduated: false
        });
        
        emit TokenCreated(tokenId, name, symbol, msg.sender);
        return tokenId;
    }
    
    /**
     * @notice Buy tokens with encrypted ETH receipt
     * @dev Only ETH amount is encrypted for private receipt
     *      Token amounts are public (calculated from curve)
     */
    function buy(
        uint256 tokenId,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external payable {
        Token storage token = tokens[tokenId];
        require(!token.isGraduated, "Already graduated");
        require(msg.value >= MIN_PURCHASE, "Below minimum");
        require(totalRaised[tokenId] < GRADUATION_THRESHOLD, "Target reached");
        
        // Calculate tokens to receive based on bonding curve
        uint256 ethAmount = msg.value;
        uint256 tokensToReceive = calculateTokensForEth(tokenId, ethAmount);
        
        // Update public state (for curve calculation)
        totalRaised[tokenId] += ethAmount;
        tokensSold[tokenId] += tokensToReceive;
        
        // Track contributor
        if (!hasContributed[tokenId][msg.sender]) {
            hasContributed[tokenId][msg.sender] = true;
            contributorCount[tokenId]++;
        }
        
        // Store PUBLIC token balance
        userTokenBalances[tokenId][msg.sender] += tokensToReceive;
        
        // Store ENCRYPTED ETH contribution (private receipt)
        euint64 encAmount = FHE.fromExternal(encryptedAmount, inputProof);
        
        // Add to existing encrypted contribution
        if (FHE.isInitialized(userContributions[tokenId][msg.sender])) {
            userContributions[tokenId][msg.sender] = FHE.add(
                userContributions[tokenId][msg.sender],
                encAmount
            );
        } else {
            userContributions[tokenId][msg.sender] = encAmount;
        }
        
        // Set ACL permissions (for user decrypt)
        FHE.allow(userContributions[tokenId][msg.sender], msg.sender);
        FHE.allowThis(userContributions[tokenId][msg.sender]);
        
        emit Purchase(tokenId, msg.sender, ethAmount, tokensToReceive);
        
        // Auto-graduate if threshold reached
        if (totalRaised[tokenId] >= GRADUATION_THRESHOLD) {
            _graduate(tokenId);
        }
    }
    
    /**
     * @notice Calculate tokens received for ETH amount (linear bonding curve)
     * @dev Simple linear formula: tokens = ethAmount / currentPrice
     */
    function calculateTokensForEth(
        uint256 tokenId,
        uint256 ethAmount
    ) public view returns (uint256) {
        uint256 currentPrice = getCurrentPrice(tokenId);
        return (ethAmount * 1e18) / currentPrice;
    }
    
    /**
     * @notice Get current token price (increases linearly with progress)
     * @dev Price = INITIAL_PRICE + (progress * priceIncrement)
     */
    function getCurrentPrice(uint256 tokenId) public view returns (uint256) {
        uint256 raised = totalRaised[tokenId];
        
        // Linear price increase: from INITIAL_PRICE to ~10x at graduation
        uint256 priceRange = INITIAL_PRICE * 9; // 9x increase
        uint256 priceIncrease = (raised * priceRange) / GRADUATION_THRESHOLD;
        
        return INITIAL_PRICE + priceIncrease;
    }
    
    /**
     * @notice Get graduation progress (0-100%)
     */
    function getProgress(uint256 tokenId) public view returns (uint256) {
        uint256 raised = totalRaised[tokenId];
        if (raised >= GRADUATION_THRESHOLD) return 100;
        return (raised * 100) / GRADUATION_THRESHOLD;
    }
    
    /**
     * @notice Get remaining ETH needed to graduate
     */
    function getRemainingToGraduate(uint256 tokenId) public view returns (uint256) {
        uint256 raised = totalRaised[tokenId];
        if (raised >= GRADUATION_THRESHOLD) return 0;
        return GRADUATION_THRESHOLD - raised;
    }
    
    /**
     * @notice Get my encrypted ETH contribution (private receipt)
     * @dev User can decrypt this with EIP-712 signature
     */
    function getMyContribution(uint256 tokenId) external view returns (euint64) {
        return userContributions[tokenId][msg.sender];
    }
    
    /**
     * @notice Get my token balance (PUBLIC - not encrypted)
     */
    function getMyTokenBalance(uint256 tokenId) external view returns (uint256) {
        return userTokenBalances[tokenId][msg.sender];
    }
    
    /**
     * @notice Graduate token (internal)
     * @dev Called automatically when threshold reached
     */
    function _graduate(uint256 tokenId) internal {
        Token storage token = tokens[tokenId];
        require(!token.isGraduated, "Already graduated");
        
        token.isGraduated = true;
        
        emit Graduated(tokenId, totalRaised[tokenId], tokensSold[tokenId]);
        
        // TODO: Add DEX listing logic here
        // - Create liquidity pool
        // - Transfer tokens & ETH to DEX
        // - Enable trading
    }
    
    /**
     * @notice Manual graduate (creator can force if stuck)
     */
    function graduate(uint256 tokenId) external {
        Token storage token = tokens[tokenId];
        require(msg.sender == token.creator, "Not creator");
        require(!token.isGraduated, "Already graduated");
        require(totalRaised[tokenId] >= GRADUATION_THRESHOLD, "Below threshold");
        
        _graduate(tokenId);
    }
    
    /**
     * @notice Get token info
     */
    function getTokenInfo(uint256 tokenId) external view returns (
        string memory name,
        string memory symbol,
        string memory imageUrl,
        string memory description,
        address creator,
        uint256 raised,
        uint256 sold,
        uint256 progress,
        uint256 currentPrice,
        uint256 contributors,
        bool graduated
    ) {
        Token storage token = tokens[tokenId];
        return (
            token.name,
            token.symbol,
            token.imageUrl,
            token.description,
            token.creator,
            totalRaised[tokenId],
            tokensSold[tokenId],
            getProgress(tokenId),
            getCurrentPrice(tokenId),
            contributorCount[tokenId],
            token.isGraduated
        );
    }
}
