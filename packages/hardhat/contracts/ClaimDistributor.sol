// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IMemeToken.sol";

/**
 * @title ClaimDistributor
 * @notice Holds tokens and allows users to claim to any address
 * @dev Separates "buying address" from "holding address" for privacy
 */
contract ClaimDistributor is ReentrancyGuard {
    
    address public memeToken;
    
    // Track claims
    mapping(address => mapping(address => uint256)) public claimed; // user => destination => amount
    mapping(address => uint256) public totalClaimed;
    
    event Claimed(
        address indexed user,
        address indexed destination,
        uint256 amount
    );
    
    constructor(address _memeToken) {
        memeToken = _memeToken;
    }
    
    /**
     * @notice Claim tokens to any address
     * @param amount Amount to claim
     * @param destination Address to send tokens to
     */
    function claim(
        uint256 amount,
        address destination,
        bytes calldata /* signature */
    ) external nonReentrant {
        require(destination != address(0), "Invalid destination");
        require(amount > 0, "Amount must be > 0");
        
        // Get user's balance from MemeToken
        uint256 userBalance = IMemeToken(memeToken).userTokenBalances(msg.sender);
        uint256 alreadyClaimed = totalClaimed[msg.sender];
        uint256 available = userBalance - alreadyClaimed;
        
        require(amount <= available, "Insufficient balance");
        
        // Mark as claimed
        claimed[msg.sender][destination] += amount;
        totalClaimed[msg.sender] += amount;
        
        // Transfer tokens
        require(
            IERC20(memeToken).transfer(destination, amount),
            "Transfer failed"
        );
        
        emit Claimed(msg.sender, destination, amount);
    }
    
    /**
     * @notice Claim all available tokens to destination
     */
    function claimAll(address destination) external {
        uint256 userBalance = IMemeToken(memeToken).userTokenBalances(msg.sender);
        uint256 alreadyClaimed = totalClaimed[msg.sender];
        uint256 available = userBalance - alreadyClaimed;
        
        require(available > 0, "Nothing to claim");
        
        claimed[msg.sender][destination] += available;
        totalClaimed[msg.sender] += available;
        
        require(
            IERC20(memeToken).transfer(destination, available),
            "Transfer failed"
        );
        
        emit Claimed(msg.sender, destination, available);
    }
    
    /**
     * @notice Get claimable amount for user
     */
    function getClaimable(address user) external view returns (uint256) {
        uint256 userBalance = IMemeToken(memeToken).userTokenBalances(user);
        uint256 alreadyClaimed = totalClaimed[user];
        return userBalance - alreadyClaimed;
    }
    
    function setMemeToken(address _memeToken) external {
        require(memeToken == address(0), "Already set");
        memeToken = _memeToken;
    }
}

