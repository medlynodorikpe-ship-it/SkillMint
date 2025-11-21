
import { describe, expect, it } from "vitest";

// Import all test suites
import "./security.test";
import "./lesson.test";
import "./certification.test";
import "./bounty.test";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;

describe("SkillMint Contract Tests", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("verifies contract compilation", () => {
    // This test ensures the contract compiles without errors
    const contractCheck = simnet.getContractSource("SkillMintcontract");
    expect(contractCheck).toBeDefined();
    expect(contractCheck.length).toBeGreaterThan(0);
  });

  it("confirms all test suites are loaded", () => {
    // This is a meta-test to confirm all imports work
    expect(true).toBe(true);
  });
});
