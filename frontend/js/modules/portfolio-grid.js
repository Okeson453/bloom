import { portfolios as fallbackPortfolios } from '../data/portfolios.js';
import portfoliosService from '../services/portfolios.js';
import authService from '../services/auth.js';

let currentFilter = 'all';

export async function renderPortfolios(filter = 'all') {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  currentFilter = filter;

  // Show loading state
  grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;">Loading portfolios...</div>';

  // Fetch portfolios from API
  const result = await portfoliosService.listPortfolios();

  let portfolios = result.success && result.data ? result.data : fallbackPortfolios;

  // Apply filter
  if (filter !== 'all') {
    portfolios = portfolios.filter(p =>
      (p.tags && p.tags.includes(filter)) || p.category === filter
    );
  }

  if (!portfolios || portfolios.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;">No portfolios available</div>';
    return;
  }

  grid.innerHTML = portfolios.map(p => `
    <div class="portfolio-card">
      <div class="pc-header">
        <span class="pc-name">${p.name || p.displayName}</span>
        <span class="pc-badge ${p.riskClass || ''}">${p.risk || p.riskLevel}</span>
      </div>
      <div class="pc-return">
        <div class="pc-return-val" style="color:${p.retColor || '#0A6C4B'}">${p.ret || p.return || 'N/A'}</div>
        <div class="pc-return-label">Avg. 1-Year Return</div>
      </div>
      ${p.alloc ? `<div class="pc-pie">${p.alloc.map(a => `<div class="pie-seg" style="background:${a.c};flex:${a.p}"></div>`).join('')}</div>
      <div class="pc-alloc">${p.alloc.map(a => `<div class="alloc-row"><span class="alloc-name">${a.n}</span><span class="alloc-pct">${a.p}%</span></div>`).join('')}</div>` : ''}
      <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="investPortfolio('${p.id || p.portfolioId}')">Invest Now</button>
    </div>`).join('');
}

export function filterPortfolios(filter, el) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  renderPortfolios(filter);
}

export async function investPortfolio(portfolioId) {
  if (!authService.isLoggedIn()) {
    alert('Please log in to invest');
    window.showPage('login', document.querySelector('.nav-links a'));
    return;
  }

  const amount = prompt('Enter investment amount ($):');
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    alert('Please enter a valid amount');
    return;
  }

  try {
    const result = await portfoliosService.invest(portfolioId, Number(amount));
    if (result.success) {
      alert(`Investment of $${amount} successful!`);
      // Refresh holdings
      window.location.hash = '#/dashboard';
    } else {
      alert(`Investment failed: ${result.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}