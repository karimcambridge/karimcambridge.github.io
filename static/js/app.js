/**
 * app.js — entry point.
 * Wires the modern, dependency-free modules together.
 */
import { initNavigation } from './modules/navigation.js';
import { initTypewriter } from './modules/typewriter.js';
import { initPortfolio } from './modules/portfolio.js';
import { initShare } from './modules/share.js';

function hideLoader() {
  const loader = document.getElementById('loading');
  if (loader) loader.style.display = 'none';
}

initNavigation();
initPortfolio();
initShare();
initTypewriter(document.getElementById('type-it'), [
  'SOFTWARE ENGINEER',
  'GAME DEVELOPER',
  'SOFTWARE CONSULTANT',
  'SOFTWARE ARCHITECT',
]);

if (document.readyState === 'complete') hideLoader();
else window.addEventListener('load', hideLoader);
