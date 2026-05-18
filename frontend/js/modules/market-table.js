import { marketData as fallbackMarketData } from '../data/markets.js';
import marketsService from '../services/markets.js';

let currentMarketTab = 'stocks';
let cachedQuotes = {};

export async function renderMarketTable(tab = currentMarketTab, filter = '') {
  const tbody = document.getElementById('marketBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">Loading market data...</td></tr>';

  currentMarketTab = tab;

  // Use fallback data structure for symbol list
  const fallbackData = fallbackMarketData[tab] || [];
  let data = fallbackData;

  // Try to fetch real quotes
  if (fallbackData.length > 0) {
    const symbols = fallbackData.map(r => r.sym);
    const result = await marketsService.getQuotes(symbols);

    if (result.success && result.data) {
      cachedQuotes[tab] = result.data;
      // Merge API data with fallback structure
      data = fallbackData.map(r => ({
        ...r,
        ...(result.data[r.sym] || {})
      }));
    }
  }

  // Apply filter
  data = data.filter(r =>
    r.sym.toLowerCase().includes(filter.toLowerCase()) ||
    r.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">No data available</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(r => `
    <tr>
      <td class="symbol-cell">${r.sym}</td>
      <td style="color:var(--text2)">${r.name}</td>
      <td style="font-weight:700">${r.price || 'N/A'}</td>
      <td class="${(r.chg && r.chg.includes('+')) || r.up ? 'up' : 'down'}" style="font-weight:700">${r.chg || 'N/A'}</td>
      <td style="color:var(--text3)">${r.cap || 'N/A'}</td>
      <td><button class="btn btn-teal" style="padding:5px 12px;font-size:.75rem" onclick="addWatch('${r.sym}')">+ Watch</button></td>
    </tr>`).join('');
}

export function switchMarketTab(tab, el) {
  currentMarketTab = tab;
  document.querySelectorAll('#marketTabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  const search = document.getElementById('marketSearch');
  if (search) search.value = '';
  renderMarketTable(tab);
}

export function filterMarket(val) {
  renderMarketTable(currentMarketTab, val);
}