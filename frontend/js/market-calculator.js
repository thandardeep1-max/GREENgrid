/**
 * Smart Agriculture Assistant
 * Market Calculator - Price Comparison & Profit Calculation
 */

// ============================================
// Crop Prices Data (Simulated)
// ============================================

const cropPrices = {
    groundnut: {
        name: 'Groundnut',
        icon: '🥜',
        govtMandi: 5250,
        privateBuyers: [
            { name: 'ABC Agro Trading', price: 5100 },
            { name: 'Farm Fresh Co.', price: 4950 }
        ],
        localMarket: 4800,
        trend: [5050, 5100, 5000, 5150, 5120, 5180, 5250],
        costDefaults: {
            cultivationCost: 75000,
            transportCost: 2500,
            otherCosts: 0
        }
    },
    cotton: {
        name: 'Cotton',
        icon: '🌾',
        govtMandi: 6800,
        privateBuyers: [
            { name: 'Textile Corp', price: 6500 },
            { name: 'Cotton Plus', price: 6200 }
        ],
        localMarket: 6000,
        trend: [6400, 6450, 6550, 6600, 6580, 6700, 6800],
        costDefaults: {
            cultivationCost: 95000,
            transportCost: 3000,
            otherCosts: 0
        }
    },
    maize: {
        name: 'Maize',
        icon: '🌽',
        govtMandi: 2200,
        privateBuyers: [
            { name: 'Poultry Feed Co.', price: 2100 },
            { name: 'Agri Traders', price: 2050 }
        ],
        localMarket: 1900,
        trend: [2000, 2050, 2100, 2150, 2120, 2180, 2200],
        costDefaults: {
            cultivationCost: 45000,
            transportCost: 2000,
            otherCosts: 0
        }
    },
    wheat: {
        name: 'Wheat',
        icon: '🌾',
        govtMandi: 2275,
        privateBuyers: [
            { name: 'Flour Mills Inc.', price: 2150 },
            { name: 'Food Corp', price: 2100 }
        ],
        localMarket: 2000,
        trend: [2100, 2120, 2200, 2250, 2230, 2260, 2275],
        costDefaults: {
            cultivationCost: 55000,
            transportCost: 2500,
            otherCosts: 0
        }
    }
};

// ============================================
// State
// ============================================

let selectedCrop = 'groundnut';

// ============================================
// Initialize
// ============================================

function initMarketCalculator() {
    setupCropSelector();
    setupInputListeners();
    renderPriceCards();
    renderPriceTrend();
    calculateProfit();
}

// ============================================
// Crop Selector
// ============================================

function setupCropSelector() {
    const buttons = document.querySelectorAll('.crop-selector-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedCrop = btn.dataset.crop;
            updateHeroCrop();
            updatePriceDisplay();
            renderPriceCards();
            renderPriceTrend();
            calculateProfit();
        });
    });
}

function updateHeroCrop() {
    const prices = cropPrices[selectedCrop];
    if (!prices) return;

    const iconEl = document.getElementById('heroCropIcon');
    const titleEl = document.getElementById('marketHeroTitle');
    if (iconEl) iconEl.textContent = prices.icon;
    if (titleEl) titleEl.textContent = prices.name;
}

// ============================================
// Setup Input Listeners
// ============================================

function setupInputListeners() {
    const inputs = ['expectedYield', 'sellingPrice', 'cultivationCost', 'transportCost', 'otherCosts'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateProfit);
        }
    });
}

// ============================================
// Update Price Display
// ============================================

function updatePriceDisplay() {
    const prices = cropPrices[selectedCrop];
    if (!prices) return;

    // Update selling price field
    const sellingPriceInput = document.getElementById('sellingPrice');
    if (sellingPriceInput) {
        sellingPriceInput.value = prices.govtMandi;
    }

    // Update cost defaults
    const costs = prices.costDefaults;
    const cultivationCost = document.getElementById('cultivationCost');
    const transportCost = document.getElementById('transportCost');
    const otherCosts = document.getElementById('otherCosts');

    if (cultivationCost) cultivationCost.value = costs.cultivationCost;
    if (transportCost) transportCost.value = costs.transportCost;
    if (otherCosts) otherCosts.value = costs.otherCosts;
}

