// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

interface IMemeToken {
    function buyFromPool(address buyer, uint256 ethAmount, uint256 tokensReceived) external payable;
    function userTokenBalances(address user) external view returns (uint256);
}

