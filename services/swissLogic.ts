import { Player, Match, MatchResult, Round } from '../types';

export const generateUUID = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Calculate scores and Buchholz
export const updateStandings = (players: Player[], rounds: Round[]): Player[] => {
  // Deep copy to avoid mutation during calc
  const updatedPlayers = players.map(p => ({
    ...p,
    score: 0,
    buchholz: 0,
    history: [],
    opponents: []
  }));

  // 1. Calculate raw scores
  rounds.forEach(round => {
    round.matches.forEach(match => {
      if (match.result === MatchResult.PENDING) return;

      const p1 = updatedPlayers.find(p => p.id === match.player1Id);
      const p2 = match.player2Id !== 'BYE' ? updatedPlayers.find(p => p.id === match.player2Id) : null;

      if (p1) {
        let score = 0;
        if (match.player2Id === 'BYE') score = 1;
        else if (match.result === MatchResult.P1_WIN) score = 1;
        else if (match.result === MatchResult.DRAW) score = 0.5;
        
        p1.score += score;
        p1.history.push({
          round: round.number,
          opponentId: match.player2Id,
          result: score,
          color: 'white' // Simplified color logic
        });
        if (match.player2Id !== 'BYE') p1.opponents.push(match.player2Id);
      }

      if (p2) {
        let score = 0;
        if (match.result === MatchResult.P2_WIN) score = 1;
        else if (match.result === MatchResult.DRAW) score = 0.5;

        p2.score += score;
        p2.history.push({
          round: round.number,
          opponentId: match.player1Id,
          result: score,
          color: 'black'
        });
        p2.opponents.push(match.player1Id);
      }
    });
  });

  // 2. Calculate Buchholz (Sum of opponents' scores)
  updatedPlayers.forEach(p => {
    let bScore = 0;
    p.opponents.forEach(opId => {
      const opponent = updatedPlayers.find(op => op.id === opId);
      if (opponent) bScore += opponent.score;
    });
    p.buchholz = bScore;
  });

  // 3. Sort
  return updatedPlayers.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz;
    return b.rating - a.rating; // Final tiebreak: ELO
  });
};

// Simple Swiss Pairing Algorithm
export const generatePairingsForRound = (
  roundNumber: number,
  players: Player[]
): Match[] => {
  // Sort players: Score DESC, Rating DESC
  // Important: We must use the latest calculated scores.
  // We assume 'players' passed in is already updated via updateStandings
  
  const activePlayers = [...players.filter(p => p.isActive)]; // Copy
  const matches: Match[] = [];
  const pairedIds = new Set<string>();

  // Handling the Bye for odd number of players
  if (activePlayers.length % 2 !== 0) {
    // Find the lowest ranked player who hasn't had a bye yet
    // For simplicity in this demo: lowest score, lowest rating who hasn't had a bye
    let byePlayerIndex = activePlayers.length - 1;
    while (byePlayerIndex >= 0) {
      const p = activePlayers[byePlayerIndex];
      const hasHadBye = p.history.some(h => h.opponentId === 'BYE');
      if (!hasHadBye) break;
      byePlayerIndex--;
    }
    
    // If everyone had a bye (rare in short tournaments), just pick the last one
    if (byePlayerIndex < 0) byePlayerIndex = activePlayers.length - 1;

    const byePlayer = activePlayers[byePlayerIndex];
    matches.push({
      id: generateUUID(),
      round: roundNumber,
      player1Id: byePlayer.id,
      player2Id: 'BYE',
      result: MatchResult.P1_WIN // Auto win
    });
    pairedIds.add(byePlayer.id);
    activePlayers.splice(byePlayerIndex, 1);
  }

  // Main Pairing Loop
  while (activePlayers.length > 0) {
    const p1 = activePlayers.shift()!; // Highest remaining
    
    // Find best opponent: Highest score/rating not played yet
    let opponentIndex = -1;

    for (let i = 0; i < activePlayers.length; i++) {
      const potentialOpponent = activePlayers[i];
      const playedBefore = p1.opponents.includes(potentialOpponent.id);
      
      if (!playedBefore) {
        opponentIndex = i;
        break;
      }
    }

    // Fallback: If played everyone (or just stuck), pick top available (imperfect swiss but robust for app)
    if (opponentIndex === -1 && activePlayers.length > 0) {
       opponentIndex = 0;
    }

    if (opponentIndex !== -1) {
      const p2 = activePlayers[opponentIndex];
      matches.push({
        id: generateUUID(),
        round: roundNumber,
        player1Id: p1.id,
        player2Id: p2.id,
        result: MatchResult.PENDING
      });
      pairedIds.add(p1.id);
      pairedIds.add(p2.id);
      activePlayers.splice(opponentIndex, 1);
    } else {
        // Should not happen if logic is sound and count is even, but safety net:
        // Give P1 a bye if stranded
         matches.push({
            id: generateUUID(),
            round: roundNumber,
            player1Id: p1.id,
            player2Id: 'BYE',
            result: MatchResult.P1_WIN
        });
    }
  }

  return matches;
};
