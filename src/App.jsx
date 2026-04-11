// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Lobby from './pages/Lobby'
import GameDashboard from './pages/GameDashboard'
import GovernmentPanel from './pages/GovernmentPanel'
import Results from './pages/Results'
import FinalLeaderboard from './pages/FinalLeaderboard'
import { useGame } from './context/GameContext'

export default function App() {
  const { player } = useGame()

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/lobby/:roomCode" element={<Lobby />} />
      <Route 
        path="/game/:roomCode" 
        element={
          player?.role === 'government' 
            ? <GovernmentPanel /> 
            : <GameDashboard />
        } 
      />
      <Route path="/results/:roomCode" element={<Results />} />
      <Route path="/leaderboard/:roomCode" element={<FinalLeaderboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
