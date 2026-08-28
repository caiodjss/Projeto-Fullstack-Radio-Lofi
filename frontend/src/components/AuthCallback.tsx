import React, { useEffect } from 'react';

interface AuthCallbackProps {
  onSuccess: () => void;
  onError: () => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess, onError }) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      localStorage.setItem('auth_token', token);
      window.history.replaceState({}, document.title, '/');
      onSuccess();
    } else if (error) {
      console.error('Falha na autenticação:', error);
      window.history.replaceState({}, document.title, '/');
      onError();
    }
  }, [onSuccess, onError]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-pink-300">
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold tracking-wider uppercase animate-pulse">
        Autenticando com o Google...
      </p>
    </div>
  );
};