const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  
  describe("Token", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployNftFixture() {
      const NAME = "My NFT";
      const SYMBOL = "MNFT";
  
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();
  
      const nft = await ethers.deployContract("$NFT", [
        NAME,
        SYMBOL
      ]);
  
      return { nft, owner, otherAccount };
    }

    describe("Deployment", function () {
      it("Should set the right name", async function () {
        const { nft } = await loadFixture(deployNftFixture);
  
        expect(await nft.name()).to.equal("My NFT");
      });
  
      it("Should set the right symbol", async function () {
        const { nft } = await loadFixture(deployNftFixture);
  
        expect(await nft.symbol()).to.equal("MNFT");
      });

      it("Should mint a token", async function () {
        const { nft, owner } = await loadFixture(deployNftFixture);
  
        expect(await nft.balanceOf(owner.address)).to.equal(3);
        expect(await nft.ownerOf(0)).to.equal(owner.address);
        expect(await nft.ownerOf(1)).to.equal(owner.address);
        expect(await nft.ownerOf(2)).to.equal(owner.address);
      });

      it("Should support interface", async function () {
        const { nft } = await loadFixture(deployNftFixture);
  
        expect(await nft.supportsInterface("0x80ac58cd")).to.equal(true);
      });

      it("Token URI", async function () {
        const { nft } = await loadFixture(deployNftFixture);
  
        expect(await nft.tokenURI(0)).to.equal("http://localhost:8080/metadata/0.json");
      });

      it("Token URI if non existent", async function () {
        const { nft } = await loadFixture(deployNftFixture);
  
        await expect(nft.tokenURI(3)).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
      });

    });

    describe("Mint", function () {
      it("Should mint a token", async function () {
        const { nft, owner } = await loadFixture(deployNftFixture);
  
        await expect(nft.$_mint(owner.address, 3)).to.emit(nft, "Transfer").withArgs(ethers.ZeroAddress, owner.address, 3);
  
        expect(await nft.balanceOf(owner.address)).to.equal(4);
        expect(await nft.ownerOf(3)).to.equal(owner.address);
      });
  
      it("Should not mint a token token already minted", async function () {
        const { nft, owner } = await loadFixture(deployNftFixture);
  
        await expect(nft.$_mint(owner.address, 0)).to.be.revertedWith("ERC721: token already minted");
      });

      it("Should not mint to zero address", async function () {
        const { nft, owner } = await loadFixture(deployNftFixture);
  
        await expect(nft.$_mint(ethers.ZeroAddress, 3)).to.be.revertedWith("ERC721: mint to the zero address");
      });
    });

    describe("Burn", function () {
      it("Should burn a token", async function () {
        const { nft, owner } = await loadFixture(deployNftFixture);
  
        await expect(nft.burn(0)).to.emit(nft, "Transfer").withArgs(owner.address, ethers.ZeroAddress, 0);
  
        expect(await nft.balanceOf(owner.address)).to.equal(2);
        expect(await nft.ownerOf(0)).to.equal(ethers.ZeroAddress);
      });

      it("Should not burn a token without approval", async function () {
        const { nft, owner, otherAccount } = await loadFixture(deployNftFixture);

        await expect(nft.connect(otherAccount).burn(0)).to.be.revertedWith("ERC721: burn caller is not owner nor approved");
      });
  
      it("Should not burn a token token not owned", async function () {
        const { nft, owner } = await loadFixture(deployNftFixture);
  
        await expect(nft.$_burn(3)).to.be.revertedWith("ERC721: burn of token that is not own");
      });
    });

    describe("Transfer", function () {
      it("Should transfer a token", async function () {
        const { nft, owner, otherAccount } = await loadFixture(deployNftFixture);
    
        await expect(nft.transferFrom(owner.address, otherAccount.address, 0)).to.emit(nft, "Transfer").withArgs(owner.address, otherAccount.address, 0);
        
        expect(await nft.balanceOf(owner.address)).to.equal(2);
        expect(await nft.balanceOf(otherAccount.address)).to.equal(1);
        expect(await nft.ownerOf(0)).to.equal(otherAccount.address);
      });

      it("Should safe transfer a token", async function () {
        const { nft, owner, otherAccount } = await loadFixture(deployNftFixture);
        
        await expect(nft.safeTransferFrom(owner.address, otherAccount.address, 0)).to.emit(nft, "Transfer").withArgs(owner.address, otherAccount.address, 0);
        
        expect(await nft.balanceOf(owner.address)).to.equal(2);
        expect(await nft.balanceOf(otherAccount.address)).to.equal(1);
        expect(await nft.ownerOf(0)).to.equal(otherAccount.address);
      });

      it("Should safe transfer a token with data", async function () {
        const { nft, owner, otherAccount } = await loadFixture(deployNftFixture);

        const callData = ethers.toUtf8Bytes("Hello, world!");
        
        await expect(nft["safeTransferFrom(address,address,uint256,bytes)"](owner.address, otherAccount.address, 0, callData)).to.emit(nft, "Transfer").withArgs(owner.address, otherAccount.address, 0);
        
        expect(await nft.balanceOf(owner.address)).to.equal(2);
        expect(await nft.balanceOf(otherAccount.address)).to.equal(1);
        expect(await nft.ownerOf(0)).to.equal(otherAccount.address);
      });

      it("Should transfer if approved", async function () {
        const { nft, owner, otherAccount } = await loadFixture(deployNftFixture);
  
        await expect(nft.approve(otherAccount.address, 0)).to.emit(nft, "Approval").withArgs(owner.address, otherAccount.address, 0);
        await expect(nft.connect(otherAccount).safeTransferFrom(owner.address, otherAccount.address, 0)).to.emit(nft, "Transfer").withArgs(owner.address, otherAccount.address, 0);
  
        expect(await nft.balanceOf(owner.address)).to.equal(2);
        expect(await nft.balanceOf(otherAccount.address)).to.equal(1);
        expect(await nft.ownerOf(0)).to.equal(otherAccount.address);
      });

      it("Should transfer if operator", async function () {
        const { nft, owner, otherAccount } = await loadFixture(deployNftFixture);
  
        await expect(nft.setApprovalForAll(otherAccount.address, true)).to.emit(nft, "ApprovalForAll").withArgs(owner.address, otherAccount.address, true);
        await expect(nft.connect(otherAccount).safeTransferFrom(owner.address, otherAccount.address, 0)).to.emit(nft, "Transfer").withArgs(owner.address, otherAccount.address, 0);
  
        expect(await nft.balanceOf(owner.address)).to.equal(2);
        expect(await nft.balanceOf(otherAccount.address)).to.equal(1);
        expect(await nft.ownerOf(0)).to.equal(otherAccount.address);
      });

      if("Should not transfer if not owner or approved", async function () {
        const { nft, owner, otherAccount } = await loadFixture(deployNftFixture);
  
        await expect(nft.safeTransferFrom(otherAccount.address, owner.address, 0)).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
      });

      it("Should not transfer to zero address", async function () {
        const { nft, owner } = await loadFixture(deployNftFixture);
  
        await expect(nft.safeTransferFrom(owner.address, ethers.ZeroAddress, 0)).to.be.revertedWith("ERC721: transfer to the zero address");
      });

      it("Should not transfer from zero address", async function () {
        const { nft, owner } = await loadFixture(deployNftFixture);
  
        await expect(nft.safeTransferFrom(ethers.ZeroAddress, owner.address, 0)).to.be.revertedWith("ERC721: transfer from the zero address");
      });

      it("Should not transfer if not owner or approved", async function () {
        const { nft, owner, otherAccount } = await loadFixture(deployNftFixture);
  
        await expect(nft.connect(otherAccount).safeTransferFrom(owner.address, otherAccount.address, 0)).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
      });
    });

    describe("Approve", function () {
      it("Should approve a token", async function () {
        const { nft, owner, otherAccount } = await loadFixture(deployNftFixture);
  
        await expect(nft.approve(otherAccount.address, 0)).to.emit(nft, "Approval").withArgs(owner.address, otherAccount.address, 0);
  
        expect(await nft.getApproved(0)).to.equal(otherAccount.address);
      });

      it("Should approve all tokens", async function () {
        const { nft, owner, otherAccount } = await loadFixture(deployNftFixture);
  
        await expect(nft.setApprovalForAll(otherAccount.address, true)).to.emit(nft, "ApprovalForAll").withArgs(owner.address, otherAccount.address, true);
  
        expect(await nft.isApprovedForAll(owner.address, otherAccount.address)).to.equal(true);
      });

      it("Should be able to approve if operator", async function () {
        const { nft, owner, otherAccount } = await loadFixture(deployNftFixture);
  
        await expect(nft.setApprovalForAll(otherAccount.address, true)).to.emit(nft, "ApprovalForAll").withArgs(owner.address, otherAccount.address, true);
  
        expect(await nft.isApprovedForAll(owner.address, otherAccount.address)).to.equal(true);

        await expect(nft.connect(otherAccount).approve(otherAccount.address, 0)).to.emit(nft, "Approval").withArgs(owner.address, otherAccount.address, 0);
      });

      it("Should not approve if not owner or operator", async function () {
        const { nft, owner, otherAccount } = await loadFixture(deployNftFixture);
  
        await expect(nft.connect(otherAccount).approve(otherAccount.address, 0)).to.be.revertedWith("ERC721: approve caller is not owner nor approved for all");
      });

      it("Should not approve to oneself", async function () {
        const { nft, owner } = await loadFixture(deployNftFixture);
  
        await expect(nft.approve(owner.address, 0)).to.be.revertedWith("ERC721: approval to current owner");
      });

      it("Should not approve for all to oneself", async function () {
        const { nft, owner } = await loadFixture(deployNftFixture);
  
        await expect(nft.setApprovalForAll(owner.address, true)).to.be.revertedWith("ERC721: approve to caller");
      });

      it("Should not approve for all to zero address", async function () {
        const { nft, owner } = await loadFixture(deployNftFixture);
  
        await expect(nft.setApprovalForAll(ethers.ZeroAddress, true)).to.be.revertedWith("ERC721: approve to the zero address");
      });
    });
  });