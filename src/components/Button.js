export function Button({ label, variant = 'primary', onClick, id, disabled = false }) {
  const btn = document.createElement('button');
  btn.className = `sh-btn sh-btn-${variant}`;
  btn.textContent = label;
  if (id) btn.id = id;
  btn.disabled = disabled;
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}
