export function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) toggle.textContent = isDark ? '🌙' : '☀️';
}

export function initTheme() {
  const saved = localStorage.getItem('bloom-theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) toggle.textContent = '☀️';
  }
}