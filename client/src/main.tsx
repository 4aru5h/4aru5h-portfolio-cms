import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/jetbrains-mono';
import './styles/index.css';
import App from './App';
import { shouldPlayIntro } from './components/Intro';

// Decided before the first render so the hero can hold its entrance until the intro lifts.
if (shouldPlayIntro()) document.documentElement.classList.add('intro-play');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
