import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 🚫 Retiré StrictMode pour éviter double exécution en dev
createRoot(document.getElementById('root')!).render(
  <App />
);
