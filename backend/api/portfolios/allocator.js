// Utility file: allocate investments across assets
function allocate(investmentAmount, assets, riskLevel = 'medium') {
    if (!assets || assets.length === 0) {
        throw new Error('Assets array cannot be empty')
    }

    const totalWeight = assets.reduce((sum, a) => sum + (a.weight || 0), 0)
    if (totalWeight <= 0) {
        throw new Error('Total weight must be greater than 0')
    }

    const normalizedAssets = assets.map((asset) => ({
        ...asset,
        weight: asset.weight / totalWeight,
    }))

    return normalizedAssets.map((asset) => ({
        symbol: asset.symbol,
        allocation: investmentAmount * asset.weight,
        quantity: (investmentAmount * asset.weight) / (asset.price || 100),
    }))
}

function mergeHoldings(existing, newHoldings) {
    const merged = { ...existing }

    for (const holding of newHoldings) {
        if (merged[holding.symbol]) {
            const existingQty = merged[holding.symbol].quantity
            const existingAvgCost = merged[holding.symbol].avgCost
            const newQty = holding.quantity
            const newCost = holding.cost

            const totalQty = existingQty + newQty
            const totalCost = existingQty * existingAvgCost + newQty * newCost

            merged[holding.symbol] = {
                quantity: totalQty,
                avgCost: totalCost / totalQty,
            }
        } else {
            merged[holding.symbol] = {
                quantity: holding.quantity,
                avgCost: holding.cost,
            }
        }
    }

    return merged
}

module.exports = {
    allocate,
    mergeHoldings,
}
