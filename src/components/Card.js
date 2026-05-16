export function Card({ title, subtitle, body = '', footer = null }) {
  const card = document.createElement('section');
  card.className = 'sh-card';

  const titleEl = document.createElement('h3');
  titleEl.textContent = title;

  card.appendChild(titleEl);

  if (subtitle) {
    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'muted';
    subtitleEl.textContent = subtitle;
    card.appendChild(subtitleEl);
  }

  if (body) {
    const bodyEl = document.createElement('p');
    bodyEl.textContent = body;
    card.appendChild(bodyEl);
  }

  if (footer) card.appendChild(footer);

  return card;
}
