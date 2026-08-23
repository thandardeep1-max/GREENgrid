/**
 * Smart Agriculture Assistant
 * Weather - API Integration & Alerts
 */

// ============================================
// Configuration
// ============================================

const WEATHER_CONFIG = {
    apiEndpoint: '/api/weather',
    refreshInterval: 60000,
    defaultLocation: 'Gujarat, India'
};

// ============================================
// State
// ============================================

let weatherData = {
    location: 'Gujarat, India',
    current: {
        temp: 32,
        humidity: 65,
        windSpeed: 12,
        rainChance: 20,
        uvIndex: 6,
        description: 'Partly Cloudy',
        icon: 'cloud-sun'
    },
    forecast: [],
    alerts: []
};

// ============================================
// Initialize
// ============================================

function initWeather() {
    fetchWeatherData();
    setupAutoRefresh();
}

// ============================================
// Fetch Weather Data
// ============================================

async function fetchWeatherData() {
    try {
        // For demo: use simulated data
        weatherData = generateSimulatedWeather();
        updateWeatherDisplay();
        generateAlerts();
    } catch (error) {
        console.error('Error fetching weather:', error);
        window.showToast('Unable to fetch weather data', 'error');
    }
}

// ============================================
// Generate Simulated Weather (Demo)
// ============================================

function generateSimulatedWeather() {
    return {
        location: 'Gujarat, India',
        current: {
            temp: 32,
            humidity: 65,
            windSpeed: 12,
            rainChance: 20,
            uvIndex: 6,
            description: 'Partly Cloudy',
            icon: 'cloud-sun'
        },
        forecast: [
            { day: 'Today', date: 'Aug 19', temp: '32/26', icon: 'cloud-sun', desc: 'Partly Cloudy', humidity: 65, wind: 12 },
            { day: 'Tomorrow', date: 'Aug 20', temp: '29/24', icon: 'cloud-showers-heavy', desc: 'Heavy Rain', humidity: 85, wind: 18 },
            { day: 'Thursday', date: 'Aug 21', temp: '30/25', icon: 'cloud', desc: 'Cloudy', humidity: 70, wind: 15 },
            { day: 'Friday', date: 'Aug 22', temp: '34/27', icon: 'sun', desc: 'Sunny', humidity: 45, wind: 10 },
            { day: 'Saturday', date: 'Aug 23', temp: '35/28', icon: 'sun', desc: 'Sunny', humidity: 40, wind: 8 }
        ],
        alerts: [
            { type: 'warning', title: 'Heavy Rain Expected Tomorrow', message: 'Expected rainfall: 40-60mm', action: 'Delay irrigation for 2 days' },
            { type: 'info', title: 'High Temperature Alert', message: 'Temperature may reach 38C', action: 'Irrigate early morning or evening' }
        ]
    };
}

// ============================================
// Update Weather Display
// ============================================

function updateWeatherDisplay() {
    // Update current weather
    const elements = {
        currentTemp: weatherData.current.temp,
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.windSpeed,
        rainChance: weatherData.current.rainChance,
        uvIndex: weatherData.current.uvIndex,
        currentDesc: weatherData.current.description
    };

    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });

    // Update forecast cards
    const forecastGrid = document.querySelector('.forecast-grid');
    if (forecastGrid && weatherData.forecast) {
        forecastGrid.innerHTML = weatherData.forecast.map(day => `
            <div class="forecast-card ${day.icon.includes('rain') ? 'warning' : ''}">
                <div class="forecast-day">${day.day}</div>
                <div class="forecast-date">${day.date}</div>
                <div class="forecast-icon"><i class="fa-solid fa-${day.icon}"></i></div>
                <div class="forecast-temp">${day.temp}</div>
                <div class="forecast-desc">${day.desc}</div>
                <div class="forecast-details">
                    <span><i class="fa-solid fa-droplet"></i> ${day.humidity}%</span>
                    <span><i class="fa-solid fa-wind"></i> ${day.wind} km/h</span>
                </div>
            </div>
        `).join('');
    }
}

// ============================================
// Generate Alerts
// ============================================

function generateAlerts() {
    const alertList = document.querySelector('.alert-list');
    if (!alertList || !weatherData.alerts) return;

    alertList.innerHTML = weatherData.alerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <div class="alert-icon">
                <i class="fa-solid fa-${alert.type === 'warning' ? 'cloud-showers-heavy' : 'temperature-high'}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-action">Recommended: ${alert.action}</div>
            </div>
            <div class="alert-time">${alert.type === 'warning' ? 'Tomorrow' : 'Today'}</div>
        </div>
    `).join('');
}

// ============================================
// Auto Refresh
// ============================================

function setupAutoRefresh() {
    setInterval(fetchWeatherData, WEATHER_CONFIG.refreshInterval);
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.weather-current')) {
        initWeather();
    }
});
