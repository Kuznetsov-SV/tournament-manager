import React, { createContext, useContext, useState } from 'react';
import { Player, MatchResult, TournamentState, Round } from '../types';
import { generatePairingsForRound, updateStandings, generateUUID } from '../services/swissLogic';

interface TournamentContextProps {
  tournament: TournamentState;
  setTournament: React.Dispatch<React.SetStateAction<TournamentState>>;
  handleAddPlayer: (e: React.FormEvent) => void;
  removePlayer: (id: string) => void;
  startEditing: (player: Player) => void;
  saveEditing: () => void;
  cancelEditing: () => void;
  startTournament: () => void;
  generateNextRound: (isFirstRound: boolean) => void;
  updateMatchResult: (roundNumber: number, matchId: string, result: MatchResult) => void;
  newName: string;
  setNewName: React.Dispatch<React.SetStateAction<string>>;
  newRating: number;
  setNewRating: React.Dispatch<React.SetStateAction<number>>;
  tournamentName: string;
  setTournamentName: React.Dispatch<React.SetStateAction<string>>;
  roundCount: number;
  setRoundCount: React.Dispatch<React.SetStateAction<number>>;
  editingId: string | null;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  editName: string;
  setEditName: React.Dispatch<React.SetStateAction<string>>;
  editRating: number;
  setEditRating: React.Dispatch<React.SetStateAction<number>>;
  activeTab: 'players' | 'standings' | 'matches';
  setActiveTab: React.Dispatch<React.SetStateAction<'players' | 'standings' | 'matches'>>;
  activeRoundView: number;
  setActiveRoundView: React.Dispatch<React.SetStateAction<number>>;
}

const TournamentContext = createContext<TournamentContextProps | undefined>(undefined);

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tournament, setTournament] = useState<TournamentState>({
    name: '',
    totalRounds: 5,
    currentRound: 0,
    players: [],
    rounds: [],
    status: 'SETUP',
  });
  const [newName, setNewName] = useState('');
  const [newRating, setNewRating] = useState(1200);
  const [tournamentName, setTournamentName] = useState('Турнир #1');
  const [roundCount, setRoundCount] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [activeTab, setActiveTab] = useState<'players' | 'standings' | 'matches'>('players');
  const [activeRoundView, setActiveRoundView] = useState<number>(1);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPlayer: Player = {
      id: generateUUID(),
      name: newName,
      rating: newRating,
      score: 0,
      buchholz: 0,
      opponents: [],
      history: [],
      isActive: true,
    };

    setTournament(prev => ({
      ...prev,
      players: [...prev.players, newPlayer],
    }));
    setNewName('');
    setNewRating(1200);
  };

  const removePlayer = (id: string) => {
    setTournament(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id),
    }));
  };

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
    setEditRating(player.rating);
  };

  const saveEditing = () => {
    if (editingId) {
      setTournament(prev => ({
        ...prev,
        players: prev.players.map(p => {
          if (p.id === editingId) {
            return { ...p, name: editName, rating: editRating };
          }
          return p;
        }),
      }));
      setEditingId(null);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const startTournament = () => {
    if (tournament.players.length < 2) {
      alert('Нужно минимум 2 игрока!');
      return;
    }
    setTournament(prev => ({
      ...prev,
      name: tournamentName,
      totalRounds: roundCount,
      status: 'IN_PROGRESS',
      currentRound: 0,
    }));
    setTimeout(() => generateNextRound(true), 100);
  };

  const generateNextRound = (isFirstRound = false) => {
    if (!isFirstRound && tournament.currentRound > 0) {
      const prevRound = tournament.rounds.find(r => r.number === tournament.currentRound);
      if (prevRound?.matches.some(m => m.result === MatchResult.PENDING)) {
        alert('Пожалуйста, завершите все матчи в текущем раунде.');
        return;
      }
    }

    const nextRoundNum = isFirstRound ? 1 : tournament.currentRound + 1;

    if (nextRoundNum > tournament.totalRounds) {
      setTournament(prev => ({ ...prev, status: 'FINISHED' }));
      setActiveTab('standings');
      return;
    }

    const sortedPlayers = updateStandings(tournament.players, tournament.rounds);
    const newMatches = generatePairingsForRound(nextRoundNum, sortedPlayers);

    const newRound: Round = {
      number: nextRoundNum,
      matches: newMatches,
      isCompleted: false,
    };

    setTournament(prev => ({
      ...prev,
      players: sortedPlayers,
      currentRound: nextRoundNum,
      rounds: [...prev.rounds, newRound],
    }));

    setActiveRoundView(nextRoundNum);
    setActiveTab('matches');
  };

  const updateMatchResult = (roundNumber: number, matchId: string, result: MatchResult) => {
    setTournament(prev => {
      const newRounds = prev.rounds.map(r => {
        if (r.number !== roundNumber) return r;
        return {
          ...r,
          matches: r.matches.map(m => {
            if (m.id !== matchId) return m;
            return { ...m, result };
          }),
        };
      });

      const updatedPlayers = updateStandings(prev.players, newRounds);

      return {
        ...prev,
        rounds: newRounds,
        players: updatedPlayers,
      };
    });
  };

  const value = {
    tournament,
    setTournament,
    handleAddPlayer,
    removePlayer,
    startEditing,
    saveEditing,
    cancelEditing,
    startTournament,
    generateNextRound,
    updateMatchResult,
    newName,
    setNewName,
    newRating,
    setNewRating,
    tournamentName,
    setTournamentName,
    roundCount,
    setRoundCount,
    editingId,
    setEditingId,
    editName,
    setEditName,
    editRating,
    setEditRating,
    activeTab,
    setActiveTab,
    activeRoundView,
    setActiveRoundView,
  };

  return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>;
};