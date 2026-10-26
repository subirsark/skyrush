import {
  User,
  GameRound,
  Bet,
  WalletTransaction,
  GameConfig,
  LeaderboardEntry,
  TestSuiteResult,
  AdminAuditLog,
} from '../types/index.ts';

const TOKEN_KEY = 'skyrush_auth_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async getGameState(): Promise<{
    round: GameRound;
    serverTime: number;
    activeBets: Bet[];
    userBets: Bet[];
    history: Array<{
      id: string;
      roundNumber: number;
      crashMultiplier: number;
      crashedAtTime: number;
      totalBets: number;
      totalPayout: number;
    }>;
    config: { minBet: number; maxBet: number; countdownDurationSec: number };
  }> {
    const res = await fetch('/api/game/state', {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch game state');
    return res.json();
  },

  async placeBet(amount: number, autoCashout?: number, panelIndex: 0 | 1 = 0): Promise<{
    success: boolean;
    bet: Bet;
    balance: number;
  }> {
    const res = await fetch('/api/game/bet', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ amount, autoCashout, panelIndex }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to place bet');
    }
    return data;
  },

  async cashOut(betId: string): Promise<{
    success: boolean;
    bet: Bet;
    balance: number;
    payout: number;
    cashoutMultiplier: number;
  }> {
    const res = await fetch('/api/game/cashout', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ betId }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to cash out');
    }
    return data;
  },

  async register(params: {
    username: string;
    email: string;
    password: string;
    displayName: string;
    avatar?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    this.setToken(data.token);
    return data;
  },

  async login(identifier: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    this.setToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } catch {
      // Ignore
    }
    this.clearToken();
  },

  async requestFaucet(): Promise<{ success: boolean; balance: number; added: number }> {
    const res = await fetch('/api/wallet/faucet', {
      method: 'POST',
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Faucet request failed');
    return data;
  },

  async getTransactions(): Promise<{ transactions: WalletTransaction[] }> {
    const res = await fetch('/api/wallet/transactions', {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async getLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[] }> {
    const res = await fetch('/api/leaderboard');
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json();
  },

  async getAdminOverview(): Promise<{
    metrics: {
      registeredUsersCount: number;
      totalVirtualBets: number;
      totalCoinsBet: number;
      totalCoinsPaid: number;
      netHouseMargin: number;
      activeRoundsPlayed: number;
      uptimeSec: number;
    };
    users: User[];
    auditLogs: AdminAuditLog[];
    config: GameConfig;
    recentHistory: any[];
  }> {
    const res = await fetch('/api/admin/overview', {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Admin access forbidden');
    return data;
  },

  async adminGrantCoins(targetUserId: string, amount: number, reason: string): Promise<any> {
    const res = await fetch('/api/admin/grant-coins', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ targetUserId, amount, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to grant coins');
    return data;
  },

  async adminResetBalance(targetUserId: string, reason: string): Promise<any> {
    const res = await fetch('/api/admin/reset-balance', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ targetUserId, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset balance');
    return data;
  },

  async adminUpdateConfig(configUpdates: Partial<GameConfig>): Promise<any> {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(configUpdates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update config');
    return data;
  },

  async adminSetRole(targetUserId: string, role: 'user' | 'admin'): Promise<any> {
    const res = await fetch('/api/admin/set-role', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ targetUserId, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update role');
    return data;
  },

  async runTestSuite(): Promise<TestSuiteResult> {
    const res = await fetch('/api/tests/run', {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Test suite execution failed');
    return res.json();
  },
};
