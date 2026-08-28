import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RadioLayout } from './components/RadioLayout';
import { AuthCallback } from './components/AuthCallback';
import { PlayerProvider } from './context/PlayerContext';

const R2_BASE_URL = 'https://pub-d3a9d02dea068d88c6ed0a4b9958a368.r2.dev/backgrounds';

export default function App() {
  const isAuthCallback = window.location.pathname === '/auth/callback' || window.location.search.includes('token=');

  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('auth_token') || sessionStorage.getItem('lofi_guest'));
  });

  const [isRadioReady, setIsRadioReady] = useState<boolean>(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState<boolean>(false);

  const handleContinueAsGuest = () => {
    setShowLoadingOverlay(true);
    sessionStorage.setItem('lofi_guest', 'true');
    setTimeout(() => {
      setHasEntered(true);
    }, 400);
  };

  const handleAuthSuccess = () => {
    setShowLoadingOverlay(true);
    setHasEntered(true);
  };

  const handleRadioLoaded = () => {
    setIsRadioReady(true);
    setTimeout(() => {
      setShowLoadingOverlay(false);
    }, 600);
  };

  if (isAuthCallback) {
    return <AuthCallback onSuccess={handleAuthSuccess} onError={() => setHasEntered(false)} />;
  }

  if (!hasEntered) {
    return <WelcomeScreen onContinueAsGuest={handleContinueAsGuest} />;
  }

  return (
    <PlayerProvider>
      <div className="relative min-h-screen w-full bg-slate-950 overflow-hidden">
        {showLoadingOverlay && (
          <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-700 ${
              isRadioReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <img
              src={`${R2_BASE_URL}/vaporwave-loading-ANIMATION.gif`}
              alt="Carregando..."
              className="w-56 h-56 sm:w-72 sm:h-72 object-cover rounded-3xl shadow-2xl border border-pink-500/30 filter drop-shadow-[0_0_30px_rgba(236,72,153,0.4)]"
            />
            <p className="mt-6 text-xs sm:text-sm font-semibold tracking-widest uppercase text-pink-300 animate-pulse">
              Sintonizando batidas...
            </p>
          </div>
        )}
        <RadioLayout onLoaded={handleRadioLoaded} />
      </div>
    </PlayerProvider>
  );
}