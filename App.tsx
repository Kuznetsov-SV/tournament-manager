import React, { useState, useEffect } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { TournamentSetup } from './components/TournamentSetup';
import { TournamentDashboard } from './components/TournamentDashboard';

function AppContent() {
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
    activeTab,
    setActiveTab,
    activeRoundView,
    setActiveRoundView,
    generateNextRound,
    updateMatchResult,
  } = useTournament();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-white selection:text-black">
      {tournament.status === 'SETUP' ? (
        <TournamentSetup
          tournament={tournament}
          tournamentName={tournamentName}
          setTournamentName={setTournamentName}
          roundCount={roundCount}
          setRoundCount={setRoundCount}
          newName={newName}
          setNewName={setNewName}
          newRating={newRating}
          setNewRating={setNewRating}
          handleAddPlayer={handleAddPlayer}
          removePlayer={removePlayer}
          startEditing={startEditing}
          saveEditing={saveEditing}
          cancelEditing={cancelEditing}
          editingId={editingId}
          editName={editName}
          setEditName={setEditName}
          editRating={editRating}
          setEditRating={setEditRating}
          startTournament={startTournament}
        />
      ) : (
        <TournamentDashboard
          tournament={tournament}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeRoundView={activeRoundView}
          setActiveRoundView={setActiveRoundView}
          generateNextRound={generateNextRound}
          updateMatchResult={updateMatchResult}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <TournamentProvider>
      <AppContent />
    </TournamentProvider>
  );
}