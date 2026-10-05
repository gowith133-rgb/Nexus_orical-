import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { SomaHudDashboard } from './components/SomaHudDashboard';
import { OnboardingGuide } from './components/OnboardingGuide';
import { NodeState } from './types';

const ONBOARDING_KEY = 'nexus-onboarding-complete';

export default function App() {
  const [data, setData] = useState<NodeState | null>(null);
  const [onboardingDone, setOnboardingDone] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ONBOARDING_KEY) === '1';
    } catch {
      return false;
    }
  });

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

  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, '1');
    } catch {
      // Private browsing etc. — onboarding will simply show again next visit.
    }
    setOnboardingDone(true);
  };

  if (!onboardingDone) {
    return <OnboardingGuide onComplete={handleOnboardingComplete} />;
  }

  return (
    <SomaHudDashboard 
      initialPrice={data?.price || 2459.09} 
      initialPortfolio={3490.64} 
    />
  );
}
