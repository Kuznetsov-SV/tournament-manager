import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { MatchResult } from '../types';
import { Button } from './Button';
import { Swords, CheckCircle2, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const MatchesView: React.FC = () => {
  const {
    tournament,
    activeRoundView,
    updateMatchResult,
    generateNextRound,
    setActiveRoundView,
  } = useTournament();

  const roundData = tournament.rounds.find(r => r.number === activeRoundView);
  const isCurrentRound = activeRoundView === tournament.currentRound;
  const isRoundCompleted = roundData?.matches.every(m => m.result !== MatchResult.PENDING);
  const isTournamentCompleted = tournament.status === 'FINISHED';
  const isLastRound = tournament.currentRound === tournament.totalRounds;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">
          Раунд {activeRoundView}
        </h2>
        <div className="flex items-center gap-3">
          {/* Round Navigation */}
          <div className="flex items-center bg-neutral-900 rounded-lg border border-neutral-800 p-1">
            <button
              onClick={() => setActiveRoundView(Math.max(1, activeRoundView - 1))}
              disabled={activeRoundView <= 1}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-3 text-sm font-medium text-neutral-400 min-w-[60px] text-center select-none">
              {activeRoundView}/{tournament.totalRounds}
            </span>
            <button
              onClick={() => setActiveRoundView(Math.min(tournament.currentRound, activeRoundView + 1))}
              disabled={activeRoundView >= tournament.currentRound}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          {isCurrentRound && (
            <>
              {!isLastRound && (
                <Button
                  onClick={() => generateNextRound(false)}
                  disabled={!isRoundCompleted}
                  className="p-1 sm:px-3"
                >
                  <span className="hidden sm:inline">Далее</span>
                  <ChevronsRight className="w-5 h-5 sm:ml-2" />
                </Button>
              )}
              {isTournamentCompleted && (
                <div className="px-4 py-2 bg-green-900/20 text-green-400 border border-green-900/50 rounded-lg text-sm font-medium animate-pulse text-center">
                    Турнир завершен
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {roundData ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {roundData.matches.map((match, idx) => {
            const p1 = tournament.players.find(p => p.id === match.player1Id);
            const p2 = match.player2Id === 'BYE' ? null : tournament.players.find(p => p.id === match.player2Id);

            return (
              <div key={match.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-600 transition-colors">
                <div className="flex justify-between items-center mb-4 text-xs text-neutral-500 uppercase tracking-wider">
                  <span>Доска {idx + 1}</span>
                  <span>{match.result === MatchResult.PENDING ? 'В процессе' : 'Завершен'}</span>
                </div>

                {/* Player 1 */}
                <div className={`flex justify-between items-center mb-3 p-2 rounded-lg ${match.result === MatchResult.P1_WIN ? 'bg-neutral-800 text-white border border-neutral-700' : 'text-neutral-400'}`}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold border border-neutral-300 shrink-0">Б</div>
                    <span className={`font-medium truncate ${match.result === MatchResult.P1_WIN ? 'text-white' : 'text-neutral-300'}`}>{p1?.name}</span>
                  </div>
                  <span className="text-neutral-600 text-sm">{p1?.rating}</span>
                </div>

                {/* Player 2 */}
                <div className={`flex justify-between items-center mb-4 p-2 rounded-lg ${match.result === MatchResult.P2_WIN ? 'bg-neutral-800 text-white border border-neutral-700' : 'text-neutral-400'}`}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold border border-neutral-700 shrink-0">Ч</div>
                    <span className={`font-medium truncate ${match.result === MatchResult.P2_WIN ? 'text-white' : 'text-neutral-300'}`}>{p2 ? p2.name : 'Бай'}</span>
                  </div>
                  <span className="text-neutral-600 text-sm">{p2?.rating || '-'}</span>
                </div>

                {/* Controls */}
                {match.result !== MatchResult.PENDING ? (
                  <div className="flex justify-center items-center gap-2 p-2 bg-neutral-950 rounded-lg border border-neutral-800">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-neutral-300">Результат: {match.result}</span>
                    {isCurrentRound && !isTournamentCompleted && !(isLastRound && isRoundCompleted) && (
                      <button onClick={() => updateMatchResult(match.round, match.id, MatchResult.PENDING)} className="ml-2 text-xs text-neutral-500 hover:text-white underline">Изм.</button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateMatchResult(match.round, match.id, MatchResult.P1_WIN)}
                      className="py-2 text-sm font-medium bg-neutral-800 border border-neutral-700 hover:bg-white hover:text-black rounded-lg transition-colors"
                    >
                      1-0
                    </button>
                    <button
                      onClick={() => updateMatchResult(match.round, match.id, MatchResult.DRAW)}
                      className="py-2 text-sm font-medium bg-neutral-800 border border-neutral-700 hover:bg-white hover:text-black rounded-lg transition-colors"
                    >
                      Ничья
                    </button>
                    <button
                      onClick={() => updateMatchResult(match.round, match.id, MatchResult.P2_WIN)}
                      className="py-2 text-sm font-medium bg-neutral-800 border border-neutral-700 hover:bg-white hover:text-black rounded-lg transition-colors disabled:opacity-50"
                      disabled={!p2}
                    >
                      0-1
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-900 border border-dashed border-neutral-800 rounded-xl">
          <Swords className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-neutral-300 mb-2">Нет данных</h3>
        </div>
      )}
    </div>
  );
};