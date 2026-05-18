// Seed articles with sample data
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
})

async function seedArticles() {
    try {
        console.log('🌱 Seeding articles...')

        const articles = [
            {
                slug: 'getting-started-investing',
                title: 'Getting Started with Investing',
                description: 'Learn the basics of investing and why it matters',
                content:
                    '<h2>Introduction</h2><p>Investing is a powerful way to build wealth over time. Start with the basics and build from there.</p>',
                category: 'basics',
                author: 'Bloom Finance',
                featured: true,
            },
            {
                slug: 'portfolio-diversification',
                title: 'The Power of Portfolio Diversification',
                description: 'Why spreading your investments matters',
                content:
                    "<h2>Diversification Principles</h2><p>Don't put all your eggs in one basket. Diversification helps reduce risk.</p>",
                category: 'strategies',
                author: 'Bloom Finance',
                featured: true,
            },
            {
                slug: 'dollar-cost-averaging',
                title: 'Understanding Dollar-Cost Averaging',
                description: 'A practical investment strategy for beginners',
                content:
                    '<h2>What is DCA?</h2><p>Dollar-cost averaging is investing a fixed amount regularly regardless of market conditions.</p>',
                category: 'strategies',
                author: 'Bloom Finance',
                featured: false,
            },
            {
                slug: 'market-volatility',
                title: 'Dealing with Market Volatility',
                description: 'How to stay calm during market swings',
                content:
                    '<h2>Understanding Volatility</h2><p>Market fluctuations are normal. Stay focused on your long-term goals.</p>',
                category: 'risk-management',
                author: 'Bloom Finance',
                featured: false,
            },
            {
                slug: 'emergency-fund',
                title: 'Building Your Emergency Fund',
                description: 'Financial security starts with an emergency fund',
                content:
                    '<h2>Why Emergency Funds Matter</h2><p>Before investing, ensure you have adequate liquid savings for emergencies.</p>',
                category: 'basics',
                author: 'Bloom Finance',
                featured: true,
            },
        ]

        const { data, error } = await supabase.from('articles').insert(articles).select()

        if (error) {
            console.error('Error creating articles:', error)
            return
        }

        console.log(`✅ Created ${data.length} articles`)
    } catch (error) {
        console.error('Seed error:', error)
        process.exit(1)
    }

    process.exit(0)
}

seedArticles()
