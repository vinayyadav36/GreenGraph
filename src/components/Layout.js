import { Navbar } from './Navbar.js';
import { Sidebar } from './Sidebar.js';

export function Layout({ activePath, moduleName, content }) {
  const root = document.createElement('div');
  root.className = 'layout-root';

  root.appendChild(Navbar(activePath));

  const body = document.createElement('div');
  body.className = 'layout-body';
  body.appendChild(Sidebar(moduleName));

  const main = document.createElement('main');
  main.className = 'layout-main';
  main.appendChild(content);

  body.appendChild(main);
  root.appendChild(body);
  return root;
}
