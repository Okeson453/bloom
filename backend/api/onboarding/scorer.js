// Utility file: score quiz responses and generate recommendations
function scoreQuiz(responses) {
    if (!responses || typeof responses !== 'object') {
        throw new Error('Invalid quiz responses')
    }

    let score = 0
    let riskProfile = 'moderate'

    // Simple scoring logic
    if (responses.age && responses.age > 50) {
        score += 10
    }
    if (responses.experience === 'beginner') {
        score += 5
    }
    if (responses.timeHorizon === 'long') {
        score += 20
    }
    if (responses.investmentGoal === 'growth') {
        score += 15
    }

    // Determine risk profile
    if (score < 20) {
        riskProfile = 'conservative'
    } else if (score > 40) {
        riskProfile = 'aggressive'
    }

    return {
        score,
        riskProfile,
    }
}

function buildRecommendationReason(responses, score) {
    const reasons = []

    if (responses.timeHorizon === 'long') {
        reasons.push('Your long investment horizon allows for higher risk tolerance')
    }

    if (responses.experience === 'beginner') {
        reasons.push('Consider starting with diversified index funds')
    }

    if (responses.investmentGoal === 'income') {
        reasons.push('Focus on dividend-paying stocks and bonds')
    }

    if (score > 40) {
        reasons.push('Your profile suggests a growth-oriented strategy')
    }

    return reasons.join('. ') + '.'
}

module.exports = {
    scoreQuiz,
    buildRecommendationReason,
}
