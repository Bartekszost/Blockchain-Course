// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import { Strings } from '@openzeppelin/contracts/utils/Strings.sol';

contract NFT is IERC721 {
  string private _name;
  string private _symbol;

  mapping(uint256 => address) private _owners;
  mapping(address => uint256) private _balances;
  mapping(uint256 => address) private _tokenApprovals;
  mapping(address => mapping(address => bool)) private _operatorApprovals;

  constructor(string memory name_, string memory symbol_) {
    _name = name_;
    _symbol = symbol_;

    _mint(msg.sender, 0);
    _mint(msg.sender, 1);
    _mint(msg.sender, 2);
  }

  function name() public view returns (string memory) {
    return _name;
  }

  function symbol() public view returns (string memory) {
    return _symbol;
  }

  function tokenURI(uint256 tokenId) external view returns (string memory) {
    require(
      _owners[tokenId] != address(0),
      'ERC721Metadata: URI query for nonexistent token'
    );

    return
      string(
        abi.encodePacked(
          'http://localhost:8080/metadata/',
          Strings.toString(tokenId),
          '.json'
        )
      );
  }

  function balanceOf(address owner) external view returns (uint256 balance) {
    return _balances[owner];
  }

  function ownerOf(uint256 tokenId) external view returns (address owner) {
    return _owners[tokenId];
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual returns (bool) {
    return interfaceId == type(IERC721).interfaceId;
  }

  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes calldata data
  ) external {
    _safeTransferFrom(from, to, tokenId, data);
  }

  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId
  ) external {
    _safeTransferFrom(from, to, tokenId, '');
  }

  function _safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes memory data
  ) private {
    _transfer(from, to, tokenId);
  }

  function transferFrom(address from, address to, uint256 tokenId) external {
    _transfer(from, to, tokenId);
  }

  function approve(address to, uint256 tokenId) external {
    address owner = _owners[tokenId];
    require(to != owner, 'ERC721: approval to current owner');
    require(
      msg.sender == owner || isApprovedForAll(owner, msg.sender),
      'ERC721: approve caller is not owner nor approved for all'
    );
    _tokenApprovals[tokenId] = to;
    emit Approval(owner, to, tokenId);
  }

  function _isOwnerOrApproved(
    address spender,
    uint256 tokenId
  ) private view returns (bool) {
    address owner = _owners[tokenId];
    if (owner == spender) {
      return true;
    }

    address operator = _tokenApprovals[tokenId];
    if (operator == spender) {
      return true;
    }

    return isApprovedForAll(owner, spender);
  }

  function setApprovalForAll(address operator, bool approved) external {
    require(operator != msg.sender, 'ERC721: approve to caller');
    require(operator != address(0), 'ERC721: approve to the zero address');

    _operatorApprovals[msg.sender][operator] = approved;
    emit ApprovalForAll(msg.sender, operator, approved);
  }

  function getApproved(
    uint256 tokenId
  ) external view returns (address operator) {
    return _tokenApprovals[tokenId];
  }

  function isApprovedForAll(
    address owner,
    address operator
  ) public view returns (bool) {
    return _operatorApprovals[owner][operator];
  }

  function _transfer(address from, address to, uint256 tokenId) private {
    require(from != address(0), 'ERC721: transfer from the zero address');
    require(to != address(0), 'ERC721: transfer to the zero address');
    require(
      _isOwnerOrApproved(msg.sender, tokenId),
      'ERC721: transfer caller is not owner nor approved'
    );

    _owners[tokenId] = to;
    _balances[from] -= 1;
    _balances[to] += 1;

    _tokenApprovals[tokenId] = address(0);

    emit Transfer(from, to, tokenId);
  }

  function _mint(address to, uint256 tokenId) internal {
    require(to != address(0), 'ERC721: mint to the zero address');
    require(_owners[tokenId] == address(0), 'ERC721: token already minted');

    _owners[tokenId] = to;
    _balances[to] += 1;

    emit Transfer(address(0), to, tokenId);
  }

  function burn(uint256 tokenId) external {
    require(
      _isOwnerOrApproved(msg.sender, tokenId),
      'ERC721: burn caller is not owner nor approved'
    );

    _burn(tokenId);
  }

  function _burn(uint256 tokenId) internal {
    address owner = _owners[tokenId];
    require(owner != address(0), 'ERC721: burn of token that is not own');

    _owners[tokenId] = address(0);
    _balances[owner] -= 1;

    emit Transfer(owner, address(0), tokenId);
  }
}
