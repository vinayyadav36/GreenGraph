export function ProgressBar({ value = 0, max = 100 }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'progress-wrap';

  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  bar.style.width = `${pct}%`;

  const label = document.createElement('span');
  label.className = 'progress-label';
  label.textContent = `${pct}%`;

  wrapper.appendChild(bar);
  wrapper.appendChild(label);
  return wrapper;
}