// ============================================
// Render Price Cards
// ============================================

function renderPriceCards() {
    const prices = cropPrices[selectedCrop];
    if (!prices) return;

    const container = document.getElementById('priceCards');
    if (!container) return;

    const cards = [
        {
            key: 'govtMandi',
            label: 'Government Mandi',
            subtitle: 'Official MSP',
            price: prices.govtMandi,
            icon: 'fa-landmark',
            isBest: true
        },
        ...prices.privateBuyers.map((buyer, idx) => ({
            key: `private${idx}`,
            label: buyer.name,
            subtitle: 'Private Buyer',
            price: buyer.price,
            icon: 'fa-building',
            isBest: false
        })),
        {
            key: 'localMarket',
            label: 'Local Market',
            subtitle: 'Average Price',
            price: prices.localMarket,
            icon: 'fa-store',
            isBest: false
        }
    ];

    container.innerHTML = cards.map((card, idx) => `
        <article class="price-card${card.isBest ? ' best' : ''}" data-source="${card.key}">
            <div class="price-card-icon" aria-hidden="true">
                <i class="fa-solid ${card.icon}"></i>
            </div>
            <div class="price-card-content">
                <div class="price-card-title">
                    <strong>${card.label}</strong>
                    ${card.isBest ? '<span class="badge badge-success" data-lang="best_price">Best Price</span>' : ''}
                </div>
                <span class="price-card-subtitle">${card.subtitle}</span>
                <div class="price-card-value">₹${formatNumber(card.price)}</div>
                <span class="price-card-unit" data-lang="per_quintal">per quintal</span>
            </div>
            <span class="price-card-date" data-lang="today">Today</span>
        </article>
    `).join('');

    // Apply translations if available
    if (window.applyTranslations) {
        window.applyTranslations();
    }
}

// ============================================
// Render Price Trend Chart
// ============================================

function renderPriceTrend() {
    const prices = cropPrices[selectedCrop];
    if (!prices) return;

    const container = document.getElementById('priceTrendChart');
    const indicator = document.getElementById('trendIndicator');
    if (!container) return;

    const trend = prices.trend;
    const maxVal = Math.max(...trend);
    const minVal = Math.min(...trend);
    const range = maxVal - minVal || 1;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

    // Update trend indicator
    const pctChange = ((trend[trend.length - 1] - trend[0]) / trend[0] * 100).toFixed(1);
    const isUp = pctChange >= 0;
    if (indicator) {
        indicator.className = `trend-indicator ${isUp ? 'up' : 'down'}`;
        indicator.innerHTML = `
            <i class="fa-solid fa-arrow-trend-${isUp ? 'up' : 'down'}"></i>
            <span data-lang="trend_${isUp ? 'up' : 'down'}">${isUp ? '+' : ''}${pctChange}%</span>
        `;
    }

    container.innerHTML = trend.map((val, i) => {
        const height = 30 + ((val - minVal) / range) * 65; // 30% to 95%
        return `
            <div class="trend-bar${i === trend.length - 1 ? ' active' : ''}"
                 style="height: ${height}%;"
                 data-value="₹${formatNumber(val)}">
                <span class="trend-label">${days[i]}</span>
            </div>
        `;
    }).join('');
}

// ============================================
// Calculate Profit
// ============================================

