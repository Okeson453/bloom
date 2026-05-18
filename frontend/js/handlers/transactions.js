// ─────────────────────────────────────────────────────────────────
// Deposit/Withdraw/Rebalance Handlers Extension
// ─────────────────────────────────────────────────────────────────

import authService from '../services/auth.js';

/**
 * Enhanced deposit handler supporting frontend form data
 */
export async function handleDeposit(formData) {
    if (!authService.isLoggedIn()) {
        alert('You need to log in to deposit funds');
        window.showPage('login', null);
        return;
    }

    const { amount, bankAccountId, method, frequency, note } = formData;

    if (!amount || amount < 10 || amount > 50000) {
        alert('Invalid amount. Minimum: $10, Maximum: $50,000');
        return;
    }

    if (!bankAccountId) {
        alert('Please select a bank account');
        return;
    }

    try {
        const response = await fetch('/api/transactions/deposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify({
                amount,
                bankAccountId,
                method: method || 'ach',
                frequency: frequency || 'once',
                note,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(`✓ Deposit initiated!\n\nAmount: $${amount}\nMethod: ${method === 'wire' ? 'Wire Transfer' : 'ACH Transfer'}\nStatus: Pending`);
            window.showPage('dashboard', document.querySelector('.nav-links a:nth-child(5)'));
        } else {
            alert(`Error: ${data.error || 'Deposit failed'}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

/**
 * Enhanced withdrawal handler supporting frontend form data
 */
export async function handleWithdraw(formData) {
    if (!authService.isLoggedIn()) {
        alert('You need to log in to withdraw funds');
        window.showPage('login', null);
        return;
    }

    const { amount, bankAccountId, method } = formData;

    if (!amount || amount < 10) {
        alert('Invalid amount. Minimum: $10');
        return;
    }

    if (!bankAccountId) {
        alert('Please select a destination bank account');
        return;
    }

    try {
        const response = await fetch('/api/transactions/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify({
                amount,
                bankAccountId,
                method: method || 'ach',
            }),
        });

        const data = await response.json();

        if (response.ok) {
            const fee = method === 'wire' ? 15 : 0;
            const netAmount = amount - fee;
            alert(`✓ Withdrawal initiated!\n\nAmount: $${amount}\nFee: $${fee}\nYou'll receive: $${netAmount}\nStatus: Pending`);
            window.showPage('dashboard', document.querySelector('.nav-links a:nth-child(5)'));
        } else {
            alert(`Error: ${data.error || 'Withdrawal failed'}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

/**
 * Enhanced rebalance handler
 */
export async function handleRebalance(formData) {
    if (!authService.isLoggedIn()) {
        alert('You need to log in to rebalance');
        window.showPage('login', null);
        return;
    }

    const { execute, autoRebalance } = formData || {};

    try {
        const response = await fetch('/api/portfolios/rebalance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify({
                execute: execute !== false,
                autoRebalance: autoRebalance !== false,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(`✓ Portfolio rebalanced!\n\n${data.summary || 'Your portfolio has been restored to target allocation.'}`);
            window.showPage('dashboard', document.querySelector('.nav-links a:nth-child(5)'));
        } else {
            alert(`Error: ${data.error || 'Rebalance failed'}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

export default {
    handleDeposit,
    handleWithdraw,
    handleRebalance,
};
