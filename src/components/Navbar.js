const navItems = [
  { path: '/fundamentals', label: 'Fundamentals Lab' },
  { path: '/exam', label: 'Exam Engine' },
  { path: '/career', label: 'Career Launchpad' },
  { path: '/projects', label: 'Project Studio' },
];

export function Navbar(activePath = '/fundamentals') {
  const nav = document.createElement('header');
  nav.className = 'navbar';

  const banner = document.createElement('div');
  banner.className = 'brand';
  banner.textContent = '==================== SALTEDHASH ====================';

  const links = document.createElement('nav');
  links.className = 'nav-links';

  for (const item of navItems) {
    const a = document.createElement('a');
    a.href = `#${item.path}`;
    a.textContent = item.label;
    if (activePath.startsWith(item.path)) a.className = 'active';
    links.appendChild(a);
  }

  nav.appendChild(banner);
  nav.appendChild(links);
  return nav;
}