function calculateProfit() {
    const yield_quintals = parseFloat(document.getElementById('expectedYield')?.value) || 0;
    const price_per_quintal = parseFloat(document.getElementById('sellingPrice')?.value) || 0;
    const cultivation_cost = parseFloat(document.getElementById('cultivationCost')?.value) || 0;
    const transport_cost = parseFloat(document.getElementById('transportCost')?.value) || 0;
    const other_costs = parseFloat(document.getElementById('otherCosts')?.value) || 0;

    // Calculate
    const totalRevenue = yield_quintals * price_per_quintal;
    const totalCosts = cultivation_cost + transport_cost + other_costs;
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(0) : 0;

    // Update display
    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalCostsEl = document.getElementById('totalCosts');
    const netProfitEl = document.getElementById('netProfit');
    const profitMarginEl = document.getElementById('profitMarginValue');
    const govtPriceEl = document.getElementById('govtPrice');
    const potentialProfitEl = document.getElementById('potentialProfit');
    const profitMarginHero = document.getElementById('profitMargin');
    const priceChangeEl = document.getElementById('priceChange');
    const bestSpreadEl = document.getElementById('bestSpread');
    const daysToSellEl = document.getElementById('daysToSell');
    const recommendationTextEl = document.getElementById('recommendationText');

    if (totalRevenueEl) totalRevenueEl.textContent = window.formatCurrency(totalRevenue);
    if (totalCostsEl) {
        totalCostsEl.textContent = `- ${window.formatCurrency(totalCosts)}`;
    }
    if (netProfitEl) {
        netProfitEl.textContent = window.formatCurrency(netProfit);
        netProfitEl.className = netProfit >= 0 ? 'text-success' : 'text-error';
    }
    if (profitMarginEl) {
        profitMarginEl.textContent = `${profitMargin}%`;
        profitMarginEl.className = `profit-margin-value ${profitMargin >= 20 ? 'text-success' : profitMargin >= 10 ? 'text-warning' : 'text-error'}`;
    }

    // Update hero stats
    const prices = cropPrices[selectedCrop];
    if (prices && govtPriceEl) govtPriceEl.textContent = `₹${formatNumber(prices.govtMandi)}`;
    if (prices && potentialProfitEl) potentialProfitEl.textContent = window.formatCurrency(netProfit);
    if (profitMarginHero) profitMarginHero.textContent = `${profitMargin}%`;

    // Update insights
    const pctChange = ((prices.trend[prices.trend.length - 1] - prices.trend[0]) / prices.trend[0] * 100).toFixed(1);
    if (priceChangeEl) priceChangeEl.textContent = `${pctChange >= 0 ? '+' : ''}${pctChange}%`;
    if (bestSpreadEl) bestSpreadEl.textContent = `₹${formatNumber(prices.govtMandi - prices.localMarket)}`;

    // Update recommendation text based on profit
    if (recommendationTextEl) {
        const prices = cropPrices[selectedCrop];
        const spread = prices.govtMandi - prices.localMarket;
        const trendUp = prices.trend[prices.trend.length - 1] > prices.trend[0];

        if (netProfit <= 0) {
            recommendationTextEl.innerHTML = window.translations?.market_recommendation_loss ||
                `Current costs exceed revenue. Consider reducing cultivation costs or waiting for better prices. Selling to <strong>${prices.privateBuyers[0]?.name || 'private buyers'}</strong> may offer quicker payment.`;
        } else if (trendUp && spread > 100) {
            recommendationTextEl.innerHTML = window.translations?.market_recommendation_hold ||
                `Based on current prices, selling to <strong>Government Mandi</strong> offers the best return. The price trend is upward, so if you can store your produce safely, waiting a few more days could yield higher profits.`;
        } else {
            recommendationTextEl.innerHTML = window.translations?.market_recommendation_sell ||
                `Current prices are favorable. Selling to <strong>Government Mandi</strong> at ₹${formatNumber(prices.govtMandi)}/quintal maximizes your profit of ${window.formatCurrency(netProfit)}. Consider selling within the next week.`;
        }
    }

    // Apply translations if available
    if (window.applyTranslations) {
        window.applyTranslations();
    }
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.profit-calculator-card') || document.querySelector('.market-hero')) {
        initMarketCalculator();
    }
});

// ============================================
// Export
// ============================================

window.calculateProfit = calculateProfit;