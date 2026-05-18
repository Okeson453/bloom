#!/bin/bash
# setup-eventbridge.sh
# 
# Sets up EventBridge rules and targets for event processing handlers
# Usage: ./setup-eventbridge.sh [environment]

set -e

ENVIRONMENT=${1:-staging}
AWS_REGION=${AWS_REGION:-us-east-1}
EVENT_BUS_NAME="bloom-events"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up EventBridge for Bloom Finance (${ENVIRONMENT})${NC}"

# Get Lambda function ARNs
PAYMENT_PROCESSOR_ARN=$(aws lambda get-function-arn --function-name bloom-payment-processor-${ENVIRONMENT} --region ${AWS_REGION} 2>/dev/null | jq -r '.FunctionArn' || echo "")
TRADING_EXECUTOR_ARN=$(aws lambda get-function-arn --function-name bloom-trading-executor-${ENVIRONMENT} --region ${AWS_REGION} 2>/dev/null | jq -r '.FunctionArn' || echo "")
SETTLEMENT_PROCESSOR_ARN=$(aws lambda get-function-arn --function-name bloom-settlement-processor-${ENVIRONMENT} --region ${AWS_REGION} 2>/dev/null | jq -r '.FunctionArn' || echo "")
CONFIRMATION_HANDLER_ARN=$(aws lambda get-function-arn --function-name bloom-confirmation-handler-${ENVIRONMENT} --region ${AWS_REGION} 2>/dev/null | jq -r '.FunctionArn' || echo "")

if [ -z "$PAYMENT_PROCESSOR_ARN" ]; then
    echo -e "${RED}✗ Could not find Lambda functions. Ensure they are deployed first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found Lambda functions${NC}"

# Get role for EventBridge
ROLE_ARN=$(aws iam get-role --role-name EventBridgeLambdaRole --region ${AWS_REGION} 2>/dev/null | jq -r '.Role.Arn' || echo "")

if [ -z "$ROLE_ARN" ]; then
    echo -e "${YELLOW}⚠ EventBridgeLambdaRole not found. Creating...${NC}"
    
    # Create role
    aws iam create-role \
        --role-name EventBridgeLambdaRole \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {"Service": "events.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }]
        }' \
        --region ${AWS_REGION}

    # Attach policy
    aws iam put-role-policy \
        --role-name EventBridgeLambdaRole \
        --policy-name EventBridgeLambdaPolicy \
        --policy-document '{
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Action": ["lambda:InvokeFunction"],
                "Resource": "*"
            }]
        }' \
        --region ${AWS_REGION}
    
    sleep 5
    ROLE_ARN=$(aws iam get-role --role-name EventBridgeLambdaRole | jq -r '.Role.Arn')
    echo -e "${GREEN}✓ Created EventBridgeLambdaRole${NC}"
fi

# Create EventBridge rules

# 1. Payment Processor Rule
echo "Creating payment processor rule..."
aws events put-rule \
    --name bloom-payment-processor-${ENVIRONMENT} \
    --event-bus-name ${EVENT_BUS_NAME} \
    --event-pattern '{
        "source": ["bloom.transactions"],
        "detail-type": ["DepositInitiated", "WithdrawalInitiated"]
    }' \
    --state ENABLED \
    --region ${AWS_REGION}

aws events put-targets \
    --rule bloom-payment-processor-${ENVIRONMENT} \
    --event-bus-name ${EVENT_BUS_NAME} \
    --targets "Id"="1","Arn"="${PAYMENT_PROCESSOR_ARN}","RoleArn"="${ROLE_ARN}" \
    --region ${AWS_REGION}

echo -e "${GREEN}✓ Payment processor rule created${NC}"

# 2. Trading Executor Rule
echo "Creating trading executor rule..."
aws events put-rule \
    --name bloom-trading-executor-${ENVIRONMENT} \
    --event-bus-name ${EVENT_BUS_NAME} \
    --event-pattern '{
        "source": ["bloom.portfolios"],
        "detail-type": ["InvestmentInitiated", "RebalanceInitiated"]
    }' \
    --state ENABLED \
    --region ${AWS_REGION}

aws events put-targets \
    --rule bloom-trading-executor-${ENVIRONMENT} \
    --event-bus-name ${EVENT_BUS_NAME} \
    --targets "Id"="1","Arn"="${TRADING_EXECUTOR_ARN}","RoleArn"="${ROLE_ARN}" \
    --region ${AWS_REGION}

echo -e "${GREEN}✓ Trading executor rule created${NC}"

