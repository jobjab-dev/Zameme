// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "./MemeToken.sol";
import "./ClaimDistributor.sol";

/**
 * @title MemeFactory - Factory for creating meme tokens
 * @notice Deploys MemeToken + ClaimDistributor (privacy via delayed claim)
 */
contract MemeFactory {
    
    address public immutable router;
    address public immutable weth;
    
    struct TokenInfo {
        address token;
        address distributor;
    }
    
    address[] public allTokens;
    mapping(address => TokenInfo) public tokenInfo;
    mapping(string => bool) private symbolUsed;
    
    event TokenCreated(
        address indexed tokenAddress,
        address indexed distributorAddress,
        string name,
        string symbol,
        address creator,
        uint256 tokenId
    );
    
    constructor(address _router, address _weth) {
        router = _router;
        weth = _weth;
    }
    
    function createToken(
        string memory name,
        string memory symbol,
        string memory imageUrl,
        string memory description
    ) external returns (
        address tokenAddress,
        address distributorAddress
    ) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(symbol).length >= 3 && bytes(symbol).length <= 8, "Symbol must be 3-8 chars");
        require(_isValidSymbol(symbol), "Symbol: only A-Z and 0-9");
        require(!symbolUsed[symbol], "Symbol already used");
        require(bytes(imageUrl).length > 0, "Image required");
        
        // 1. Deploy ClaimDistributor first
        ClaimDistributor distributor = new ClaimDistributor(address(0));
        distributorAddress = address(distributor);
        
        // 2. Deploy MemeToken
        MemeToken token = new MemeToken(
            name,
            symbol,
            imageUrl,
            description,
            msg.sender,
            distributorAddress,
            router,
            weth
        );
        tokenAddress = address(token);
        
        // 3. Link back to distributor
        distributor.setMemeToken(tokenAddress);
        
        // Store info
        allTokens.push(tokenAddress);
        tokenInfo[tokenAddress] = TokenInfo({
            token: tokenAddress,
            distributor: distributorAddress
        });
        symbolUsed[symbol] = true;
        
        emit TokenCreated(
            tokenAddress,
            distributorAddress,
            name,
            symbol,
            msg.sender,
            allTokens.length - 1
        );
        
        return (tokenAddress, distributorAddress);
    }
    
    function _isValidSymbol(string memory symbol) private pure returns (bool) {
        bytes memory b = bytes(symbol);
        for (uint i = 0; i < b.length; i++) {
            bytes1 char = b[i];
            bool isUppercase = (char >= 0x41 && char <= 0x5A);
            bool isDigit = (char >= 0x30 && char <= 0x39);
            if (!isUppercase && !isDigit) {
                return false;
            }
        }
        return true;
    }
    
    function getTotalTokens() external view returns (uint256) {
        return allTokens.length;
    }
    
    function getTokenAddress(uint256 index) external view returns (address) {
        require(index < allTokens.length, "Index out of bounds");
        return allTokens[index];
    }
    
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }
    
    function getTokenInfo(address tokenAddress) external view returns (TokenInfo memory) {
        return tokenInfo[tokenAddress];
    }
}

