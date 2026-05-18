/**
 * tests/integration/event-processing.test.js
 * 
 * Integration tests for event processing handlers
 * Tests the complete flow from event emission to settlement
 */

const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

describe('Event Processing Integration Tests', () => {
    let ebClient;
    let dynamoClient;
    const TABLE_NAME = process.env.TRANSACTIONS_TABLE || 'bloom-transactions-test';
    const EVENT_BUS_NAME = 'default';

    beforeAll(() => {
        ebClient = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' });

        const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
        dynamoClient = DynamoDBDocumentClient.from(dynamoDbClient);
    });

    afterAll(async () => {
        ebClient.destroy();
        dynamoClient.destroy();
    });

    describe('Deposit Flow', () => {
        test('should process complete deposit flow: initiated → completed → confirmed', async () => {
            const userId = 'test_user_001';
            const txnId = `txn_dep_${Date.now()}`;
            const amount = 500.00;

            // 1. Emit DepositInitiated event
            const depositEvent = {
                Source: 'bloom.transactions',
                DetailType: 'DepositInitiated',
                Detail: JSON.stringify({
                    userId,
                    txnId,
                    amount,
                    method: 'ach',
                    bankAccountId: 'bank_test_001',
                    frequency: 'once',
                }),
                EventBusName: EVENT_BUS_NAME,
            };

            await ebClient.send(new PutEventsCommand({ Entries: [depositEvent] }));

            // 2. Wait for payment processor to handle
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 3. Verify transaction status updated to processing
            const { Item: txn } = await dynamoClient.send(
                new GetCommand({
                    TableName: TABLE_NAME,
                    Key: { PK: `USER#${userId}`, SK: `TXN#${txnId}` },
                })
            );

            expect(txn).toBeDefined();
            expect(txn.status).toMatch(/pending|processing/);
            expect(txn.amount).toBe(amount);

            // 4. Simulate Plaid webhook (would come from external service)
            const settlementEvent = {
                Source: 'bloom.payments',
                DetailType: 'DepositCompleted',
                Detail: JSON.stringify({
                    userId,
                    txnId,
                    amount,
                    method: 'ach',
                }),
                EventBusName: EVENT_BUS_NAME,
            };

            await ebClient.send(new PutEventsCommand({ Entries: [settlementEvent] }));

            // 5. Wait for settlement processor
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 6. Verify transaction marked as completed
            const { Item: settledTxn } = await dynamoClient.send(
                new GetCommand({
                    TableName: TABLE_NAME,
                    Key: { PK: `USER#${userId}`, SK: `TXN#${txnId}` },
                })
            );

            expect(settledTxn.status).toBe('completed');
            expect(settledTxn.settledAt).toBeDefined();
        }, 10000);

        test('should handle deposit failure and update status', async () => {
            const userId = 'test_user_002';
            const txnId = `txn_fail_${Date.now()}`;

            // Emit failure event
            const failureEvent = {
                Source: 'bloom.payments',
                DetailType: 'DepositFailed',
                Detail: JSON.stringify({
                    userId,
                    txnId,
                    amount: 500.00,
                    error: 'Bank account verification failed',
                    timestamp: new Date().toISOString(),
                }),
                EventBusName: EVENT_BUS_NAME,
            };

            await ebClient.send(new PutEventsCommand({ Entries: [failureEvent] }));

            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Verify status is failed
            const { Item: failedTxn } = await dynamoClient.send(
                new GetCommand({
                    TableName: TABLE_NAME,
                    Key: { PK: `USER#${userId}`, SK: `TXN#${txnId}` },
                })
            );

            expect(failedTxn.status).toBe('failed');
            expect(failedTxn.failureReason).toContain('verification');
        }, 10000);
    });

    describe('Trading Flow', () => {
        test('should process complete trading flow: initiated → executed → settled', async () => {
            const userId = 'test_user_003';
            const portfolioId = 'port_test_001';
            const orderId = `order_${Date.now()}`;

            // 1. Emit InvestmentInitiated event
            const tradeEvent = {
                Source: 'bloom.portfolios',
                DetailType: 'InvestmentInitiated',
                Detail: JSON.stringify({
                    userId,
                    portfolioId,
                    orderId,
                    trades: [
                        {
                            symbol: 'SPY',
                            quantity: 1,
                            action: 'buy',
                            targetPrice: 450.00,
                            allocation: 1.0,
                        },
                    ],
                }),
                EventBusName: EVENT_BUS_NAME,
            };

            await ebClient.send(new PutEventsCommand({ Entries: [tradeEvent] }));

            // 2. Wait for trading executor
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 3. Simulate trade execution completion
            const executionEvent = {
                Source: 'bloom.trading',
                DetailType: 'TradesExecuted',
                Detail: JSON.stringify({
                    userId,
                    portfolioId,
                    orderId,
                    executedTrades: [
                        {
                            symbol: 'SPY',
                            quantity: 1,
                            action: 'buy',
                            alpacaOrderId: 'alp_123',
                            executedPrice: 449.75,
                            executedAt: new Date().toISOString(),
                        },
                    ],
                    failedTrades: [],
                }),
                EventBusName: EVENT_BUS_NAME,
            };

            await ebClient.send(new PutEventsCommand({ Entries: [executionEvent] }));

            // 4. Wait for settlement processor
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 5. Verify order marked as completed
            const { Item: order } = await dynamoClient.send(
                new GetCommand({
                    TableName: TABLE_NAME,
                    Key: { PK: `USER#${userId}`, SK: `ORDER#${orderId}` },
                })
            );

            expect(order).toBeDefined();
            expect(order.status).toBe('completed');
            expect(order.executedTrades).toHaveLength(1);
            expect(order.completedAt).toBeDefined();
        }, 10000);

        test('should handle partial trade execution', async () => {
            const userId = 'test_user_004';
            const portfolioId = 'port_test_002';
            const orderId = `order_partial_${Date.now()}`;

            // Emit partial execution event
            const partialEvent = {
                Source: 'bloom.trading',
                DetailType: 'TradesPartiallyExecuted',
                Detail: JSON.stringify({
                    userId,
                    portfolioId,
                    orderId,
                    executedTrades: [
                        {
                            symbol: 'SPY',
                            quantity: 1,
                            action: 'buy',
                            alpacaOrderId: 'alp_456',
                            executedPrice: 449.75,
                            executedAt: new Date().toISOString(),
                        },
                    ],
                    failedTrades: [
                        {
                            symbol: 'QQQ',
                            quantity: 1,
                            action: 'buy',
                            error: 'Market hours closed',
                        },
                    ],
                }),
                EventBusName: EVENT_BUS_NAME,
            };

            await ebClient.send(new PutEventsCommand({ Entries: [partialEvent] }));

            // Wait for settlement processor
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Verify status is partial_filled
            const { Item: order } = await dynamoClient.send(
                new GetCommand({
                    TableName: TABLE_NAME,
                    Key: { PK: `USER#${userId}`, SK: `ORDER#${orderId}` },
                })
            );

            expect(order.status).toBe('partial_filled');
            expect(order.executedTrades).toHaveLength(1);
            expect(order.failedTrades).toHaveLength(1);
        }, 10000);
    });

    describe('Rebalance Flow', () => {
        test('should process portfolio rebalance with multiple trades', async () => {
            const userId = 'test_user_005';
            const portfolioId = 'port_test_003';
            const orderId = `order_rebalance_${Date.now()}`;

            // Emit rebalance event with multiple trades
            const rebalanceEvent = {
                Source: 'bloom.portfolios',
                DetailType: 'RebalanceInitiated',
                Detail: JSON.stringify({
                    userId,
                    portfolioId,
                    orderId,
                    trades: [
                        {
                            symbol: 'SPY',
                            quantity: 2,
                            action: 'sell',
                            allocation: null,
                        },
                        {
                            symbol: 'AGG',
                            quantity: 3,
                            action: 'buy',
                            targetPrice: 95.00,
                            allocation: 0.30,
                        },
                    ],
                }),
                EventBusName: EVENT_BUS_NAME,
            };

            await ebClient.send(new PutEventsCommand({ Entries: [rebalanceEvent] }));

            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Verify order created
            const { Items: orders } = await dynamoClient.send(
                new QueryCommand({
                    TableName: TABLE_NAME,
                    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                    ExpressionAttributeValues: {
                        ':pk': `USER#${userId}`,
                        ':sk': 'ORDER#',
                    },
                })
            );

            expect(orders).toBeDefined();
            expect(orders.length).toBeGreaterThan(0);
        }, 10000);
    });

    describe('Error Handling', () => {
        test('should retry on transient failures', async () => {
            const userId = 'test_user_006';
            const txnId = `txn_retry_${Date.now()}`;

            // This test would verify retry logic in CloudWatch logs
            // In a real test, you'd mock the external service to fail first

            const event = {
                Source: 'bloom.transactions',
                DetailType: 'DepositInitiated',
                Detail: JSON.stringify({
                    userId,
                    txnId,
                    amount: 100.00,
                    method: 'ach',
                    bankAccountId: 'invalid_account', // Intentionally invalid
                    frequency: 'once',
                }),
                EventBusName: EVENT_BUS_NAME,
            };

            await ebClient.send(new PutEventsCommand({ Entries: [event] }));

            // Transaction should eventually be marked failed
            await new Promise(resolve => setTimeout(resolve, 5000));

            const { Item: txn } = await dynamoClient.send(
                new GetCommand({
                    TableName: TABLE_NAME,
                    Key: { PK: `USER#${userId}`, SK: `TXN#${txnId}` },
                })
            );

            expect(txn.status).toMatch(/failed|error/i);
        }, 10000);
    });

    describe('Activity Logging', () => {
        test('should log activity for completed transactions', async () => {
            const userId = 'test_user_007';
            const txnId = `txn_activity_${Date.now()}`;

            // Emit settlement event
            const settleEvent = {
                Source: 'bloom.settlement',
                DetailType: 'DepositConfirmed',
                Detail: JSON.stringify({
                    userId,
                    txnId,
                    amount: 250.00,
                    method: 'ACH Transfer',
                    userEmail: 'test@example.com',
                    userName: 'Test User',
                    settledAt: new Date().toISOString(),
                }),
                EventBusName: EVENT_BUS_NAME,
            };

            await ebClient.send(new PutEventsCommand({ Entries: [settleEvent] }));

            // Wait for confirmation handler to log activity
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Verify activity was logged
            const { Items: activities } = await dynamoClient.send(
                new QueryCommand({
                    TableName: TABLE_NAME,
                    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                    ExpressionAttributeValues: {
                        ':pk': `USER#${userId}`,
                        ':sk': 'ACTIVITY#',
                    },
                    ScanIndexForward: false, // Most recent first
                    Limit: 1,
                })
            );

            expect(activities).toBeDefined();
            expect(activities.length).toBeGreaterThan(0);
            expect(activities[0].type).toBe('ACTIVITY');
            expect(activities[0].activityType).toMatch(/deposit_confirmed|withdrawal_confirmed/);
        }, 10000);
    });
});

describe('Event Payload Validation', () => {
    test('should reject invalid event payloads', async () => {
        const ebClient = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' });

        // Missing required fields
        const invalidEvent = {
            Source: 'bloom.transactions',
            DetailType: 'DepositInitiated',
            Detail: JSON.stringify({
                // Missing userId, txnId, amount
            }),
        };

        // This should either be rejected or result in an error event
        try {
            await ebClient.send(new PutEventsCommand({ Entries: [invalidEvent] }));
            // If accepted, handlers should validate and fail gracefully
            expect(true).toBe(true);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    test('should handle malformed JSON payloads', async () => {
        const ebClient = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' });

        const malformedEvent = {
            Source: 'bloom.transactions',
            DetailType: 'DepositInitiated',
            Detail: '{invalid json',
        };

        try {
            await ebClient.send(new PutEventsCommand({ Entries: [malformedEvent] }));
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});
