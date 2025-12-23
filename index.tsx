
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("SpyPhone 5.0: Iniciando módulos...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Esconder loader se ainda estiver visível
const loader = document.getElementById('app-loader');
if (loader) {
  setTimeout(() => {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
  }, 500);
}
