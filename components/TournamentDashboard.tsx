import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { MatchResult } from '../types';
import { Button } from './Button';
import { Trophy, BarChart2, Swords, ChevronRight, ChevronLeft, ChevronsRight } from 'lucide-react';
import { MatchesView } from './MatchesView';
import { StandingsView } from './StandingsView';

export const TournamentDashboard: React.FC = () => {
  const {
    tournament,
    activeTab,
    setActiveTab,
    activeRoundView,
    setActiveRoundView,
    generateNextRound,
    updateMatchResult,
  } = useTournament();
  const roundData = tournament.rounds.find(r => r.number === activeRoundView);
  const isCurrentRound = activeRoundView === tournament.currentRound;
  const isRoundCompleted = roundData?.matches.every(m => m.result !== MatchResult.PENDING);
  const isLastRound = tournament.currentRound === tournament.totalRounds;
  const isTournamentCompleted = isLastRound && isRoundCompleted;

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-neutral-800 p-2 rounded-lg border border-neutral-700 shrink-0">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white leading-tight truncate">{tournament.name}</h1>
                <p className="text-xs text-neutral-400 truncate">Раунд {tournament.currentRound} из {tournament.totalRounds}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant={activeTab === 'standings' ? 'secondary' : 'ghost'}
                onClick={() => setActiveTab('standings')}
                size="sm"
                className="px-2 sm:px-3"
              >
                <BarChart2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Таблица</span>
              </Button>
              <Button
                variant={activeTab === 'matches' ? 'secondary' : 'ghost'}
                onClick={() => setActiveTab('matches')}
                size="sm"
                className="px-2 sm:px-3"
              >
                <Swords className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Матчи</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {activeTab === 'matches' && (
          <MatchesView
            tournament={tournament}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeRoundView={activeRoundView}
            roundData={roundData}
            isCurrentRound={isCurrentRound}
            isRoundCompleted={isRoundCompleted}
            isTournamentCompleted={isTournamentCompleted}
            updateMatchResult={updateMatchResult}
            generateNextRound={generateNextRound}
            setActiveRoundView={setActiveRoundView}
          />
        )}

        {activeTab === 'standings' && (
          <StandingsView
            tournament={tournament}
            generateNextRound={generateNextRound}
            isRoundCompleted={isRoundCompleted}
          />
        )}
      </main>
    </div>
  );
};