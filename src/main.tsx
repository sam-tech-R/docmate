import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

class AppErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center p-6"><div className="max-w-md text-center"><h1 className="text-2xl font-bold text-white">DocMate needs a refresh</h1><p className="text-slate-400 mt-3">This tool encountered an unexpected browser error. Your files were not uploaded.</p><button className="mt-6 rounded-xl bg-cyan-500 px-4 py-2.5 font-medium text-white" onClick={() => window.location.reload()}>Refresh workspace</button></div></div>;
    }
    return this.props.children;
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(registration => {
      registration.update();
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) window.dispatchEvent(new Event('docmate-update-available'));
        });
      });
    }).catch(() => {});
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  }, { once: true });
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary><App /></AppErrorBoundary>
  </React.StrictMode>
);
