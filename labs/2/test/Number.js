const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");

describe("Number", function () {
    async function deployNumberFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();
    
        const Number = await ethers.getContractFactory("Number");
        const number = await Number.deploy();
    
        return { number, owner, otherAccount };
      }

    it("Should set the right number", async function () {
        const { number } = await loadFixture(deployNumberFixture);
    
        expect(await number.getNumber()).to.equal(0);
    });

    it("Should increment the number", async function () {
        const { number } = await loadFixture(deployNumberFixture);

        await expect(number.increment()).to.emit(number, "NumberUpdated").withArgs(1);
        expect(await number.getNumber()).to.equal(1);
    })

    it("Should double the number", async function () {
        const { number } = await loadFixture(deployNumberFixture);

        await number.increment();
    
        await expect(number.double()).to.emit(number, "NumberUpdated").withArgs(2);
    
        expect(await number.getNumber()).to.equal(2);
    })
})