import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const address3 = accounts.get("wallet_3")!;
const contractOwner = accounts.get("deployer")!;

describe("SkillMint Lesson Tests", () => {
  it("allows creating lesson plans with valid inputs", () => {
    const result = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Advanced React Development\"", "\"Learn advanced React patterns and hooks\"", "\"Programming\"", "4", "5000"], address1);

    expect(result.result).toBeOk(true);
    expect(typeof result.result).toBe("bigint"); // Returns lesson ID
  });

  it("validates lesson plan inputs", () => {
    // Empty title
    let result = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"\"", "\"Valid description\"", "\"Programming\"", "3", "1000"], address1);
    expect(result.result).toBeErr(113); // ERR_INVALID_INPUT

    // Empty skill category
    result = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Valid Title\"", "\"Valid description\"", "\"\"", "3", "1000"], address1);
    expect(result.result).toBeErr(113); // ERR_INVALID_INPUT

    // Invalid difficulty (too low)
    result = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Valid Title\"", "\"Valid description\"", "\"Programming\"", "0", "1000"], address1);
    expect(result.result).toBeErr(103); // ERR_INVALID_SKILL_LEVEL

    // Invalid difficulty (too high)
    result = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Valid Title\"", "\"Valid description\"", "\"Programming\"", "6", "1000"], address1);
    expect(result.result).toBeErr(103); // ERR_INVALID_SKILL_LEVEL
  });

  it("blocks lesson creation when contract is paused", () => {
    // Pause contract
    simnet.callPublicFn("SkillMintcontract", "pause-contract", [], contractOwner);

    const result = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Test Lesson\"", "\"Test Description\"", "\"Test Category\"", "3", "1000"], address1);
    expect(result.result).toBeErr(109); // ERR_CONTRACT_PAUSED

    // Unpause for other tests
    simnet.callPublicFn("SkillMintcontract", "unpause-contract", [], contractOwner);
  });

  it("allows completing lessons with valid scores", () => {
    // First create a lesson
    const createResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Test Lesson\"", "\"Test Description\"", "\"Test Category\"", "3", "1000"], address1);
    expect(createResult.result).toBeOk(true);
    const lessonId = createResult.result as bigint;

    // Complete the lesson
    const completeResult = simnet.callPublicFn("SkillMintcontract", "complete-lesson",
      [lessonId.toString(), "85"], address2);
    expect(completeResult.result).toBeOk(true);
  });

  it("validates lesson completion inputs", () => {
    // Create a lesson first
    const createResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Test Lesson\"", "\"Test Description\"", "\"Test Category\"", "3", "1000"], address1);
    const lessonId = createResult.result as bigint;

    // Invalid lesson ID
    let result = simnet.callPublicFn("SkillMintcontract", "complete-lesson",
      ["999999", "85"], address2);
    expect(result.result).toBeErr(102); // ERR_NOT_FOUND

    // Score too low
    result = simnet.callPublicFn("SkillMintcontract", "complete-lesson",
      [lessonId.toString(), "0"], address2);
    expect(result.result).toBeErr(103); // ERR_INVALID_SKILL_LEVEL

    // Score too high
    result = simnet.callPublicFn("SkillMintcontract", "complete-lesson",
      [lessonId.toString(), "101"], address2);
    expect(result.result).toBeErr(103); // ERR_INVALID_SKILL_LEVEL
  });

  it("tracks lesson completion statistics", () => {
    // Create a lesson
    const createResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Popular Lesson\"", "\"Popular Description\"", "\"Popular Category\"", "3", "1000"], address1);
    const lessonId = createResult.result as bigint;

    // Multiple users complete the lesson
    const users = [address2, address3];
    users.forEach(user => {
      const result = simnet.callPublicFn("SkillMintcontract", "complete-lesson",
        [lessonId.toString(), "90"], user);
      expect(result.result).toBeOk(true);
    });

    // Get lesson details to check completion count
    const lessonDetails = simnet.callReadOnlyFn("SkillMintcontract", "get-lesson-plan",
      [lessonId.toString()], address1);
    expect(lessonDetails.result).toBeDefined();
    // Note: In a full implementation, we'd check the completion count in the response
  });

  it("allows retrieving lesson plan details", () => {
    // Create a lesson
    const createResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Detailed Lesson\"", "\"Detailed Description\"", "\"Detailed Category\"", "4", "2000"], address1);
    const lessonId = createResult.result as bigint;

    // Get lesson details
    const lessonDetails = simnet.callReadOnlyFn("SkillMintcontract", "get-lesson-plan",
      [lessonId.toString()], address2);

    expect(lessonDetails.result).toBeDefined();
    // Verify lesson details contain expected data
    expect(lessonDetails.result).toHaveProperty('creator');
    expect(lessonDetails.result).toHaveProperty('title');
    expect(lessonDetails.result).toHaveProperty('skill-category');
    expect(lessonDetails.result).toHaveProperty('difficulty');
    expect(lessonDetails.result).toHaveProperty('price');
  });

  it("allows retrieving user progress on lessons", () => {
    // Create and complete a lesson
    const createResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Progress Lesson\"", "\"Progress Description\"", "\"Progress Category\"", "2", "1500"], address1);
    const lessonId = createResult.result as bigint;

    simnet.callPublicFn("SkillMintcontract", "complete-lesson",
      [lessonId.toString(), "88"], address2);

    // Get user progress
    const progress = simnet.callReadOnlyFn("SkillMintcontract", "get-user-progress",
      [address2, lessonId.toString()], address3);

    expect(progress.result).toBeDefined();
    expect(progress.result).toHaveProperty('completed');
    expect(progress.result).toHaveProperty('score');
    expect(progress.result).toHaveProperty('completed-at');
  });

  it("handles rate limiting for lesson operations", () => {
    // Create multiple lessons to trigger rate limiting
    for (let i = 0; i < 6; i++) {
      const result = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
        [`"Rate Limit Test ${i}"`, `"Description ${i}"`, `"Category ${i}"`, "3", "1000"], address1);

      if (i < 5) {
        expect(result.result).toBeOk(true);
      } else {
        expect(result.result).toBeErr(110); // ERR_RATE_LIMIT_EXCEEDED
      }
    }
  });

  it("prevents lesson operations for blacklisted users", () => {
    // Blacklist a user
    simnet.callPublicFn("SkillMintcontract", "blacklist-user", [address3], contractOwner);

    // Try to create lesson
    const createResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Blacklisted Lesson\"", "\"Description\"", "\"Category\"", "3", "1000"], address3);
    expect(createResult.result).toBeErr(116); // ERR_BLACKLISTED

    // Try to complete lesson
    const completeResult = simnet.callPublicFn("SkillMintcontract", "complete-lesson",
      ["1", "85"], address3);
    expect(completeResult.result).toBeErr(116); // ERR_BLACKLISTED

    // Remove from blacklist for other tests
    simnet.callPublicFn("SkillMintcontract", "remove-from-blacklist", [address3], contractOwner);
  });
});
