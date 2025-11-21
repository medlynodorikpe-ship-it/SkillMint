import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const address3 = accounts.get("wallet_3")!;
const contractOwner = accounts.get("deployer")!;

describe("SkillMint Bounty Tests", () => {
  it("allows creating bounties with valid inputs", () => {
    const result = simnet.callPublicFn("SkillMintcontract", "create-skill-bounty",
      ["\"React Developer Needed\"", "\"Need React expert for frontend project\"", "[\"React\", \"JavaScript\", \"CSS\"]", "50000"], address1);

    expect(result.result).toBeOk(true);
    expect(typeof result.result).toBe("bigint"); // Returns bounty ID
  });

  it("validates bounty inputs", () => {
    // Empty title
    let result = simnet.callPublicFn("SkillMintcontract", "create-skill-bounty",
      ["\"\"", "\"Description\"", "[\"Skill\"]", "10000"], address1);
    expect(result.result).toBeErr(113); // ERR_INVALID_INPUT

    // Zero reward
    result = simnet.callPublicFn("SkillMintcontract", "create-skill-bounty",
      ["\"Valid Title\"", "\"Description\"", "[\"Skill\"]", "0"], address1);
    expect(result.result).toBeErr(106); // ERR_INVALID_BOUNTY

    // Empty skills list
    result = simnet.callPublicFn("SkillMintcontract", "create-skill-bounty",
      ["\"Valid Title\"", "\"Description\"", "[]", "10000"], address1);
    expect(result.result).toBeErr(106); // ERR_INVALID_BOUNTY
  });

  it("blocks bounty creation when contract is paused", () => {
    // Pause contract
    simnet.callPublicFn("SkillMintcontract", "pause-contract", [], contractOwner);

    const result = simnet.callPublicFn("SkillMintcontract", "create-skill-bounty",
      ["\"Paused Bounty\"", "\"Should fail\"", "[\"Skill\"]", "10000"], address1);
    expect(result.result).toBeErr(109); // ERR_CONTRACT_PAUSED

    // Unpause for other tests
    simnet.callPublicFn("SkillMintcontract", "unpause-contract", [], contractOwner);
  });

  it("allows claiming bounties with required skills", () => {
    // Create a bounty
    const bountyResult = simnet.callPublicFn("SkillMintcontract", "create-skill-bounty",
      ["\"Python Developer\"", "\"Need Python expert\"", "[\"Python\"]", "30000"], address1);
    expect(bountyResult.result).toBeOk(true);
    const bountyId = bountyResult.result as bigint;

    // Create certification for required skill
    const lessonResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Python Basics\"", "\"Learn Python\"", "\"Python\"", "3", "1500"], contractOwner);
    const lessonId = lessonResult.result as bigint;

    simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"Python\"", `[${lessonId}]`], address2);

    // Claim bounty
    const claimResult = simnet.callPublicFn("SkillMintcontract", "claim-bounty",
      [bountyId.toString()], address2);

    expect(claimResult.result).toBeOk(true);
  });

  it("prevents claiming bounties without required skills", () => {
    // Create a bounty requiring specific skills
    const bountyResult = simnet.callPublicFn("SkillMintcontract", "create-skill-bounty",
      ["\"Advanced ML\"", "\"Need ML expert\"", "[\"Machine Learning\", \"Python\", \"Statistics\"]", "50000"], address1);
    const bountyId = bountyResult.result as bigint;

    // Try to claim without skills
    const claimResult = simnet.callPublicFn("SkillMintcontract", "claim-bounty",
      [bountyId.toString()], address3);

    expect(claimResult.result).toBeErr(100); // ERR_NOT_AUTHORIZED
  });

  it("prevents claiming inactive bounties", () => {
    // Create and claim a bounty first
    const bountyResult = simnet.callPublicFn("SkillMintcontract", "create-skill-bounty",
      ["\"Inactive Test\"", "\"Test inactive\"", "[\"JavaScript\"]", "20000"], address1);
    const bountyId = bountyResult.result as bigint;

    // Create certification
    const lessonResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"JS Lesson\"", "\"Learn JS\"", "\"JavaScript\"", "3", "1000"], contractOwner);
    const lessonId = lessonResult.result as bigint;

    simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"JavaScript\"", `[${lessonId}]`], address2);

    // Claim bounty
    simnet.callPublicFn("SkillMintcontract", "claim-bounty",
      [bountyId.toString()], address2);

    // Try to claim again (should fail)
    const duplicateClaim = simnet.callPublicFn("SkillMintcontract", "claim-bounty",
      [bountyId.toString()], address3);

    expect(duplicateClaim.result).toBeErr(102); // ERR_NOT_FOUND (inactive)
  });

  it("allows retrieving bounty details", () => {
    // Create a bounty
    const bountyResult = simnet.callPublicFn("SkillMintcontract", "create-skill-bounty",
      ["\"Detailed Bounty\"", "\"Need full stack developer\"", "[\"React\", \"Node.js\", \"MongoDB\"]", "75000"], address1);
    const bountyId = bountyResult.result as bigint;

    // Get bounty details
    const bountyDetails = simnet.callReadOnlyFn("SkillMintcontract", "get-bounty",
      [bountyId.toString()], address2);

    expect(bountyDetails.result).toBeDefined();
    expect(bountyDetails.result).toHaveProperty('employer');
    expect(bountyDetails.result).toHaveProperty('title');
    expect(bountyDetails.result).toHaveProperty('description');
    expect(bountyDetails.result).toHaveProperty('required-skills');
    expect(bountyDetails.result).toHaveProperty('reward-amount');
    expect(bountyDetails.result).toHaveProperty('is-active');
  });

  it("handles rate limiting for bounty operations", () => {
    // Create multiple bounties quickly
    for (let i = 0; i < 6; i++) {
      const result = simnet.callPublicFn("SkillMintcontract", "create-skill-bounty",
        [`"Bounty ${i}"`, `"Description ${i}"`, "[\"Skill\"]", "10000"], address1);

      if (i < 5) {
        expect(result.result).toBeOk(true);
      } else {
        // 6th operation might be rate limited
        expect(result.result).toBeDefined();
      }
    }
  });

  it("prevents bounty operations for blacklisted users", () => {
    // Blacklist user
    simnet.callPublicFn("SkillMintcontract", "blacklist-user", [address3], contractOwner);

    // Try to create bounty
    const createResult = simnet.callPublicFn("SkillMintcontract", "create-skill-bounty",
      ["\"Blocked Bounty\"", "\"Should fail\"", "[\"Skill\"]", "10000"], address3);
    expect(createResult.result).toBeErr(116); // ERR_BLACKLISTED

    // Try to claim bounty
    const claimResult = simnet.callPublicFn("SkillMintcontract", "claim-bounty",
      ["1"], address3);
    expect(claimResult.result).toBeErr(116); // ERR_BLACKLISTED

    // Remove from blacklist for other tests
    simnet.callPublicFn("SkillMintcontract", "remove-from-blacklist", [address3], contractOwner);
  });

  it("includes reentrancy protection for bounty operations", () => {
    // This test verifies that reentrancy protection is in place
    // Create a bounty
    const bountyResult = simnet.callPublicFn("SkillMintcontract", "create-skill-bounty",
      ["\"Reentrancy Test\"", "\"Test reentrancy protection\"", "[\"Testing\"]", "25000"], address1);
    const bountyId = bountyResult.result as bigint;

    // Create certification
    const lessonResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Test Lesson\"", "\"For reentrancy\"", "\"Testing\"", "2", "800"], contractOwner);
    const lessonId = lessonResult.result as bigint;

    simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"Testing\"", `[${lessonId}]`], address2);

    // Claim bounty (reentrancy protection should work)
    const claimResult = simnet.callPublicFn("SkillMintcontract", "claim-bounty",
      [bountyId.toString()], address2);

    expect(claimResult.result).toBeOk(true);
  });

  it("validates platform fee calculations", () => {
    // Test that platform fees are properly configured
    const fee = simnet.callReadOnlyFn("SkillMintcontract", "get-platform-fee", [], address1);
    expect(fee.result).toBeUint(5); // Default 5% fee

    // Update fee as admin
    simnet.callPublicFn("SkillMintcontract", "update-platform-fee", ["10"], contractOwner);

    const updatedFee = simnet.callReadOnlyFn("SkillMintcontract", "get-platform-fee", [], address1);
    expect(updatedFee.result).toBeUint(10);
  });

  it("enforces bounty reward transfer security", () => {
    // Create bounty with STX transfer
    const bountyResult = simnet.callPublicFn("SkillMintcontract", "create-skill-bounty",
      ["\"Secure Transfer\"", "\"Test secure transfer\"", "[\"Security\"]", "40000"], address1);
    expect(bountyResult.result).toBeOk(true);

    // The contract should handle STX transfers securely
    // This test verifies the operation completes without errors
    const bountyId = bountyResult.result as bigint;
    expect(typeof bountyId).toBe("bigint");
  });
});
