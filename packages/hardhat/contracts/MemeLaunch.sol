// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title MemeLaunch - Confidential Fair Launch Platform
 * @notice Fair meme token launches with private contributions using FHE
 * @dev Individual contribution amounts are encrypted, only totals revealed
 */
contract MemeLaunch is SepoliaConfig {
    
    struct Launch {
        string name;
        string symbol;
        string imageUrl;
        string description;
        address creator;
        uint256 targetAmount;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 contributorCount;
    }
    
    // Launch storage
    mapping(uint256 => Launch) public launches;
    mapping(uint256 => mapping(address => euint64)) private contributions;
    mapping(uint256 => mapping(address => bool)) public hasContributed;
    mapping(uint256 => euint64) private encryptedTotals;
    
    uint256 public nextLaunchId;
    uint256 public constant LAUNCH_DURATION = 1 hours;
    uint256 public constant MIN_CONTRIBUTION = 0.001 ether;
    
    event LaunchCreated(uint256 indexed launchId, string name, address creator);
    event Contributed(uint256 indexed launchId, address contributor);
    event LaunchEnded(uint256 indexed launchId);
    
    /**
     * @notice Create new meme launch
     */
    function createLaunch(
        string memory name,
        string memory symbol,
        string memory imageUrl,
        string memory description,
        uint256 targetAmount
    ) external returns (uint256) {
        uint256 launchId = nextLaunchId++;
        
        launches[launchId] = Launch({
            name: name,
            symbol: symbol,
            imageUrl: imageUrl,
            description: description,
            creator: msg.sender,
            targetAmount: targetAmount,
            startTime: block.timestamp,
            endTime: block.timestamp + LAUNCH_DURATION,
            isActive: true,
            contributorCount: 0
        });
        
        // Initialize encrypted total
        encryptedTotals[launchId] = FHE.asEuint64(0);
        FHE.allowThis(encryptedTotals[launchId]);
        
        emit LaunchCreated(launchId, name, msg.sender);
        return launchId;
    }
    
    /**
     * @notice Contribute with encrypted amount
     */
    function contribute(
        uint256 launchId,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external payable {
        Launch storage launch = launches[launchId];
        require(launch.isActive, "Not active");
        require(block.timestamp < launch.endTime, "Ended");
        require(msg.value >= MIN_CONTRIBUTION, "Too small");
        
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        
        if (!hasContributed[launchId][msg.sender]) {
            hasContributed[launchId][msg.sender] = true;
            launch.contributorCount++;
        }
        
        contributions[launchId][msg.sender] = FHE.add(
            contributions[launchId][msg.sender],
            amount
        );
        
        encryptedTotals[launchId] = FHE.add(encryptedTotals[launchId], amount);
        
        FHE.allow(contributions[launchId][msg.sender], msg.sender);
        FHE.allowThis(contributions[launchId][msg.sender]);
        FHE.allowThis(encryptedTotals[launchId]);
        
        emit Contributed(launchId, msg.sender);
    }
    
    /**
     * @notice Get my encrypted contribution (private receipt)
     */
    function getMyContribution(uint256 launchId) external view returns (euint64) {
        return contributions[launchId][msg.sender];
    }
    
    /**
     * @notice Get encrypted total
     */
    function getEncryptedTotal(uint256 launchId) external view returns (euint64) {
        return encryptedTotals[launchId];
    }
    
    /**
     * @notice End launch
     */
    function endLaunch(uint256 launchId) external {
        Launch storage launch = launches[launchId];
        require(block.timestamp >= launch.endTime || msg.sender == launch.creator, "Not time");
        
        launch.isActive = false;
        emit LaunchEnded(launchId);
    }
}

