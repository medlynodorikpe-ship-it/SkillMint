import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const address3 = accounts.get("wallet_3")!;
const contractOwner = accounts.get("deployer")!;

describe("SkillMint Security Tests", () => {
  it("ensures contract initializes with correct security settings", () => {
    // Check initial security state
    const paused = simnet.callReadOnlyFn("SkillMintcontract", "is-contract-paused", [], address1);
    expect(paused.result).toBeBool(false);

    const emergency = simnet.callReadOnlyFn("SkillMintcontract", "is-emergency-mode-enabled", [], address1);
    expect(emergency.result).toBeBool(false);

    const isOwnerAdmin = simnet.callReadOnlyFn("SkillMintcontract", "is-user-admin", [contractOwner], address1);
    expect(isOwnerAdmin.result).toBeBool(true);

    const minReviews = simnet.callReadOnlyFn("SkillMintcontract", "get-min-reviews-required", [], address1);
    expect(minReviews.result).toBeUint(3);

    const platformFee = simnet.callReadOnlyFn("SkillMintcontract", "get-platform-fee", [], address1);
    expect(platformFee.result).toBeUint(5);
  });

  it("allows contract owner to pause/unpause contract", () => {
    // Pause contract
    const pauseResult = simnet.callPublicFn("SkillMintcontract", "pause-contract", [], contractOwner);
    expect(pauseResult.result).toBeOk(true);

    let paused = simnet.callReadOnlyFn("SkillMintcontract", "is-contract-paused", [], address1);
    expect(paused.result).toBeBool(true);

    // Unpause contract
    const unpauseResult = simnet.callPublicFn("SkillMintcontract", "unpause-contract", [], contractOwner);
    expect(unpauseResult.result).toBeOk(true);

    paused = simnet.callReadOnlyFn("SkillMintcontract", "is-contract-paused", [], address1);
    expect(paused.result).toBeBool(false);
  });

  it("prevents non-owner from pausing contract", () => {
    const pauseResult = simnet.callPublicFn("SkillMintcontract", "pause-contract", [], address1);
    expect(pauseResult.result).toBeErr(100); // ERR_NOT_AUTHORIZED
  });

  it("allows admin to manage other admins", () => {
    // Add admin
    const addAdminResult = simnet.callPublicFn("SkillMintcontract", "add-admin", [address1], contractOwner);
    expect(addAdminResult.result).toBeOk(true);

    let isAdmin = simnet.callReadOnlyFn("SkillMintcontract", "is-user-admin", [address1], address2);
    expect(isAdmin.result).toBeBool(true);

    // Remove admin
    const removeAdminResult = simnet.callPublicFn("SkillMintcontract", "remove-admin", [address1], contractOwner);
    expect(removeAdminResult.result).toBeOk(true);

    isAdmin = simnet.callReadOnlyFn("SkillMintcontract", "is-user-admin", [address1], address2);
    expect(isAdmin.result).toBeBool(false);
  });

  it("prevents adding owner as admin", () => {
    const addOwnerResult = simnet.callPublicFn("SkillMintcontract", "add-admin", [contractOwner], contractOwner);
    expect(addOwnerResult.result).toBeErr(100); // ERR_NOT_AUTHORIZED
  });

  it("prevents removing owner admin", () => {
    const removeOwnerResult = simnet.callPublicFn("SkillMintcontract", "remove-admin", [contractOwner], contractOwner);
    expect(removeOwnerResult.result).toBeErr(100); // ERR_NOT_AUTHORIZED
  });

  it("allows admin to manage blacklist", () => {
    // Blacklist user
    const blacklistResult = simnet.callPublicFn("SkillMintcontract", "blacklist-user", [address2], contractOwner);
    expect(blacklistResult.result).toBeOk(true);

    let isBlacklisted = simnet.callReadOnlyFn("SkillMintcontract", "is-user-blacklisted", [address2], address1);
    expect(isBlacklisted.result).toBeBool(true);

    // Remove from blacklist
    const removeBlacklistResult = simnet.callPublicFn("SkillMintcontract", "remove-from-blacklist", [address2], contractOwner);
    expect(removeBlacklistResult.result).toBeOk(true);

    isBlacklisted = simnet.callReadOnlyFn("SkillMintcontract", "is-user-blacklisted", [address2], address1);
    expect(isBlacklisted.result).toBeBool(false);
  });

  it("prevents blacklisting contract owner", () => {
    const blacklistOwnerResult = simnet.callPublicFn("SkillMintcontract", "blacklist-user", [contractOwner], contractOwner);
    expect(blacklistOwnerResult.result).toBeErr(100); // ERR_NOT_AUTHORIZED
  });

  it("blocks blacklisted users from contract functions", () => {
    // Blacklist user
    simnet.callPublicFn("SkillMintcontract", "blacklist-user", [address2], contractOwner);

    // Try to create lesson plan
    const lessonResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Test Title\"", "\"Test Description\"", "\"Programming\"", "3", "1000"], address2);
    expect(lessonResult.result).toBeErr(116); // ERR_BLACKLISTED

    // Remove from blacklist for other tests
    simnet.callPublicFn("SkillMintcontract", "remove-from-blacklist", [address2], contractOwner);
  });

  it("allows emergency mode management", () => {
    // Enable emergency mode
    const enableResult = simnet.callPublicFn("SkillMintcontract", "enable-emergency-mode", [], contractOwner);
    expect(enableResult.result).toBeOk(true);

    let emergency = simnet.callReadOnlyFn("SkillMintcontract", "is-emergency-mode-enabled", [], address1);
    expect(emergency.result).toBeBool(true);

    // Disable emergency mode
    const disableResult = simnet.callPublicFn("SkillMintcontract", "disable-emergency-mode", [], contractOwner);
    expect(disableResult.result).toBeOk(true);

    emergency = simnet.callReadOnlyFn("SkillMintcontract", "is-emergency-mode-enabled", [], address1);
    expect(emergency.result).toBeBool(false);
  });

  it("allows emergency withdrawal only in emergency mode", () => {
    // Try emergency withdrawal without emergency mode
    const emergencyWithdrawFail = simnet.callPublicFn("SkillMintcontract", "emergency-withdraw", ["1000"], contractOwner);
    expect(emergencyWithdrawFail.result).toBeErr(115); // ERR_EMERGENCY_WITHDRAWAL

    // Enable emergency mode and try again
    simnet.callPublicFn("SkillMintcontract", "enable-emergency-mode", [], contractOwner);
    const emergencyWithdrawSuccess = simnet.callPublicFn("SkillMintcontract", "emergency-withdraw", ["1000"], contractOwner);
    expect(emergencyWithdrawSuccess.result).toBeOk(true);

    // Disable emergency mode
    simnet.callPublicFn("SkillMintcontract", "disable-emergency-mode", [], contractOwner);
  });

  it("allows admin to update configuration", () => {
    // Update min reviews
    const updateMinReviews = simnet.callPublicFn("SkillMintcontract", "update-min-reviews", ["5"], contractOwner);
    expect(updateMinReviews.result).toBeOk(true);

    let minReviews = simnet.callReadOnlyFn("SkillMintcontract", "get-min-reviews-required", [], address1);
    expect(minReviews.result).toBeUint(5);

    // Update max stake
    const updateMaxStake = simnet.callPublicFn("SkillMintcontract", "update-max-stake", ["2000000"], contractOwner);
    expect(updateMaxStake.result).toBeOk(true);

    let maxStake = simnet.callReadOnlyFn("SkillMintcontract", "get-max-stake-amount", [], address1);
    expect(maxStake.result).toBeUint(2000000);

    // Update platform fee
    const updatePlatformFee = simnet.callPublicFn("SkillMintcontract", "update-platform-fee", ["10"], contractOwner);
    expect(updatePlatformFee.result).toBeOk(true);

    let platformFee = simnet.callReadOnlyFn("SkillMintcontract", "get-platform-fee", [], address1);
    expect(platformFee.result).toBeUint(10);
  });

  it("prevents invalid configuration updates", () => {
    // Try zero min reviews
    const invalidMinReviews = simnet.callPublicFn("SkillMintcontract", "update-min-reviews", ["0"], contractOwner);
    expect(invalidMinReviews.result).toBeErr(113); // ERR_INVALID_INPUT

    // Try platform fee over 100%
    const invalidPlatformFee = simnet.callPublicFn("SkillMintcontract", "update-platform-fee", ["150"], contractOwner);
    expect(invalidPlatformFee.result).toBeErr(113); // ERR_INVALID_INPUT
  });

  it("enforces rate limiting", () => {
    // Create multiple lesson plans quickly to trigger rate limit
    for (let i = 0; i < 6; i++) {
      const result = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
        [`"Lesson ${i}"`, `"Description ${i}"`, `"Category ${i}"`, "3", "1000"], address1);
      if (i < 5) {
        expect(result.result).toBeOk(true);
      } else {
        // 6th operation should be rate limited
        expect(result.result).toBeErr(110); // ERR_RATE_LIMIT_EXCEEDED
      }
    }
  });

  it("provides rate limit monitoring functions", () => {
    const lastBlock = simnet.callReadOnlyFn("SkillMintcontract", "get-last-operation-block", [address1], address2);
    expect(lastBlock.result).toBeUint(simnet.blockHeight);

    const opsCount = simnet.callReadOnlyFn("SkillMintcontract", "get-operations-count", [address1, simnet.blockHeight.toString()], address2);
    expect(typeof opsCount.result).toBe("bigint");
  });
});
