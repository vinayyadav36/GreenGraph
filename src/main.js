import './styles.css';
import { renderRoute } from './router.js';

const root = document.getElementById('app') || document.getElementById('root');

if (!root) {
  throw new Error('Root container not found');
}

async function init() {
  if (!window.location.hash) {
    window.location.hash = '#/fundamentals';
    return;
  }
  await renderRoute(root);
}

window.addEventListener('hashchange', () => {
  renderRoute(root);
});

init();
