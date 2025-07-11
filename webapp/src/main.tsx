import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';

const isDev = import.meta.env.DEV;

createRoot(document.getElementById('root')!).render(
  isDev ? (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  ) : (
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  )
);
