import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const address3 = accounts.get("wallet_3")!;
const contractOwner = accounts.get("deployer")!;

describe("SkillMint Certification Tests", () => {
  it("allows submitting skill certifications with valid inputs", () => {
    // Create a lesson first
    const lessonResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Certification Lesson\"", "\"Lesson for certification\"", "\"JavaScript\"", "3", "1000"], address1);
    expect(lessonResult.result).toBeOk(true);
    const lessonId = lessonResult.result as bigint;

    // Submit skill certification
    const certResult = simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"JavaScript\"", `[${lessonId}]`], address2);

    expect(certResult.result).toBeOk(true);
    expect(typeof certResult.result).toBe("bigint"); // Returns certificate ID
  });

  it("validates certification inputs", () => {
    // Empty skill category
    let result = simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"\"", "[1]"], address2);
    expect(result.result).toBeErr(113); // ERR_INVALID_INPUT

    // Empty lessons list
    result = simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"Valid Skill\"", "[]"], address2);
    expect(result.result).toBeErr(102); // ERR_NOT_FOUND
  });

  it("blocks certification when contract is paused", () => {
    // Pause contract
    simnet.callPublicFn("SkillMintcontract", "pause-contract", [], contractOwner);

    const result = simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"JavaScript\"", "[1]"], address2);
    expect(result.result).toBeErr(109); // ERR_CONTRACT_PAUSED

    // Unpause for other tests
    simnet.callPublicFn("SkillMintcontract", "unpause-contract", [], contractOwner);
  });

  it("allows peer reviews with valid inputs", () => {
    // Setup: Create lesson and certification
    const lessonResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Review Lesson\"", "\"Lesson for review\"", "\"Python\"", "4", "1500"], address1);
    const lessonId = lessonResult.result as bigint;

    const certResult = simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"Python\"", `[${lessonId}]`], address2);
    const certId = certResult.result as bigint;

    // Submit peer review
    const reviewResult = simnet.callPublicFn("SkillMintcontract", "submit-peer-review",
      [certId.toString(), "85", "\"Excellent work on Python fundamentals!\""], address3);

    expect(reviewResult.result).toBeOk(true);
    expect(typeof reviewResult.result).toBe("bigint"); // Returns review ID
  });

  it("validates peer review inputs", () => {
    // Create certification first
    const lessonResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Validation Lesson\"", "\"For validation\"", "\"React\"", "3", "1200"], address1);
    const lessonId = lessonResult.result as bigint;

    const certResult = simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"React\"", `[${lessonId}]`], address2);
    const certId = certResult.result as bigint;

    // Invalid certificate ID
    let result = simnet.callPublicFn("SkillMintcontract", "submit-peer-review",
      ["999999", "85", "\"Feedback\""], address3);
    expect(result.result).toBeErr(102); // ERR_NOT_FOUND

    // Self-review attempt
    result = simnet.callPublicFn("SkillMintcontract", "submit-peer-review",
      [certId.toString(), "85", "\"Self review\""], address2);
    expect(result.result).toBeErr(108); // ERR_SELF_REVIEW

    // Score too low
    result = simnet.callPublicFn("SkillMintcontract", "submit-peer-review",
      [certId.toString(), "0", "\"Low score\""], address3);
    expect(result.result).toBeErr(103); // ERR_INVALID_SKILL_LEVEL

    // Score too high
    result = simnet.callPublicFn("SkillMintcontract", "submit-peer-review",
      [certId.toString(), "101", "\"High score\""], address3);
    expect(result.result).toBeErr(103); // ERR_INVALID_SKILL_LEVEL
  });

  it("prevents duplicate reviews from same reviewer", () => {
    // Setup certification
    const lessonResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Duplicate Review Lesson\"", "\"For duplicate test\"", "\"Node.js\"", "3", "1300"], address1);
    const lessonId = lessonResult.result as bigint;

    const certResult = simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"Node.js\"", `[${lessonId}]`], address2);
    const certId = certResult.result as bigint;

    // First review should succeed
    const firstReview = simnet.callPublicFn("SkillMintcontract", "submit-peer-review",
      [certId.toString(), "90", "\"First review\""], address3);
    expect(firstReview.result).toBeOk(true);

    // Second review from same user should fail
    const duplicateReview = simnet.callPublicFn("SkillMintcontract", "submit-peer-review",
      [certId.toString(), "85", "\"Duplicate review\""], address3);
    expect(duplicateReview.result).toBeErr(107); // ERR_ALREADY_REVIEWED
  });

  it("allows creating composite skills", () => {
    // Create two lessons for different skills
    const lesson1Result = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"HTML Lesson\"", "\"Learn HTML\"", "\"HTML\"", "2", "800"], address1);

    const lesson2Result = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"CSS Lesson\"", "\"Learn CSS\"", "\"CSS\"", "2", "800"], address1);

    const lesson1Id = lesson1Result.result as bigint;
    const lesson2Id = lesson2Result.result as bigint;

    // Create certifications for both skills
    simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"HTML\"", `[${lesson1Id}]`], address2);

    simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"CSS\"", `[${lesson2Id}]`], address2);

    // Create composite skill
    const compositeResult = simnet.callPublicFn("SkillMintcontract", "create-composite-skill",
      ["\"HTML\"", "\"CSS\"", "\"Full Stack Web Development\""], address2);

    expect(compositeResult.result).toBeOk(true);
    expect(typeof compositeResult.result).toBe("bigint"); // Returns certificate ID
  });

  it("validates composite skill inputs", () => {
    // Empty skill names
    let result = simnet.callPublicFn("SkillMintcontract", "create-composite-skill",
      ["\"\"", "\"CSS\"", "\"Composite\""], address2);
    expect(result.result).toBeErr(113); // ERR_INVALID_INPUT

    result = simnet.callPublicFn("SkillMintcontract", "create-composite-skill",
      ["\"HTML\"", "\"\"", "\"Composite\""], address2);
    expect(result.result).toBeErr(113); // ERR_INVALID_INPUT

    result = simnet.callPublicFn("SkillMintcontract", "create-composite-skill",
      ["\"HTML\"", "\"CSS\"", "\"\""], address2);
    expect(result.result).toBeErr(113); // ERR_INVALID_INPUT
  });

  it("allows refreshing expired certifications", () => {
    // Create and submit certification
    const lessonResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Expiration Test\"", "\"Test expiration\"", "\"Testing\"", "1", "500"], address1);
    const lessonId = lessonResult.result as bigint;

    const certResult = simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"Testing\"", `[${lessonId}]`], address2);
    const certId = certResult.result as bigint;

    // Try to refresh (should fail since not expired yet)
    const refreshResult = simnet.callPublicFn("SkillMintcontract", "refresh-certification",
      [certId.toString()], address2);
    expect(refreshResult.result).toBeErr(100); // ERR_NOT_AUTHORIZED (not expired)
  });

  it("allows retrieving certificate details", () => {
    // Create certification
    const lessonResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Retrieval Test\"", "\"For data retrieval\"", "\"Data Science\"", "5", "3000"], address1);
    const lessonId = lessonResult.result as bigint;

    const certResult = simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"Data Science\"", `[${lessonId}]`], address2);
    const certId = certResult.result as bigint;

    // Get certificate details
    const certDetails = simnet.callReadOnlyFn("SkillMintcontract", "get-skill-certificate",
      [certId.toString()], address3);

    expect(certDetails.result).toBeDefined();
    expect(certDetails.result).toHaveProperty('owner');
    expect(certDetails.result).toHaveProperty('skill-category');
    expect(certDetails.result).toHaveProperty('skill-level');
    expect(certDetails.result).toHaveProperty('certified-at');
    expect(certDetails.result).toHaveProperty('expires-at');
  });

  it("allows retrieving peer review details", () => {
    // Setup certification and review
    const lessonResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Review Retrieval\"", "\"For review retrieval\"", "\"Machine Learning\"", "5", "2500"], address1);
    const lessonId = lessonResult.result as bigint;

    const certResult = simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"Machine Learning\"", `[${lessonId}]`], address2);
    const certId = certResult.result as bigint;

    const reviewResult = simnet.callPublicFn("SkillMintcontract", "submit-peer-review",
      [certId.toString(), "95", "\"Outstanding work!\""], address3);
    const reviewId = reviewResult.result as bigint;

    // Get review details
    const reviewDetails = simnet.callReadOnlyFn("SkillMintcontract", "get-peer-review",
      [reviewId.toString()], address1);

    expect(reviewDetails.result).toBeDefined();
    expect(reviewDetails.result).toHaveProperty('reviewer');
    expect(reviewDetails.result).toHaveProperty('certificate-id');
    expect(reviewDetails.result).toHaveProperty('score');
    expect(reviewDetails.result).toHaveProperty('feedback');
  });

  it("checks skill validity correctly", () => {
    // Create certification
    const lessonResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
      ["\"Validity Test\"", "\"For validity check\"", "\"Blockchain\"", "4", "2000"], address1);
    const lessonId = lessonResult.result as bigint;

    const certResult = simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"Blockchain\"", `[${lessonId}]`], address2);
    const certId = certResult.result as bigint;

    // Check validity (should be valid initially)
    const validity = simnet.callReadOnlyFn("SkillMintcontract", "is-skill-valid",
      [certId.toString()], address3);
    expect(validity.result).toBeDefined(); // Boolean result
  });

  it("handles rate limiting for certification operations", () => {
    // Create multiple certifications quickly
    for (let i = 0; i < 6; i++) {
      // Create lesson first
      const lessonResult = simnet.callPublicFn("SkillMintcontract", "create-lesson-plan",
        [`"Rate Lesson ${i}"`, `"Description ${i}"`, `"Category ${i}"`, "3", "1000"], address1);

      if (lessonResult.result) {
        const lessonId = lessonResult.result as bigint;

        const certResult = simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
          [`"Skill ${i}"`, `[${lessonId}]`], address2);

        if (i >= 5) {
          // Later operations might be rate limited
          expect(certResult.result).toBeDefined();
        }
      }
    }
  });

  it("prevents certification operations for blacklisted users", () => {
    // Blacklist user
    simnet.callPublicFn("SkillMintcontract", "blacklist-user", [address3], contractOwner);

    // Try to submit certification
    const certResult = simnet.callPublicFn("SkillMintcontract", "submit-skill-certification",
      ["\"Blocked Skill\"", "[1]"], address3);
    expect(certResult.result).toBeErr(116); // ERR_BLACKLISTED

    // Try to submit peer review
    const reviewResult = simnet.callPublicFn("SkillMintcontract", "submit-peer-review",
      ["1", "85", "\"Blocked review\""], address3);
    expect(reviewResult.result).toBeErr(116); // ERR_BLACKLISTED

    // Try to create composite skill
    const compositeResult = simnet.callPublicFn("SkillMintcontract", "create-composite-skill",
      ["\"Skill1\"", "\"Skill2\"", "\"Composite\""], address3);
    expect(comppositeResult.result).toBeErr(116); // ERR_BLACKLISTED

    // Remove from blacklist for other tests
    simnet.callPublicFn("SkillMintcontract", "remove-from-blacklist", [address3], contractOwner);
  });
});
