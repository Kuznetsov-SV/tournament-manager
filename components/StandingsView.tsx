import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { MatchResult } from '../types';
import { Button } from './Button';
import { ChevronsRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const StandingsView: React.FC = () => {
  const { tournament, generateNextRound } = useTournament();
  const isRoundCompleted = tournament.rounds[tournament.currentRound - 1]?.matches.every(
    m => m.result !== MatchResult.PENDING
  );
  const isLastRound = tournament.currentRound === tournament.totalRounds;
  const isTournamentCompleted = isLastRound && isRoundCompleted;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Турнирная таблица</h2>
        {tournament.currentRound > 0 && isRoundCompleted && !isLastRound && (
          <Button onClick={() => generateNextRound(false)} disabled={!isRoundCompleted} className="p-1 sm:px-3">
            <span className="hidden sm:inline">Далее</span> <ChevronsRight className="w-5 h-5 sm:ml-2" />
          </Button>
        )}
        {isTournamentCompleted && (
          <span className="text-green-400 font-medium">Турнир завершен</span>
        )}
      </div>

      <div className="overflow-x-auto bg-neutral-900 border-neutral-800 rounded-xl">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-neutral-950 border-b border-neutral-800 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              <th className="p-3 sm:p-4">Место</th>
              <th className="p-3 sm:p-4">Игрок</th>
              <th className="p-3 sm:p-4">Рейтинг</th>
              <th className="p-3 sm:p-4">Игр</th>
              <th className="p-3 sm:p-4">Бухгольц</th>
              <th className="p-3 sm:p-4 text-right">Очки</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {tournament.players.map((p, index) => (
              <tr key={p.id} className="hover:bg-neutral-800 transition-colors">
                <td className="p-3 sm:p-4 text-neutral-500 font-mono">#{index + 1}</td>
                <td className="p-3 sm:p-4 font-medium text-neutral-200">{p.name}</td>
                <td className="p-3 sm:p-4 text-neutral-500">{p.rating}</td>
                <td className="p-3 sm:p-4 text-neutral-500">{p.history.length}</td>
                <td className="p-3 sm:p-4 text-neutral-500">{p.buchholz}</td>
                <td className="p-3 sm:p-4 text-right font-bold text-white text-lg">{p.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg font-medium text-neutral-300 mb-6">Распределение очков</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tournament.players.slice(0, 10)}>
              <XAxis dataKey="name" tick={{ fill: '#7373', fontSize: 12 }} interval={0} />
              <YAxis tick={{ fill: '#737373' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#e5e5e5' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="score" name="Очки" radius={[4, 4, 0, 0]}>
                {tournament.players.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? '#4f46e5' : '#818cf8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};