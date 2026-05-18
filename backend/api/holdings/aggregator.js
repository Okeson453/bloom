// Utility file: build time series from snapshots
function buildTimeSeries(snapshots, metric = 'total_value') {
    if (!snapshots || snapshots.length === 0) {
        return []
    }

    return snapshots
        .sort((a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date))
        .map((snapshot, index) => {
            const previousValue = index > 0 ? snapshots[index - 1][metric] : snapshot[metric]
            const currentValue = snapshot[metric]
            const dailyChange = currentValue - previousValue
            const dailyChangePercent = ((dailyChange / previousValue) * 100).toFixed(2)

            return {
                date: snapshot.snapshot_date,
                value: currentValue,
                dailyChange,
                dailyChangePercent: parseFloat(dailyChangePercent),
            }
        })
}

module.exports = {
    buildTimeSeries,
}
