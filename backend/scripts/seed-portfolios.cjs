// Seed portfolios with sample data
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

// Sample user ID (replace with actual user ID from your Supabase Auth)
const SAMPLE_USER_ID = '550e8400-e29b-41d4-a716-446655440000'

async function seedPortfolios() {
    try {
        console.log('🌱 Seeding portfolios...')

        // Create sample portfolios
        const { data: portfolios, error: portfolioError } = await supabase
            .from('portfolios')
            .insert([
                {
                    user_id: SAMPLE_USER_ID,
                    name: 'Core Growth Portfolio',
                    description: 'Long-term growth portfolio',
                    risk_level: 'medium',
                    total_invested: 25000,
                    current_value: 28500,
                },
                {
                    user_id: SAMPLE_USER_ID,
                    name: 'Dividend Income',
                    description: 'High-dividend stocks',
                    risk_level: 'low',
                    total_invested: 15000,
                    current_value: 15750,
                },
                {
                    user_id: SAMPLE_USER_ID,
                    name: 'Tech Focused',
                    description: 'Technology sector focus',
                    risk_level: 'high',
                    total_invested: 10000,
                    current_value: 12000,
                },
            ])
            .select()

        if (portfolioError) {
            console.error('Error creating portfolios:', portfolioError)
            return
        }

        console.log(`✅ Created ${portfolios.length} portfolios`)

        // Create sample assets for each portfolio
        const assets = []
        if (portfolios && portfolios.length > 0) {
            assets.push(
                {
                    portfolio_id: portfolios[0].id,
                    symbol: 'VTI',
                    quantity: 50,
                    purchase_price: 200,
                    current_price: 220,
                    weight: 0.4,
                },
                {
                    portfolio_id: portfolios[0].id,
                    symbol: 'BND',
                    quantity: 100,
                    purchase_price: 80,
                    current_price: 78,
                    weight: 0.3,
                },
                {
                    portfolio_id: portfolios[0].id,
                    symbol: 'VEA',
                    quantity: 75,
                    purchase_price: 50,
                    current_price: 52,
                    weight: 0.3,
                },
                {
                    portfolio_id: portfolios[1].id,
                    symbol: 'VYM',
                    quantity: 60,
                    purchase_price: 150,
                    current_price: 155,
                    weight: 0.5,
                },
                {
                    portfolio_id: portfolios[1].id,
                    symbol: 'SCHD',
                    quantity: 40,
                    purchase_price: 75,
                    current_price: 78,
                    weight: 0.5,
                },
                {
                    portfolio_id: portfolios[2].id,
                    symbol: 'QQQ',
                    quantity: 25,
                    purchase_price: 350,
                    current_price: 380,
                    weight: 0.6,
                },
                {
                    portfolio_id: portfolios[2].id,
                    symbol: 'ARKK',
                    quantity: 30,
                    purchase_price: 65,
                    current_price: 72,
                    weight: 0.4,
                },
            )

            const { error: assetError } = await supabase.from('portfolio_assets').insert(assets)

            if (assetError) {
                console.error('Error creating assets:', assetError)
                return
            }

            console.log(`✅ Created ${assets.length} portfolio assets`)
        }
    } catch (error) {
        console.error('Seed error:', error)
        process.exit(1)
    }

    process.exit(0)
}

seedPortfolios()