# 3. Settlement Processor Rule
echo "Creating settlement processor rule..."
aws events put-rule \
    --name bloom-settlement-processor-${ENVIRONMENT} \
    --event-bus-name ${EVENT_BUS_NAME} \
    --event-pattern '{
        "source": ["bloom.trading", "bloom.payments"],
        "detail-type": [
            "TradesExecuted",
            "TradesPartiallyExecuted",
            "TradesExecutionFailed",
            "DepositCompleted",
            "WithdrawalCompleted",
            "DepositFailed",
            "WithdrawalFailed"
        ]
    }' \
    --state ENABLED \
    --region ${AWS_REGION}

aws events put-targets \
    --rule bloom-settlement-processor-${ENVIRONMENT} \
    --event-bus-name ${EVENT_BUS_NAME} \
    --targets "Id"="1","Arn"="${SETTLEMENT_PROCESSOR_ARN}","RoleArn"="${ROLE_ARN}" \
    --region ${AWS_REGION}

echo -e "${GREEN}✓ Settlement processor rule created${NC}"

# 4. Confirmation Handler Rule
echo "Creating confirmation handler rule..."
aws events put-rule \
    --name bloom-confirmation-handler-${ENVIRONMENT} \
    --event-bus-name ${EVENT_BUS_NAME} \
    --event-pattern '{
        "source": ["bloom.settlement"],
        "detail-type": [
            "SettlementConfirmed",
            "PartialSettlementConfirmed",
            "DepositConfirmed",
            "WithdrawalConfirmed",
            "DepositFailed",
            "WithdrawalFailed",
            "SettlementFailed"
        ]
    }' \
    --state ENABLED \
    --region ${AWS_REGION}

aws events put-targets \
    --rule bloom-confirmation-handler-${ENVIRONMENT} \
    --event-bus-name ${EVENT_BUS_NAME} \
    --targets "Id"="1","Arn"="${CONFIRMATION_HANDLER_ARN}","RoleArn"="${ROLE_ARN}" \
    --region ${AWS_REGION}

echo -e "${GREEN}✓ Confirmation handler rule created${NC}"

# Grant Lambda permissions
echo "Granting Lambda invoke permissions..."

aws lambda add-permission \
    --function-name bloom-payment-processor-${ENVIRONMENT} \
    --statement-id AllowEventBridgeInvoke \
    --action lambda:InvokeFunction \
    --principal events.amazonaws.com \
    --source-arn "arn:aws:events:${AWS_REGION}:$(aws sts get-caller-identity | jq -r '.Account'):rule/${EVENT_BUS_NAME}/bloom-payment-processor-${ENVIRONMENT}" \
    --region ${AWS_REGION} 2>/dev/null || true

aws lambda add-permission \
    --function-name bloom-trading-executor-${ENVIRONMENT} \
    --statement-id AllowEventBridgeInvoke \
    --action lambda:InvokeFunction \
    --principal events.amazonaws.com \
    --source-arn "arn:aws:events:${AWS_REGION}:$(aws sts get-caller-identity | jq -r '.Account'):rule/${EVENT_BUS_NAME}/bloom-trading-executor-${ENVIRONMENT}" \
    --region ${AWS_REGION} 2>/dev/null || true

aws lambda add-permission \
    --function-name bloom-settlement-processor-${ENVIRONMENT} \
    --statement-id AllowEventBridgeInvoke \
    --action lambda:InvokeFunction \
    --principal events.amazonaws.com \
    --source-arn "arn:aws:events:${AWS_REGION}:$(aws sts get-caller-identity | jq -r '.Account'):rule/${EVENT_BUS_NAME}/bloom-settlement-processor-${ENVIRONMENT}" \
    --region ${AWS_REGION} 2>/dev/null || true

aws lambda add-permission \
    --function-name bloom-confirmation-handler-${ENVIRONMENT} \
    --statement-id AllowEventBridgeInvoke \
    --action lambda:InvokeFunction \
    --principal events.amazonaws.com \
    --source-arn "arn:aws:events:${AWS_REGION}:$(aws sts get-caller-identity | jq -r '.Account'):rule/${EVENT_BUS_NAME}/bloom-confirmation-handler-${ENVIRONMENT}" \
    --region ${AWS_REGION} 2>/dev/null || true

echo -e "${GREEN}✓ Lambda permissions granted${NC}"

echo ""
echo -e "${GREEN}✓ EventBridge setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Test with: aws events put-events --entries file://test-event.json"
echo "2. Monitor with: aws logs tail /aws/lambda/payment-processor --follow"
echo "3. View rules: aws events list-rules --event-bus-name ${EVENT_BUS_NAME}"
