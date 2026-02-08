
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Could not find root element to mount to");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("App successfully mounted");
  } catch (error) {
    console.error("React Mounting Error:", error);
    // Visual error fallback instead of white screen
    rootElement.innerHTML = `
      <div style="padding: 40px; font-family: system-ui, sans-serif; text-align: center;">
        <h1 style="color: #ef4444;">Initialization Error</h1>
        <p style="color: #64748b;">The app couldn't start correctly.</p>
        <div style="background: #f1f5f9; padding: 15px; border-radius: 12px; font-family: monospace; font-size: 12px; margin-top: 20px; text-align: left; overflow: auto;">
          ${error instanceof Error ? error.stack || error.message : String(error)}
        </div>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
          Retry Loading
        </button>
      </div>
    `;
  }
}

// Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}
