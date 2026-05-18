import { renderMarketTable } from './modules/market-table.js';
import { drawChart, chartData } from './modules/chart.js';
import { renderPortfolios } from './modules/portfolio-grid.js';
import { initCalculator } from './modules/calculator.js';
import { initCarousel } from './modules/carousel.js';

const pageCache = {};
let currentPage = null;

/**
 * Navigate to a page (called from hash or onclick handlers)
 */
export async function showPage(id, linkEl) {
  try {
    const app = document.getElementById('app');
    if (!app) {
      console.error('App container not found');
      return;
    }

    // Update nav links
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    if (linkEl) {
      linkEl.classList.add('active');
    }

    // Load page if not cached
    if (!pageCache[id]) {
      const res = await fetch(`pages/${id}.html`);
      if (!res.ok) throw new Error(`Failed to load ${id}.html`);
      pageCache[id] = await res.text();
    }

    // Replace content
    app.innerHTML = pageCache[id];

    // Add active class to the new page
    setTimeout(() => {
      const page = document.getElementById(id);
      if (page) {
        page.classList.add('active');
        currentPage = id;
      }
    }, 0);

    window.scrollTo(0, 0);

    // Initialize page-specific content
    if (id === 'home') {
      initCalculator();
      initCarousel();
    }
    if (id === 'markets') {
      renderMarketTable();
    }
    if (id === 'dashboard') {
      drawChart(chartData['1M']);
    }
    if (id === 'invest') {
      renderPortfolios('all');
    }
    if (id === 'deposit') {
      // Initialize deposit page
    }
    if (id === 'withdraw') {
      // Initialize withdraw page
    }
    if (id === 'rebalance') {
      // Initialize rebalance page
    }
  } catch (e) {
    console.error('Error in showPage:', e);
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = `<div style="padding:40px;text-align:center;color:#c33"><h2>Error loading page</h2><p>${e.message}</p></div>`;
    }
  }
}

/**
 * Handle hash navigation (SPA routing)
 */
function handleHashNavigation() {
  const hash = window.location.hash.slice(1); // Remove '#' prefix
  const pageId = hash || 'home';

  // Get the corresponding nav link
  const navLink = document.querySelector(`.nav-links a[href="#${pageId}"]`);
  showPage(pageId, navLink);
}

/**
 * Initialize router and listen for hash changes
 */
export function initRouter() {
  // Handle initial page load
  handleHashNavigation();

  // Listen for hash changes
  window.addEventListener('hashchange', handleHashNavigation);
}