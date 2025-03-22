// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0;

import "../contracts/NFT.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/utils/math/SignedMath.sol";
import "@openzeppelin/contracts/utils/Panic.sol";

contract $NFT is NFT {
    bytes32 public constant __hh_exposed_bytecode_marker = "hardhat-exposed";

    constructor(string memory name_, string memory symbol_) NFT(name_, symbol_) payable {
    }

    function $c_418749dc(bytes8 c__418749dc) external pure {
        super.c_418749dc(c__418749dc);
    }

    function $c_true418749dc(bytes8 c__418749dc) external pure returns (bool ret0) {
        (ret0) = super.c_true418749dc(c__418749dc);
    }

    function $c_false418749dc(bytes8 c__418749dc) external pure returns (bool ret0) {
        (ret0) = super.c_false418749dc(c__418749dc);
    }

    function $_mint(address to,uint256 tokenId) external payable {
        super._mint(to,tokenId);
    }

    function $_burn(uint256 tokenId) external payable {
        super._burn(tokenId);
    }

    receive() external payable {}
}
