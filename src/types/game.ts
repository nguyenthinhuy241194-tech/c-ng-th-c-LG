export interface PlayerState {
  id: string; // 'P1', 'P2', 'P3', 'P4'
  name: string;
  role: string;
  avatarIcon: string;
  hp: number;
  maxHp: number;
  status: string;
  lastRoll?: {
    roll: number;
    hpChange: number;
    evaluation: string;
  };
}

export interface TurnAction {
  playerId: string;
  playerName: string;
  role: string;
  actionText: string;
}

export interface TurnHistoryItem {
  turn: number;
  situation: string;
  actions: TurnAction[];
  outcome: string;
  d20Rolls: Array<{
    playerId: string;
    playerName: string;
    roll: number;
    hpChange: number;
    evaluation: string;
  }>;
  timeOrProgress: string;
}

export interface GamePreset {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  bannerColor: string;
  world: string;
  goal: string;
  defaultPlayers: Array<{
    id: string;
    name: string;
    role: string;
    avatarIcon: string;
    quickActions: string[];
  }>;
  defaultInventory: string[];
  initialTime: string;
}

export interface EndGameSummary {
  finalOutcome: string;
  teamScore: number;
  mvpPlayer: string;
  achievements: string[];
  epilogue: string;
}
