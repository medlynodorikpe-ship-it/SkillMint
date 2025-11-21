// SkillMint TypeScript interfaces

export interface Lesson {
  lessonId: number;
  creator: string;
  title: string;
  description: string;
  skillCategory: string;
  difficulty: number;
  price: number;
  completionCount: number;
  createdAt: number;
}

export interface SkillCertificate {
  certificateId: number;
  owner: string;
  skillCategory: string;
  skillLevel: number;
  lessonsCompleted: number[];
  peerReviews: number[];
  averageScore: number;
  certifiedAt: number;
  expiresAt: number;
  isComposite: boolean;
}

export interface PeerReview {
  reviewId: number;
  reviewer: string;
  certificateId: number;
  score: number;
  feedback: string;
  reviewedAt: number;
}

export interface SkillBounty {
  bountyId: number;
  employer: string;
  title: string;
  description: string;
  requiredSkills: string[];
  rewardAmount: number;
  isActive: boolean;
  winner?: string;
  createdAt: number;
}

export interface UserProgress {
  user: string;
  lessonId: number;
  completed: boolean;
  score: number;
  completedAt: number;
}

export interface ContractStatus {
  isPaused: boolean;
  isEmergencyMode: boolean;
  totalLessons: number;
  totalCertificates: number;
  totalBounties: number;
}

export interface WalletState {
  isConnected: boolean;
  address?: string;
  balance?: string;
}

// Stacks.js specific types
export interface StacksNetwork {
  coreApiUrl: string;
  transactionApiUrl?: string;
}

export interface ContractCall {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
  network: StacksNetwork;
}
