// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0;

import "../contracts/Lock.sol";

contract $Lock is Lock {
    bytes32 public constant __hh_exposed_bytecode_marker = "hardhat-exposed";

    constructor(uint256 _unlockTime) Lock(_unlockTime) payable {
    }

    function $c_bd0b6143(bytes8 c__bd0b6143) external pure {
        super.c_bd0b6143(c__bd0b6143);
    }

    function $c_truebd0b6143(bytes8 c__bd0b6143) external pure returns (bool ret0) {
        (ret0) = super.c_truebd0b6143(c__bd0b6143);
    }

    function $c_falsebd0b6143(bytes8 c__bd0b6143) external pure returns (bool ret0) {
        (ret0) = super.c_falsebd0b6143(c__bd0b6143);
    }

    receive() external payable {}
}
