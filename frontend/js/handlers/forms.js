// ─────────────────────────────────────────────────────────────────
// Form Handlers — Authentication & User Actions
// ─────────────────────────────────────────────────────────────────

import authService from '../services/auth.js';
import usersService from '../services/users.js';
import transactionsService from '../services/transactions.js';
import goalsService from '../services/goals.js';

/**
 * Handle signup form submission
 */
export async function handleSignup(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.email?.value;
    const password = form.password?.value;
    const firstName = form.firstName?.value;
    const lastName = form.lastName?.value;

    if (!email || !password || !firstName || !lastName) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const result = await authService.signup(email, password, firstName, lastName);
        if (result.success) {
            alert(result.message);
            // Redirect to email verification or login
            window.location.hash = '#/login';
        } else {
            alert(`Signup failed: ${result.error}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

/**
 * Handle login form submission
 */
export async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.email?.value;
    const password = form.password?.value;

    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }

    try {
        const result = await authService.login(email, password);
        if (result.success) {
            alert('Login successful!');
            window.location.hash = '#/dashboard';
        } else {
            alert(`Login failed: ${result.error}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

/**
 * Handle logout
 */
export async function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        await authService.logout();
        window.location.hash = '#/home';
    }
}

/**
 * Handle profile update
 */
export async function handleUpdateProfile(event) {
    event.preventDefault();

    const form = event.target;
    const profile = {
        given_name: form.firstName?.value,
        family_name: form.lastName?.value,
        phone_number: form.phone?.value,
    };

    try {
        const result = await usersService.updateProfile(profile);
        if (result.success) {
            alert('Profile updated successfully');
            // Refresh profile
            location.reload();
        } else {
            alert(`Update failed: ${result.error}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

/**
 * Handle deposit (with authentication check)
 * Accepts either a form event or form data object from modal/overlay
 */
export async function handleDeposit(eventOrData) {
    // Check authentication first
    if (!authService.isLoggedIn()) {
        alert('You need to log in to deposit funds');
        window.showPage('login', null);
        return;
    }

    // Handle both event and form data object formats
    let formData;
    if (eventOrData instanceof Event) {
        eventOrData.preventDefault();
        const form = eventOrData.target;
        formData = {
            amount: parseFloat(form.amount?.value),
            method: form.method?.value || 'ach',
            bankAccountId: form.bankAccountId?.value,
            note: form.note?.value,
        };
    } else {
        formData = eventOrData || {};
    }

    const { amount, bankAccountId, method = 'ach', frequency = 'once', note } = formData;

    // Validate
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
            const fee = method === 'wire' ? 15 : 0;
            alert(`✓ Deposit initiated!\n\nAmount: $${amount}\nFee: $${fee}\nMethod: ${method === 'wire' ? 'Wire Transfer' : 'ACH Transfer'}\nStatus: Pending`);
            window.showPage('dashboard', document.querySelector('.nav-links a:nth-child(5)'));
        } else {
            alert(`Error: ${data.error || 'Deposit failed'}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

/**
 * Handle withdrawal (with authentication check)
 * Accepts either a form event or form data object
 */
export async function handleWithdraw(eventOrData) {
    // Check authentication first
    if (!authService.isLoggedIn()) {
        alert('You need to log in to withdraw funds');
        window.showPage('login', null);
        return;
    }

    // Handle both event and form data object formats
    let formData;
    if (eventOrData instanceof Event) {
        eventOrData.preventDefault();
        const form = eventOrData.target;
        formData = {
            amount: parseFloat(form.amount?.value),
            method: form.method?.value || 'ach',
            bankAccountId: form.bankAccountId?.value,
        };
    } else {
        formData = eventOrData || {};
    }

    const { amount, bankAccountId, method = 'ach' } = formData;

    // Validate
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
 * Handle goal creation
 */
export async function handleCreateGoal(event) {
    event.preventDefault();

    const form = event.target;
    const goal = {
        name: form.goalName?.value,
        description: form.description?.value,
        targetAmount: parseFloat(form.targetAmount?.value),
        targetDate: form.targetDate?.value,
        category: form.category?.value,
    };

    if (!goal.name || !goal.targetAmount) {
        alert('Please fill in required fields');
        return;
    }

    try {
        const result = await goalsService.createGoal(goal);
        if (result.success) {
            alert(result.message);
            form.reset();
            // Refresh goals list
            location.reload();
        } else {
            alert(`Goal creation failed: ${result.error}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

/**
 * Handle goal deletion
 */
export async function handleDeleteGoal(goalId) {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
        const result = await goalsService.deleteGoal(goalId);
        if (result.success) {
            alert(result.message);
            location.reload();
        } else {
            alert(`Goal deletion failed: ${result.error}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

/**
 * Handle portfolio rebalance (with authentication check)
 * Accepts either form data object or portfolio ID
 */
export async function handleRebalance(eventOrData) {
    // Check authentication first
    if (!authService.isLoggedIn()) {
        alert('You need to log in to rebalance your portfolio');
        window.showPage('login', null);
        return;
    }

    // Handle both form data object and legacy portfolio ID formats
    let formData = {};
    if (typeof eventOrData === 'string') {
        // Legacy: portfolio ID string
        formData = { portfolioId: eventOrData };
    } else if (eventOrData && typeof eventOrData === 'object') {
        formData = eventOrData;
    }

    const { execute = true, autoRebalance = true } = formData;

    if (!confirm('This will rebalance your portfolio to match your target allocation. Continue?')) {
        return;
    }

    try {
        const response = await fetch('/api/portfolios/rebalance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify({
                execute,
                autoRebalance,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            const summary = data.summary || 'Your portfolio has been restored to target allocation.';
            alert(`✓ Portfolio rebalanced!\n\n${summary}${autoRebalance ? '\n\nAuto-rebalancing enabled for monthly automatic rebalancing.' : ''}`);
            window.showPage('dashboard', document.querySelector('.nav-links a:nth-child(5)'));
        } else {
            alert(`Error: ${data.error || 'Rebalance failed'}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

export default {
    handleSignup,
    handleLogin,
    handleLogout,
    handleUpdateProfile,
    handleDeposit,
    handleWithdraw,
    handleCreateGoal,
    handleDeleteGoal,
    handleRebalance,
};
