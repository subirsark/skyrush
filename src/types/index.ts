export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
  role: UserRole;
  balance: number;
  createdAt: number;
  highestMultiplier: number;
  totalBets: number;
  totalWon: number;
  totalLost: number;
}

export type RoundStatus = 'COUNTDOWN' | 'IN_FLIGHT' | 'CRASHED';

export interface GameRound {
  id: string;
  roundNumber: number;
  status: RoundStatus;
  startTime: number;
  countdownEndsAt: number;
  crashedAtTime?: number;
  crashMultiplier: number;
  currentMultiplier: number;
  totalBetsCount: number;
  totalCoinsBet: number;
  totalPayout: number;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
}

export type BetStatus = 'ACTIVE' | 'CASHED_OUT' | 'CRASHED';

export interface Bet {
  id: string;
  roundId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  panelIndex: 0 | 1;
  amount: number;
  autoCashout?: number;
  status: BetStatus;
  cashoutMultiplier?: number;
  payout?: number;
  createdAt: number;
  cashedOutAt?: number;
  isBot?: boolean;
}

export type TransactionType =
  | 'INITIAL_GRANT'
  | 'BET_PLACED'
  | 'CASHOUT_WON'
  | 'BET_LOST'
  | 'ADMIN_GRANT'
  | 'ADMIN_RESET'
  | 'DEMO_FAUCET';

export interface WalletTransaction {
  id: string;
  userId: string;
  roundId?: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  note: string;
  timestamp: number;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: 'GRANT_COINS' | 'RESET_COINS' | 'CHANGE_CONFIG' | 'FORCE_NEXT_CRASH' | 'SET_ROLE';
  targetUserId?: string;
  targetUserName?: string;
  details: string;
  timestamp: number;
}

export interface GameConfig {
  countdownDurationSec: number;
  minBet: number;
  maxBet: number;
  startingBalance: number;
  flightSpeedFactor: number;
  houseEdgePercent: number;
  forcedNextCrash: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: string;
  netProfit: number;
  highestMultiplier: number;
  roundsPlayed: number;
  winRate: number;
  isSimulated?: boolean;
}

export interface TestResultItem {
  name: string;
  description: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

export interface TestSuiteResult {
  total: number;
  passed: number;
  failed: number;
  timestamp: number;
  results: TestResultItem[];
}
