import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("KingOfTheFools", function () {
  async function deployKingOfTheFools() {
    // Contracts are deployed using the first signer/account by default
    const [owner, acc1] = await ethers.getSigners();

    const KingOfTheFools = await ethers.getContractFactory("KingOfTheFools");
    const kingOfTheFools = await KingOfTheFools.deploy();

    return { kingOfTheFools, owner, acc1 };
  }

  describe("Deployment", function () {
    it("Should set the right initial values", async function () {
      const { kingOfTheFools, owner } = await loadFixture(deployKingOfTheFools);

      expect(await kingOfTheFools.owner()).to.equal(owner.address);
      expect(await kingOfTheFools.king()).to.equal(
        ethers.constants.AddressZero
      );
      expect(await kingOfTheFools.lastDeposit()).to.equal(0);
    });
  });

  describe("Deposit", function () {
    it("Should revert if no ETH was transferred", async function () {
      const { kingOfTheFools } = await loadFixture(deployKingOfTheFools);
      await expect(kingOfTheFools.deposit()).to.be.revertedWithCustomError(
        kingOfTheFools,
        "InsufficientFund"
      );
    });

    it("Should allow first deposit with any amount", async function () {
      const amount = ethers.utils.parseEther("0.1");
      const { kingOfTheFools, owner } = await loadFixture(deployKingOfTheFools);
      await expect(
        kingOfTheFools.deposit({ value: amount })
      ).changeEtherBalances([owner, kingOfTheFools], [amount.mul(-1), amount]);

      expect(await kingOfTheFools.king()).to.eq(owner.address);
      expect(await kingOfTheFools.lastDeposit()).to.eq(amount);
    });

    it("Should allow deposit only if msg.value is at least 1.5x than previous one", async function () {
      const amount = ethers.utils.parseEther("0.1");
      const { kingOfTheFools, owner, acc1 } = await loadFixture(
        deployKingOfTheFools
      );
      await kingOfTheFools.deposit({ value: amount });

      await expect(
        kingOfTheFools.connect(acc1).deposit({ value: amount })
      ).to.be.revertedWithCustomError(kingOfTheFools, "InsufficientFund");

      await expect(
        kingOfTheFools.connect(acc1).deposit({ value: amount.mul(2) })
      ).changeEtherBalances(
        [owner, acc1, kingOfTheFools],
        [amount.mul(2), amount.mul(-2), 0]
      );

      expect(await kingOfTheFools.king()).to.eq(acc1.address);
      expect(await kingOfTheFools.lastDeposit()).to.eq(amount.mul(2));
    });
  });
});
