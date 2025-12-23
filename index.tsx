
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("SpyPhone 5.0: Inicializando núcleos do sistema...");

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  // Envelopamos em um pequeno timeout para garantir que o render iniciou antes de remover o loader
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Função para remover o loader suavemente
  const hideLoader = () => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }
  };

  // Tenta esconder o loader rapidamente
  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
    // Backup: esconde de qualquer jeito após 1 segundo se chegamos aqui
    setTimeout(hideLoader, 1000);
  }
} else {
  console.error("Erro Fatal: Elemento #root não encontrado.");
}
