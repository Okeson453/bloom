import { marketData } from '../data/markets.js';

let watchlistItems = [];

export function addWatch(sym) {
  if (watchlistItems.includes(sym)) return;
  watchlistItems.push(sym);

  const allData = Object.values(marketData).flat();
  const item = allData.find(r => r.sym === sym);
  const wl = document.getElementById('watchlist');
  if (!wl) return;

  if (watchlistItems.length === 1) wl.innerHTML = '';

  const changeClass = item?.up ? 'up' : 'down';
  const changeVal = item?.chg || '';

  wl.insertAdjacentHTML('beforeend', `
    <div class="trending-item">
      <span style="font-weight:700">${sym}</span>
      <span class="${changeClass}">${changeVal}</span>
    </div>
  `);
}