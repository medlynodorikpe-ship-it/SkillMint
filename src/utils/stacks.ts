import {
  StacksTestnet,
  StacksMainnet,
  callReadOnlyFunction,
  cvToValue,
  contractPrincipalCV,
  uintCV,
  stringAsciiCV,
  listCV,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  createAssetInfo,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { userSession } from './wallet';
import type { ContractCall, StacksNetwork } from '../types';

const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Update with actual deployed address
const CONTRACT_NAME = 'SkillMintcontract';

export const NETWORK = new StacksTestnet(); // Change to StacksMainnet for production

// Contract interaction utilities
export async function callReadOnlyContractFunction(
  functionName: string,
  functionArgs: any[] = []
) {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName,
      functionArgs,
      network: NETWORK,
    });

    return cvToValue(result);
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    throw error;
  }
}

export async function callContractFunction(
  functionName: string,
  functionArgs: any[] = [],
  postConditions: any[] = []
) {
  if (!userSession.isUserSignedIn()) {
    throw new Error('User not signed in');
  }

  const contractCallOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName,
    functionArgs,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    postConditions,
  };

  return openContractCall(contractCallOptions);
}

// Lesson functions
export async function getLessonPlan(lessonId: number) {
  return callReadOnlyContractFunction('get-lesson-plan', [uintCV(lessonId)]);
}

export async function createLessonPlan(
  title: string,
  description: string,
  skillCategory: string,
  difficulty: number,
  price: number
) {
  const functionArgs = [
    stringAsciiCV(title),
    stringAsciiCV(description),
    stringAsciiCV(skillCategory),
    uintCV(difficulty),
    uintCV(price),
  ];

  return callContractFunction('create-lesson-plan', functionArgs);
}

export async function completeLesson(lessonId: number, score: number) {
  const functionArgs = [uintCV(lessonId), uintCV(score)];
  return callContractFunction('complete-lesson', functionArgs);
}

// Certificate functions
export async function getSkillCertificate(certificateId: number) {
  return callReadOnlyContractFunction('get-skill-certificate', [uintCV(certificateId)]);
}

export async function submitSkillCertification(
  skillCategory: string,
  lessonsCompleted: number[]
) {
  const lessonList = listCV(lessonsCompleted.map(id => uintCV(id)));
  const functionArgs = [stringAsciiCV(skillCategory), lessonList];

  return callContractFunction('submit-skill-certification', functionArgs);
}

export async function submitPeerReview(
  certificateId: number,
  score: number,
  feedback: string
) {
  const functionArgs = [
    uintCV(certificateId),
    uintCV(score),
    stringAsciiCV(feedback),
  ];

  return callContractFunction('submit-peer-review', functionArgs);
}

// Bounty functions
export async function getBounty(bountyId: number) {
  return callReadOnlyContractFunction('get-bounty', [uintCV(bountyId)]);
}

export async function createSkillBounty(
  title: string,
  description: string,
  requiredSkills: string[],
  rewardAmount: number
) {
  const skillList = listCV(requiredSkills.map(skill => stringAsciiCV(skill)));
  const functionArgs = [
    stringAsciiCV(title),
    stringAsciiCV(description),
    skillList,
    uintCV(rewardAmount),
  ];

  return callContractFunction('create-skill-bounty', functionArgs);
}

export async function claimBounty(bountyId: number) {
  const functionArgs = [uintCV(bountyId)];
  return callContractFunction('claim-bounty', functionArgs);
}

// Status functions
export async function getContractStatus() {
  const [isPaused, isEmergency, totalLessons, totalCertificates] = await Promise.all([
    callReadOnlyContractFunction('is-contract-paused'),
    callReadOnlyContractFunction('is-emergency-mode-enabled'),
    callReadOnlyContractFunction('get-last-token-id'), // This gives us total certificates
    callReadOnlyContractFunction('get-last-token-id'), // Same as above
  ]);

  return {
    isPaused,
    isEmergency,
    totalLessons: Math.max(0, totalCertificates.value - 1), // Approximate
    totalCertificates: totalCertificates.value,
    totalBounties: 0, // Would need to track this separately
  };
}

// Utility functions
export function formatSTX(amount: number): string {
  return (amount / 1000000).toFixed(6);
}

export function getSkillLevelColor(level: number): string {
  const colors = [
    'skill-level-1', // Beginner
    'skill-level-2', // Intermediate
    'skill-level-3', // Advanced
    'skill-level-4', // Expert
    'skill-level-5', // Master
  ];
  return colors[Math.min(level - 1, 4)] || colors[0];
}

export function getDifficultyLabel(difficulty: number): string {
  const labels = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'];
  return labels[difficulty - 1] || 'Unknown';
}
