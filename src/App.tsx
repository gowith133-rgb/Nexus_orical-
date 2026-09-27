import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { SomaHudDashboard } from './components/SomaHudDashboard';
import { NodeState } from './types';

export default function App() {
  const [data, setData] = useState<NodeState | null>(null);

  // Initialize Socket connection to receive live engine updates
  useEffect(() => {
    const socket = io();

    socket.on('state_update', (newState: NodeState) => {
      setData(newState);
    });

    // Also fetch initial state immediately
    fetch('/api/state')
      .then(res => res.json())
      .then(initialState => setData(initialState))
      .catch(err => console.error("Failed to fetch initial state", err));

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SomaHudDashboard 
      initialPrice={data?.price || 2459.09} 
      initialPortfolio={3490.64} 
    />
  );
}
