import React, { useState } from 'react';
import { Play, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onContinueAsGuest: () => void;
}

const R2_BASE_URL = 'https://pub-c1380a9668c943e5b08ac47220bb1bfa.r2.dev/backgrounds';

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinueAsGuest }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const backendUrl =
    (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
    'https://lofi-backend-production-221f.up.railway.app/api';

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = `${backendUrl.replace(/\/$/, '')}/auth/google`;
    }, 400);
  };

  const handleGuestClick = () => {
    setIsLoading(true);
    onContinueAsGuest();
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 font-sans">
      {/* 1. Background Principal da Landing Page */}
      <img
        src={`${R2_BASE_URL}/lofi-vaporwave-ANIMATION.gif`}
        alt="Lofi Vaporwave Background"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-75 scale-105 transition-all duration-1000"
      />

      {/* 2. Overlay com Gradiente para Contraste */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-slate-950/60 backdrop-blur-[2px]" />

      {/* 3. Camada do GIF de Loading (Aparece com Fade In / Scale a partir do centro) */}
      <div
        className={`fixed inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md transition-all duration-700 pointer-events-none ${
          isLoading
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="relative flex flex-col items-center">
          <img
            src={`${R2_BASE_URL}/vaporwave-loading-ANIMATION.gif`}
            alt="A carregar..."
            className="w-56 h-56 sm:w-72 sm:h-72 object-cover rounded-3xl shadow-2xl border border-pink-500/30 filter drop-shadow-[0_0_25px_rgba(236,72,153,0.3)] animate-pulse"
          />
          <p className="mt-6 text-sm font-semibold tracking-widest uppercase text-pink-300 drop-shadow">
            A sintonizar frequências...
          </p>
        </div>
      </div>

      {/* 4. Card Central Glassmorphism */}
      <div
        className={`relative z-10 w-full max-w-md mx-4 p-7 sm:p-9 rounded-[28px] bg-slate-900/70 border border-white/10 shadow-[0_28px_80px_rgba(15,23,42,0.7)] backdrop-blur-xl text-center flex flex-col items-center transition-all duration-500 ${
          isLoading ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium tracking-wide uppercase mb-4">
          <Sparkles size={13} className="animate-pulse" />
          <span>Lo-Fi Beats 24/7</span>
        </div>

        {/* Título & Slogan */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-pink-200 to-indigo-200 tracking-tight mb-2 drop-shadow">
          Chilled Vibes
        </h1>
        <p className="text-slate-300/80 text-sm sm:text-base mb-8 max-w-xs leading-relaxed">
          Relaxa, estuda ou aprecia batidas nostálgicas e melancólicas.
        </p>

        {/* Botões de Ação */}
        <div className="w-full space-y-3">
          {/* Botão Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all duration-200 shadow-[0_12px_30px_rgba(255,255,255,0.15)] hover:shadow-white/10 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27a7.13 7.13 0 0 1 0-4.54V6.58H1.25a11.98 11.98 0 0 0 0 10.84l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <span>Conectar com Google</span>
          </button>

          {/* Botão Convidado */}
          <button
            onClick={handleGuestClick}
            disabled={isLoading}
            className="w-full py-3.5 px-5 rounded-2xl bg-white/8 hover:bg-white/12 text-white font-medium text-sm border border-white/10 transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-md active:scale-[0.98] disabled:opacity-50"
          >
            <Play size={15} className="text-pink-400 fill-pink-400" />
            <span>Ouvir como Convidado</span>
          </button>
        </div>

        {/* Rodapé */}
        <p className="text-[11px] text-slate-400/60 mt-6">
          Sem registos demorados. Inicia sessão a qualquer momento para guardares os teus favoritos.
        </p>
      </div>
    </div>
  );
};