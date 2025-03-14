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
  async function deployTokenFixture() {
    const NAME = "My Token";
    const SYMBOL = "MTKN";
    const DECIMALS = 10;
    const INITIAL_SUPPLY = 1000;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const token = await ethers.deployContract("$Token", [
      NAME,
      SYMBOL,
      DECIMALS,
      INITIAL_SUPPLY,
      owner.address,
    ]);

    return { token, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right name", async function () {
      const { token } = await loadFixture(deployTokenFixture);

      expect(await token.name()).to.equal("My Token");
    });

    it("Should set the right symbol", async function () {
      const { token } = await loadFixture(deployTokenFixture);

      expect(await token.symbol()).to.equal("MTKN");
    });

    it("Should set the right decimals", async function () {
      const { token } = await loadFixture(deployTokenFixture);

      expect(await token.decimals()).to.equal(10);
    });

    it("Should set the right initial supply", async function () {
      const { token } = await loadFixture(deployTokenFixture);

      expect(await token.totalSupply()).to.equal(1000);
    });

    it("Should mint the initial supply to the owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      expect(await token.balanceOf(owner.address)).to.equal(1000);
    });
  });

  describe("Transfer", function () {
    it("Should transfer tokens", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployTokenFixture);

      await expect (token.transfer(otherAccount.address, 100)).to.emit(token, "Transfer").withArgs(owner.address, otherAccount.address, 100);

      expect(await token.balanceOf(owner.address)).to.equal(900);
      expect(await token.balanceOf(otherAccount.address)).to.equal(100);
    });

    it("Should fail if not enough tokens", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployTokenFixture);

      await expect(token.transfer(otherAccount.address, 1001)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance"
      );
      expect (await token.balanceOf(otherAccount.address)).to.equal(0);
      expect (await token.balanceOf(owner.address)).to.equal(1000);
    });

    it("Should fail if the recipient is the zero address", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      await expect(token.transfer(ethers.ZeroAddress, 100)).to.be.revertedWith("ERC20: transfer to the zero address");
      expect(await token.balanceOf(owner.address)).to.equal(1000);
    });
  });

  describe("TransferFrom", function () {
    it("Should set allowance", async function () {
        const { token, owner, otherAccount } = await loadFixture(deployTokenFixture);
    
        await expect(token.approve(otherAccount.address, 100)).to.emit(token, "Approval").withArgs(owner.address, otherAccount.address, 100);
        expect(await token.allowance(owner.address, otherAccount.address)).to.equal(100);
    });
    
    it("Should fail for the zero address", async function () {
        const { token, owner } = await loadFixture(deployTokenFixture);
    
        await expect(token.approve(ethers.ZeroAddress, 100)).to.be.revertedWith("ERC20: approve to the zero address");
        expect(await token.allowance(owner.address, ethers.ZeroAddress)).to.equal(0);
    });

    it("Should fail from zero owner", async function () {
        const { token, owner } = await loadFixture(deployTokenFixture);
    
        await expect(token.$_approve(ethers.ZeroAddress, owner.address, 100)).to.be.revertedWith("ERC20: approve from the zero address");
    })

    it("Should transferFrom tokens", async function () {
        const { token, owner, otherAccount } = await loadFixture(deployTokenFixture);
    
        await token.approve(otherAccount.address, 100);
        await expect(token.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 100)).to.emit(token, "Transfer").withArgs(owner.address, otherAccount.address, 100);
    
        expect(await token.balanceOf(owner.address)).to.equal(900);
        expect(await token.balanceOf(otherAccount.address)).to.equal(100);
        expect(await token.allowance(owner.address, otherAccount.address)).to.equal(0);
    });

    it("Should fail if not enough tokens", async function () {
        const { token, owner, otherAccount } = await loadFixture(deployTokenFixture);
    
        await token.approve(otherAccount.address, 10000);
        await expect(token.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 1001)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    
        expect(await token.balanceOf(owner.address)).to.equal(1000);
        expect(await token.balanceOf(otherAccount.address)).to.equal(0);
        expect(await token.allowance(owner.address, otherAccount.address)).to.equal(10000);
    });

    it("Should fail if exceeding allowance", async function () {
        const { token, owner, otherAccount } = await loadFixture(deployTokenFixture);
    
        await token.approve(otherAccount.address, 100);
        await expect(token.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 101)).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
    
        expect(await token.balanceOf(owner.address)).to.equal(1000);
        expect(await token.balanceOf(otherAccount.address)).to.equal(0);
        expect(await token.allowance(owner.address, otherAccount.address)).to.equal(100);
    });

    it("Should fail for transfer to the zero address", async function () {
        const { token, owner, otherAccount } = await loadFixture(deployTokenFixture);
    
        await token.approve(otherAccount.address, 100);
        await expect(token.connect(otherAccount).transferFrom(owner.address, ethers.ZeroAddress, 100)).to.be.revertedWith("ERC20: transfer to the zero address");
    
        expect(await token.balanceOf(owner.address)).to.equal(1000);
        expect(await token.balanceOf(otherAccount.address)).to.equal(0);
        expect(await token.allowance(owner.address, otherAccount.address)).to.equal(100);
    });

    it("Should fail for transfer from the zero address", async function () {
        const { token, owner, otherAccount } = await loadFixture(deployTokenFixture);
    
        await token.approve(otherAccount.address, 0);
        await expect(token.connect(otherAccount).transferFrom(ethers.ZeroAddress, otherAccount.address, 0)).to.be.revertedWith("ERC20: transfer from the zero address");
    
        expect(await token.balanceOf(owner.address)).to.equal(1000);
        expect(await token.balanceOf(otherAccount.address)).to.equal(0);
    });
  });

  describe("Burning", function () {
    it("Burning should work", async function () {
        const { token, owner } = await loadFixture(deployTokenFixture);
    
        await expect (token.burn(100)).to.emit(token, "Transfer").withArgs(owner.address, ethers.ZeroAddress, 100);
        expect(await token.totalSupply()).to.equal(900);
        expect(await token.balanceOf(owner.address)).to.equal(900);
    });

    it("Should fail if not enough tokens", async function () {
        const { token, owner } = await loadFixture(deployTokenFixture);
    
        await expect(token.burn(1001)).to.be.revertedWith("ERC20: burn amount exceeds balance");
        expect(await token.totalSupply()).to.equal(1000);
        expect(await token.balanceOf(owner.address)).to.equal(1000);
    });

    it("Should fail for the zero address", async function () {
        const { token } = await loadFixture(deployTokenFixture);
    
        await expect(token.$_burn(ethers.ZeroAddress, 100)).to.be.revertedWith("ERC20: burn from the zero address");
        expect(await token.totalSupply()).to.equal(1000);
    });
  });

  describe("Minting", function () {
    it("Minting should work", async function () {
        const { token, owner } = await loadFixture(deployTokenFixture);
    
        await expect (token.$_mint(owner.address, 100)).to.emit(token, "Transfer").withArgs(ethers.ZeroAddress, owner.address, 100);
        expect(await token.totalSupply()).to.equal(1100);
        expect(await token.balanceOf(owner.address)).to.equal(1100);
    });

    it("Should fail for zero address", async function () {
        const {token, owner} = await loadFixture(deployTokenFixture);

        await expect (token.$_mint(ethers.ZeroAddress, 100)).to.be.revertedWith("ERC20: mint to the zero address");

        expect(await token.totalSupply()).to.equal(1000);
        expect(await token.balanceOf(owner.address)).to.equal(1000);
    });
  });
});