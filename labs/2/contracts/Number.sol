// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Number {
    uint private number;

    event NumberUpdated(uint newNumber);

    constructor () {
        number = 0;
    }

    function increment() public {
        number += 1;
        emit NumberUpdated(number);
    }

    function double() public {
        number *= 2;
        emit NumberUpdated(number);
    }

    function getNumber() public view returns (uint) {
        return number;
    }
}