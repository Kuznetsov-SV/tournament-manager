import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { Button } from './Button';
import { Trophy, Users, Plus, Trash2, Pencil, Check, X, Play } from 'lucide-react';
import { useState } from 'react';

export const TournamentSetup: React.FC = () => {
  const {
    tournament,
    tournamentName,
    setTournamentName,
    roundCount,
    setRoundCount,
    newName,
    setNewName,
    newRating,
    setNewRating,
    handleAddPlayer,
    removePlayer,
    startEditing,
    saveEditing,
    cancelEditing,
    editingId,
    editName,
    setEditName,
    editRating,
    setEditRating,
    startTournament,
  } = useTournament();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000); // Clear after 5 seconds
  };

  const validatePlayer = (name: string, rating: number) => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Укажите имя игрока';
    }
    if (rating === null || rating === undefined || Number.isNaN(rating)) {
      newErrors.rating = 'Рейтинг не может быть пустым';
    }
    if (typeof rating !== 'number' || rating < 100 || rating > 3000) {
      newErrors.rating = 'Рейтинг должен быть числом от 100 до 3000';
    }
    return newErrors;
  };

  const handleAddPlayerWithValidation = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validatePlayer(newName, newRating);
    if (Object.keys(newErrors).length === 0) {
      handleAddPlayer(e);
      setNewName('');
      setNewRating(1200);
      setErrors({});
    } else {
      setErrors(newErrors);
      showError(Object.values(newErrors).join('\n'));
    }
  };

  const handleSaveEditingWithValidation = () => {
    const newErrors = validatePlayer(editName, editRating);
    if (Object.keys(newErrors).length === 0) {
      saveEditing();
      setErrors({});
    } else {
      setErrors(newErrors);
      showError(Object.values(newErrors).join('\n'));
    }
  };

  const handleStartTournamentWithValidation = () => {
    const newErrors: { [key: string]: string } = {};
    if (!tournamentName.trim()) {
      newErrors.tournamentName = 'Укажите имя турнира';
    }
    tournament.players.forEach(p => {
      const playerErrors = validatePlayer(p.name, p.rating);
      if (Object.keys(playerErrors).length > 0) {
        newErrors[`player_${p.id}`] = Object.values(playerErrors).join(', ');
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError(Object.values(newErrors).join('\n'));
      return;
    }
    startTournament();
  };

  return (
    <div className="max-w-2xl mx-auto pt-10 sm:pt-20 px-4 pb-24 relative">
      <div className="text-center mb-8 sm:mb-12">
        <div className="bg-neutral-800 w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-xl flex items-center justify-center mb-4 sm:mb-6 border border-neutral-700">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-4 tracking-tight">Tournament Manager</h1>
        <p className="text-neutral-400 text-base sm:text-lg">Управление турнирами по швейцарской системе</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-8">
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Название турнира</label>
                <input
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    className={`w-full bg-neutral-950 border ${errors.tournamentName ? 'border-red-500' : 'border-neutral-800'} rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 transition-all outline-none placeholder-neutral-600`}
                    placeholder="Введите название..."
                />
                {errorMessage && (
                  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
                    {errorMessage.split('\n').map((msg, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-1 h-1 bg-white rounded-full mr-3"></div>
                        {msg}
                      </div>
                    ))}
                  </div>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Количество раундов</label>
                <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                   {[3, 4, 5, 6, 7, 9].map(num => (
                       <button
                         key={num}
                         onClick={() => setRoundCount(num)}
                         className={`flex-1 min-w-[3rem] py-3 rounded-lg font-medium border transition-all ${
                             roundCount === num 
                             ? 'bg-white border-white text-black' 
                             : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
                         }`}
                       >
                           {num}
                       </button>
                   ))}
                </div>
            </div>

            <div className="pt-6 border-t border-neutral-800">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-neutral-400"/> 
                    Участники ({tournament.players.length})
                </h3>
                
                <form onSubmit={handleAddPlayerWithValidation} className="space-y-3 sm:space-y-0 sm:flex sm:gap-3 mb-6">
                    <div className="flex-grow grid grid-cols-[1fr_auto] gap-3">
                        <div>
                          <input
                              type="text"
                              placeholder="Имя игрока"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className={`bg-neutral-950 border ${errors.name ? 'border-red-500' : 'border-neutral-800'} rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-neutral-500 outline-none placeholder-neutral-600 w-full`}
                          />
                        </div>
                        <div>
                          <input
                              type="number"
                              placeholder="Рейтинг"
                              value={newRating}
                              onChange={(e) => setNewRating(parseInt(e.target.value))}
                              className={`bg-neutral-950 border ${errors.rating ? 'border-red-500' : 'border-neutral-800'} rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-neutral-500 outline-none placeholder-neutral-600 w-24`}
                          />
                        </div>
                    </div>
                    <Button type="submit" size="lg" className="w-full sm:w-auto" icon={<Plus className="w-4 h-4" />}>
                        Добавить
                    </Button>
                </form>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {tournament.players.map(p => {
                      const isEditing = editingId === p.id;
                      return (
                        <div key={p.id} className="grid grid-cols-[1fr_auto_auto] gap-2 sm:gap-3 items-center bg-neutral-950 p-3 rounded-lg border border-neutral-800 group hover:border-neutral-600 transition-colors">
                            {isEditing ? (
                              <>
                                <div className="flex flex-col sm:flex-row gap-2 col-span-3 sm:col-span-1">
                                  <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className={`bg-neutral-900 border ${errors[`player_${p.id}`] ? 'border-red-500' : 'border-neutral-700'} rounded px-2 py-1 text-white text-sm w-full focus:outline-none focus:border-neutral-500`}
                                      autoFocus
                                  />
                                  <input
                                      type="number"
                                      value={editRating}
                                      onChange={(e) => setEditRating(parseInt(e.target.value))}
                                      className={`bg-neutral-900 border ${errors[`player_${p.id}`] ? 'border-red-500' : 'border-neutral-700'} rounded px-2 py-1 text-white text-sm w-20 focus:outline-none focus:border-neutral-500`}
                                  />
                                </div>
                                <div className="flex gap-1 justify-end col-span-3 sm:col-span-2">
                                   <button onClick={handleSaveEditingWithValidation} className="p-1 text-green-400 hover:bg-green-900/20 rounded"><Check className="w-4 h-4"/></button>
                                   <button onClick={cancelEditing} className="p-1 text-neutral-400 hover:bg-neutral-800 rounded"><X className="w-4 h-4"/></button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between w-full gap-2 overflow-hidden">
                                  <span className="font-medium text-neutral-200 truncate">{p.name}</span>
                                  <span className="px-2 py-1 bg-neutral-900 rounded text-xs text-neutral-500 font-mono border border-neutral-800 shrink-0">ELO {p.rating}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <button onClick={() => startEditing(p)} className="p-2 text-neutral-600 hover:text-white hover:bg-neutral-800 rounded transition-colors">
                                      <Pencil className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => removePlayer(p.id)} className="p-2 text-neutral-600 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </>
                            )}
                        </div>
                      );
                    })}
                    {tournament.players.length === 0 && (
                        <div className="text-center py-8 text-neutral-600 italic border-2 border-dashed border-neutral-800 rounded-lg">
                            Игроки еще не добавлены
                        </div>
                    )}
                </div>
            </div>

            <Button 
                onClick={handleStartTournamentWithValidation}
                size="lg" 
                className="w-full mt-4"
                disabled={tournament.players.length < 2}
                icon={<Play className="w-5 h-5"/>}
            >
                Начать турнир
            </Button>
        </div>
      </div>
    </div>
  );
};