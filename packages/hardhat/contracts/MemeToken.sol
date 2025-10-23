// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IUniswapV2Router02 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

/**
 * @title MemeToken - Individual Meme Token with Bonding Curve
 * @notice Each meme gets its own ERC-20 token (like pump.fun)
 */
contract MemeToken is ERC20, ReentrancyGuard {
    
    // Constants
    uint256 public constant GRADUATION_THRESHOLD = 0.1 ether;
    uint256 public constant CURVE_SUPPLY = 800_000_000 * 1e18;
    uint256 public constant INITIAL_PRICE = 0.00000001 ether;
    uint256 public constant MIN_PURCHASE = 0.001 ether;
    
    // Token metadata
    string public imageUrl;
    string public description;
    address public creator;
    uint256 public createdAt;
    bool public isGraduated;
    
    // Bonding curve state
    uint256 public totalRaised;
    uint256 public tokensSold;
    uint256 public contributorCount;
    
    // Uniswap
    IUniswapV2Router02 public immutable router;
    address public immutable WETH;
    
    // Distributor
    address public distributor;
    
    // Privacy: encrypted contributions (FHE)
    mapping(address => euint64) private userContributions;
    mapping(address => bool) public hasContributed;
    mapping(address => uint256) public userTokenBalances;
    
    // Events
    event Purchase(address indexed buyer, uint256 ethAmount, uint256 tokensReceived);
    event Graduated(uint256 totalRaised, uint256 tokensSold, address indexed pair, uint256 finalPrice);
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _imageUrl,
        string memory _description,
        address _creator,
        address _distributor,
        address _router,
        address _weth
    ) ERC20(_name, _symbol) {
        imageUrl = _imageUrl;
        description = _description;
        creator = _creator;
        distributor = _distributor;
        createdAt = block.timestamp;
        router = IUniswapV2Router02(_router);
        WETH = _weth;
        
        // Setup FHEVM
        uint256 chainId = block.chainid;
        if (chainId == 11155111) {
            FHE.setCoprocessor(ZamaConfig.getSepoliaConfig());
        } else if (chainId == 1) {
            FHE.setCoprocessor(ZamaConfig.getEthereumConfig());
        }
    }
    
    function protocolId() public view returns (uint256) {
        uint256 chainId = block.chainid;
        if (chainId == 11155111) return ZamaConfig.getSepoliaProtocolId();
        if (chainId == 1) return ZamaConfig.getEthereumProtocolId();
        return 0;
    }
    
    /**
     * @notice Buy tokens (amount is PUBLIC but tokens go to Distributor!)
     * @dev User sees deposit amount, but NOT token balance until claim
     */
    function buy(
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external payable nonReentrant {
        require(!isGraduated, "Already graduated");
        require(msg.value >= MIN_PURCHASE, "Below minimum");
        require(totalRaised < GRADUATION_THRESHOLD, "Target reached");
        
        // Handle refund
        uint256 remaining = GRADUATION_THRESHOLD - totalRaised;
        uint256 ethUsed = msg.value;
        uint256 refund = 0;
        
        if (msg.value > remaining) {
            ethUsed = remaining;
            refund = msg.value - remaining;
        }
        
        uint256 tokensToReceive = calculateTokensForEth(ethUsed);
        
        // Mint to distributor (NOT to buyer directly!)
        require(distributor != address(0), "Distributor not set");
        _mint(distributor, tokensToReceive);
        
        totalRaised += ethUsed;
        tokensSold += tokensToReceive;
        
        if (!hasContributed[msg.sender]) {
            hasContributed[msg.sender] = true;
            contributorCount++;
        }
        
        userTokenBalances[msg.sender] += tokensToReceive;
        
        // Store encrypted contribution (for receipt viewing)
        euint64 encAmount = FHE.fromExternal(encryptedAmount, inputProof);
        
        if (FHE.isInitialized(userContributions[msg.sender])) {
            userContributions[msg.sender] = FHE.add(userContributions[msg.sender], encAmount);
        } else {
            userContributions[msg.sender] = encAmount;
        }
        
        FHE.allow(userContributions[msg.sender], msg.sender);
        FHE.allowThis(userContributions[msg.sender]);
        
        emit Purchase(msg.sender, ethUsed, tokensToReceive);
        
        if (refund > 0) {
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "Refund failed");
        }
        
        if (totalRaised >= GRADUATION_THRESHOLD) {
            _graduate();
        }
    }
    
    function calculateTokensForEth(uint256 ethAmount) public view returns (uint256) {
        uint256 currentPrice = getCurrentPrice();
        return (ethAmount * 1e18) / currentPrice;
    }
    
    function getCurrentPrice() public view returns (uint256) {
        uint256 priceRange = INITIAL_PRICE * 9;
        uint256 priceIncrease = (totalRaised * priceRange) / GRADUATION_THRESHOLD;
        return INITIAL_PRICE + priceIncrease;
    }
    
    function getProgress() public view returns (uint256) {
        if (totalRaised >= GRADUATION_THRESHOLD) return 100;
        return (totalRaised * 100) / GRADUATION_THRESHOLD;
    }
    
    function getRemainingToGraduate() public view returns (uint256) {
        if (totalRaised >= GRADUATION_THRESHOLD) return 0;
        return GRADUATION_THRESHOLD - totalRaised;
    }
    
    function getMyContribution() external view returns (euint64) {
        return userContributions[msg.sender];
    }
    
    function getMyTokenBalance() external view returns (uint256) {
        return userTokenBalances[msg.sender];
    }
    
    function _graduate() internal {
        require(!isGraduated, "Already graduated");
        
        uint256 P_final = getCurrentPrice();
        uint256 ethLP = (totalRaised * 80) / 100;
        uint256 tokenLP = (ethLP * 1e18) / P_final;
        
        _mint(address(this), tokenLP);
        _approve(address(this), address(router), tokenLP);
        
        router.addLiquidityETH{value: ethLP}(
            address(this),
            tokenLP,
            (tokenLP * 99) / 100,
            (ethLP * 99) / 100,
            address(0),
            block.timestamp + 900
        );
        
        address pair = IUniswapV2Factory(router.factory()).getPair(address(this), WETH);
        isGraduated = true;
        
        emit Graduated(totalRaised, tokensSold, pair, P_final);
        
        uint256 remainingETH = address(this).balance;
        if (remainingETH > 0) {
            (bool success, ) = payable(creator).call{value: remainingETH}("");
            require(success, "ETH transfer failed");
        }
    }
    
    function graduate() external {
        require(msg.sender == creator, "Not creator");
        require(!isGraduated, "Already graduated");
        require(totalRaised >= GRADUATION_THRESHOLD, "Below threshold");
        _graduate();
    }
    
    function getTokenInfo() external view returns (
        string memory name_,
        string memory symbol_,
        string memory imageUrl_,
        string memory description_,
        address creator_,
        uint256 raised,
        uint256 sold,
        uint256 progress,
        uint256 currentPrice,
        uint256 contributors,
        bool graduated
    ) {
        return (
            name(),
            symbol(),
            imageUrl,
            description,
            creator,
            totalRaised,
            tokensSold,
            getProgress(),
            getCurrentPrice(),
            contributorCount,
            isGraduated
        );
    }
}

