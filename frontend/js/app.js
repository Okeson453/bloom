import { showPage } from './router.js';
import { toggleTheme, initTheme } from './theme.js';
import { updateCalc, initCalculator } from './modules/calculator.js';
import { goTesti, initCarousel } from './modules/carousel.js';
import { drawChart, switchPerf } from './modules/chart.js';
import { renderMarketTable, switchMarketTab, filterMarket } from './modules/market-table.js';
import { renderPortfolios, filterPortfolios, investPortfolio } from './modules/portfolio-grid.js';
import { addWatch } from './modules/watchlist.js';
import { openModal, closeModal, closeModalOutside, renderQuizStep, selectQuizOpt, quizBack, completeQuiz } from './modules/quiz-modal.js';
import formHandlers from './handlers/forms.js';
import authService from './services/auth.js';

// Register global functions for HTML onclick handlers
window.showPage = showPage;
window.toggleTheme = toggleTheme;
window.updateCalc = updateCalc;
window.goTesti = goTesti;
window.drawChart = drawChart;
window.switchPerf = switchPerf;
window.renderMarketTable = renderMarketTable;
window.switchMarketTab = switchMarketTab;
window.filterMarket = filterMarket;
window.renderPortfolios = renderPortfolios;
window.filterPortfolios = filterPortfolios;
window.investPortfolio = investPortfolio;
window.addWatch = addWatch;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeModalOutside = closeModalOutside;
window.renderQuizStep = renderQuizStep;
window.selectQuizOpt = selectQuizOpt;
window.quizBack = quizBack;
window.completeQuiz = completeQuiz;

// Register form handlers
window.handleSignup = formHandlers.handleSignup;
window.handleLogin = formHandlers.handleLogin;
window.handleLogout = formHandlers.handleLogout;
window.handleUpdateProfile = formHandlers.handleUpdateProfile;
window.handleDeposit = formHandlers.handleDeposit;
window.handleWithdraw = formHandlers.handleWithdraw;
window.handleCreateGoal = formHandlers.handleCreateGoal;
window.handleDeleteGoal = formHandlers.handleDeleteGoal;
window.handleRebalance = formHandlers.handleRebalance;

/**
 * Handle quick action buttons (Deposit, Withdraw, Rebalance)
 */
window.handleQuickAction = function (action) {
  // Check authentication first
  if (!authService.isLoggedIn()) {
    const actionLabel = action === 'deposit' ? 'deposit funds' : action === 'withdraw' ? 'withdraw funds' : 'rebalance portfolio';
    const redirect = confirm(`You need to log in to ${actionLabel}. Would you like to log in now?`);
    if (redirect) {
      window.location.hash = '#/login';
    }
    return;
  }

  switch (action) {
    case 'deposit':
      // Show deposit modal or navigate to deposit page
      alert('Deposit feature coming soon. Navigate to Transactions to deposit funds.');
      break;
    case 'withdraw':
      // Show withdraw modal or navigate to withdraw page
      alert('Withdrawal feature coming soon. Navigate to Transactions to withdraw funds.');
      break;
    case 'rebalance':
      // Rebalance the main portfolio
      const mainPortfolioId = 'main'; // This should be fetched from user data
      if (confirm('This will rebalance your portfolio to match your target allocation. Continue?')) {
        window.handleRebalance(mainPortfolioId);
      }
      break;
    default:
      alert('Unknown action');
  }
};

/**
 * Set deposit amount from quick amount buttons
 */
window.setDepositAmount = function (amount) {
  const input = document.getElementById('depositAmount');
  if (input) {
    input.value = amount;
    input.focus();
  }
};

/**
 * Set deposit method (ACH or Wire)
 */
window.setDepositMethod = function (method) {
  const radios = document.querySelectorAll('input[name="method"]');
  radios.forEach(radio => {
    if (radio.value === method) {
      radio.checked = true;
    }
  });
};

/**
 * Set deposit frequency (One Time or Monthly Auto)
 */
window.setFrequency = function (frequency) {
  const radios = document.querySelectorAll('input[name="frequency"]');
  radios.forEach(radio => {
    if (radio.value === frequency) {
      radio.checked = true;
    }
  });
};

/**
 * Execute portfolio rebalance
 */
window.executeRebalance = function () {
  const form = document.getElementById('rebalanceForm');
  if (form) {
    form.dispatchEvent(new Event('submit'));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  // Check authentication status and update UI
  if (authService.isLoggedIn()) {
    const user = authService.getCurrentUser();
    const loginBtn = document.querySelector('.nav-actions .btn:nth-child(2)');
    const signupBtn = document.querySelector('.nav-actions .btn:nth-child(3)');

    if (loginBtn && signupBtn) {
      loginBtn.textContent = user?.given_name || 'Account';
      loginBtn.onclick = () => window.showPage('dashboard', document.querySelector('.nav-links a:nth-child(5)'));
      signupBtn.textContent = 'Log Out';
      signupBtn.onclick = () => window.handleLogout();
    }
  }

  showPage('home', document.querySelector('.nav-links a.active'));
});