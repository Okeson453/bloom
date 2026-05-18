// ─────────────────────────────────────────────────────────────────
// Transactions Service
// ─────────────────────────────────────────────────────────────────

import httpClient from './http.js';
import { API_CONFIG } from '../config/api.js';

class TransactionsService {
    /**
     * Deposit funds
     */
    async deposit(amount, method = 'bank_transfer') {
        try {
            const response = await httpClient.post(
                API_CONFIG.ENDPOINTS.TRANSACTIONS.DEPOSIT,
                { amount, method }
            );
            return {
                success: true,
                data: response.data,
                message: 'Deposit initiated',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Deposit failed',
            };
        }
    }

    /**
     * Withdraw funds
     */
    async withdraw(amount, method = 'bank_transfer') {
        try {
            const response = await httpClient.post(
                API_CONFIG.ENDPOINTS.TRANSACTIONS.WITHDRAW,
                { amount, method }
            );
            return {
                success: true,
                data: response.data,
                message: 'Withdrawal initiated',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Withdrawal failed',
            };
        }
    }

    /**
     * List transactions
     */
    async listTransactions(filters = {}) {
        try {
            const response = await httpClient.get(
                API_CONFIG.ENDPOINTS.TRANSACTIONS.LIST,
                filters
            );
            return {
                success: true,
                data: response.data || [],
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch transactions',
                data: [],
            };
        }
    }
}

export default new TransactionsService();
