
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("SpyPhone 5.0: Kernels iniciados.");

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Força a remoção do loader após a montagem do React
  setTimeout(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.style.display = 'none', 500);
    }
  }, 1000);
}
