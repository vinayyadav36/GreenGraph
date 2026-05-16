export function Sidebar(moduleName) {
  const aside = document.createElement('aside');
  aside.className = 'sidebar';

  const title = document.createElement('h4');
  title.textContent = 'Current Module';

  const moduleText = document.createElement('p');
  moduleText.textContent = moduleName;

  aside.appendChild(title);
  aside.appendChild(moduleText);
  return aside;
}
