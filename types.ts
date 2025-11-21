export enum MatchResult {
  P1_WIN = '1-0',
  DRAW = '0.5-0.5',
  P2_WIN = '0-1',
  PENDING = 'PENDING'
}

export interface Player {
  id: string;
  name: string;
  rating: number;
  score: number;
  buchholz: number;
  opponents: string[]; // IDs of opponents played
  history: {
    round: number;
    opponentId: string | 'BYE';
    result: number; // 1, 0.5, 0
    color?: 'white' | 'black';
  }[];
  isActive: boolean;
}

export interface Match {
  id: string;
  round: number;
  player1Id: string;
  player2Id: string | 'BYE'; // 'BYE' means the player gets a free point
  result: MatchResult;
}

export interface Round {
  number: number;
  matches: Match[];
  isCompleted: boolean;
}

export interface TournamentState {
  name: string;
  totalRounds: number;
  currentRound: number;
  players: Player[];
  rounds: Round[];
  status: 'SETUP' | 'IN_PROGRESS' | 'FINISHED';
}