export interface RewardPool {
  amount: string;
  tokenSymbol: string;
}

export interface Wave {
  id: string;
  ecosystem: string;
  totalPointsAllocated: number;
  rewardPool: RewardPool;
  endDate: string;
  /** Injected from Drips Wave API */
  repoUrl?: string;
  skills?: string[];
}

export interface Contributor {
  id: string;
  githubHandle: string;
  totalPoints: number;
  ecosystems: string[];
}
