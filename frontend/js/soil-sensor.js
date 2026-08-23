/**
 * Smart Agriculture Assistant
 * Soil Sensor - Arduino Integration via Serial/API
 */

const formData = new FormData();
formData.append("file", selectedFile);

const response = await fetch(
    "http://127.0.0.1:8000/predict-soil",
    {
        method: "POST",
        body: formData
    }
);

const result = await response.json();

console.log(result.soil_type);
console.log(result.confidence);

// ============================================
// Configuration
// ============================================

const SENSOR_CONFIG = {
    apiEndpoint: '/api/soil', // Backend API endpoint
    refreshInterval: 5000, // 5 seconds
    retryAttempts: 3,
    retryDelay: 2000
};

// ============================================
// Sensor State
// ============================================

let sensorData = {
    ph: 6.5,
    moisture: 45,
    temperature: 28,
    nitrogen: 40,
    phosphorus: 20,
    potassium: 30,
    connected: false
};

let refreshTimer = null;

// ============================================
// Initialize Sensor
// ============================================

function initSoilSensor() {
    // Try to connect to sensor
    connectSensor();

    // Set up refresh button
    const refreshBtn = document.getElementById('refreshSensor');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            readSensorData();
        });
    }

    // Start auto-refresh
    startAutoRefresh();
}

// ============================================
// Connect to Sensor
// ============================================

async function connectSensor() {
    updateSensorStatus('connecting');

    try {
        // In production, this would connect to actual Arduino via backend API
        // For demo, simulate connection
        setTimeout(() => {
            sensorData.connected = true;
            updateSensorStatus('connected');
            readSensorData();
        }, 1500);
    } catch (error) {
        console.error('Sensor connection error:', error);
        updateSensorStatus('disconnected');
    }
}

// ============================================
// Read Sensor Data
// ============================================

async function readSensorData() {
    if (!sensorData.connected) {
        await connectSensor();
        return;
    }

    updateSensorStatus('reading');

    try {
        // In production: fetch from backend API
        // const response = await fetch(SENSOR_CONFIG.apiEndpoint);
        // const data = await response.json();

        // For demo: simulate sensor readings with slight variations
        sensorData = {
            ph: (6.2 + Math.random() * 0.6).toFixed(1),
            moisture: Math.floor(40 + Math.random() * 20),
            temperature: Math.floor(26 + Math.random() * 6),
            nitrogen: Math.floor(35 + Math.random() * 15),
            phosphorus: Math.floor(15 + Math.random() * 10),
            potassium: Math.floor(25 + Math.random() * 15),
            connected: true
        };

        updateSensorDisplay();
        updateSensorStatus('connected');

    } catch (error) {
        console.error('Error reading sensor:', error);
        updateSensorStatus('error');
    }
}

// ============================================
// Update Sensor Display
// ============================================

function updateSensorDisplay() {
    // pH
    const phValue = document.getElementById('phValue');
    const phStatus = document.getElementById('phStatus');
    if (phValue) {
        phValue.textContent = sensorData.ph;

        // Determine status
        const ph = parseFloat(sensorData.ph);
        let status = 'Normal';
        let statusClass = 'normal';

        if (ph < 5.5) {
            status = 'Acidic';
            statusClass = 'warning';
        } else if (ph > 7.5) {
            status = 'Alkaline';
            statusClass = 'warning';
        }

        phStatus.textContent = status;
        phStatus.className = `soil-param-status ${statusClass}`;
    }

    // Moisture
    const moistureValue = document.getElementById('moistureValue');
    const moistureStatus = document.getElementById('moistureStatus');
    if (moistureValue) {
        moistureValue.textContent = sensorData.moisture;

        let status = 'Normal';
        let statusClass = 'normal';

        if (sensorData.moisture < 30) {
            status = 'Low';
            statusClass = 'warning';
        } else if (sensorData.moisture > 60) {
            status = 'High';
            statusClass = 'warning';
        }

        moistureStatus.textContent = status;
        moistureStatus.className = `soil-param-status ${statusClass}`;
    }

    // Temperature
    const tempValue = document.getElementById('tempValue');
    const tempStatus = document.getElementById('tempStatus');
    if (tempValue) {
        tempValue.textContent = sensorData.temperature;

        let status = 'Normal';
        let statusClass = 'normal';

        if (sensorData.temperature > 35) {
            status = 'High';
            statusClass = 'warning';
        } else if (sensorData.temperature < 15) {
            status = 'Low';
            statusClass = 'warning';
        }

        tempStatus.textContent = status;
        tempStatus.className = `soil-param-status ${statusClass}`;
    }

    // NPK
    const npkValue = document.getElementById('npkValue');
    const npkStatus = document.getElementById('npkStatus');
    if (npkValue) {
        npkValue.textContent = `N:${sensorData.nitrogen}`;
        npkValue.nextElementSibling.textContent = `P:${sensorData.phosphorus} K:${sensorData.potassium}`;

        // Check if any value is low
        const avgNPK = (sensorData.nitrogen + sensorData.phosphorus + sensorData.potassium) / 3;
        let status = 'Normal';
        let statusClass = 'normal';

        if (avgNPK < 25) {
            status = 'Low';
            statusClass = 'warning';
        }

        npkStatus.textContent = status;
        npkStatus.className = `soil-param-status ${statusClass}`;
    }
}

// ============================================
// Update Sensor Status
// ============================================

function updateSensorStatus(status) {
    const statusEl = document.getElementById('sensorStatus');
    if (!statusEl) return;

    const titleEl = statusEl.querySelector('.sensor-status-title');
    const descEl = statusEl.querySelector('.sensor-status-desc');

    statusEl.className = 'sensor-status';

    switch (status) {
        case 'connecting':
            statusEl.classList.add('connecting');
            if (titleEl) titleEl.textContent = 'Connecting to sensor...';
            if (descEl) descEl.textContent = 'Please wait';
            break;

        case 'connected':
            statusEl.classList.add('connected');
            if (titleEl) titleEl.textContent = 'Arduino Sensor Connected';
            if (descEl) descEl.textContent = 'Reading soil parameters...';
            break;

        case 'reading':
            statusEl.classList.add('connected');
            if (descEl) descEl.textContent = 'Refreshing data...';
            break;

        case 'disconnected':
            statusEl.classList.add('disconnected');
            if (titleEl) titleEl.textContent = 'Sensor Disconnected';
            if (descEl) descEl.textContent = 'Please connect Arduino device';
            break;

        case 'error':
            statusEl.classList.add('disconnected');
            if (titleEl) titleEl.textContent = 'Sensor Error';
            if (descEl) descEl.textContent = 'Check connection and try again';
            break;
    }
}

// ============================================
// Auto Refresh
// ============================================

function startAutoRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);

    refreshTimer = setInterval(() => {
        if (sensorData.connected) {
            readSensorData();
        }
    }, SENSOR_CONFIG.refreshInterval);
}

function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

// ============================================
// Download Report
// ============================================

function downloadSoilReport() {
    const report = {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        parameters: {
            ph: sensorData.ph,
            moisture: `${sensorData.moisture}%`,
            temperature: `${sensorData.temperature}°C`,
            nitrogen: sensorData.nitrogen,
            phosphorus: sensorData.phosphorus,
            potassium: sensorData.potassium
        },
        analysis: {
            soilType: 'Loamy Soil',
            fertility: 'Moderate',
            drainage: 'Good',
            organicMatter: '3.2%'
        },
        recommendedCrops: ['Groundnut', 'Cotton', 'Wheat']
    };

    // Helper to download JSON fallback
    const downloadJSON = () => {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `soil-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Ensure jsPDF is available (UMD or global), otherwise try to load it dynamically
    const getJsPDFConstructor = async () => {
        if (window.jspdf && typeof window.jspdf.jsPDF === 'function') {
            return window.jspdf.jsPDF;
        }
        if (typeof window.jsPDF === 'function') {
            return window.jsPDF;
        }

        // Try to load from CDN dynamically
        const src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        // Avoid loading multiple times
        if (document.querySelector(`script[src="${src}"]`)) {
            // if tag exists but library not ready yet, wait for load or timeout
            await new Promise((resolve, reject) => {
                const existing = document.querySelector(`script[src="${src}"]`);
                if (existing.hasAttribute('data-loaded')) return resolve();
                existing.addEventListener('load', () => resolve());
                existing.addEventListener('error', () => reject(new Error('jsPDF CDN failed to load')));
                // timeout after 8s
                setTimeout(() => reject(new Error('jsPDF load timeout')), 8000);
            });
            if (window.jspdf && typeof window.jspdf.jsPDF === 'function') return window.jspdf.jsPDF;
            if (typeof window.jsPDF === 'function') return window.jsPDF;
            throw new Error('jsPDF did not become available after loading script');
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.head.appendChild(script);

        try {
            await new Promise((resolve, reject) => {
                script.addEventListener('load', () => {
                    script.setAttribute('data-loaded', 'true');
                    resolve();
                });
                script.addEventListener('error', () => reject(new Error('jsPDF CDN failed to load')));
                setTimeout(() => reject(new Error('jsPDF load timeout')), 8000);
            });
        } catch (err) {
            throw err;
        }

        if (window.jspdf && typeof window.jspdf.jsPDF === 'function') return window.jspdf.jsPDF;
        if (typeof window.jsPDF === 'function') return window.jsPDF;
        throw new Error('jsPDF not available after dynamic load');
    };

    (async () => {
        try {
            const jsPDFConstructor = await getJsPDFConstructor();
            const doc = new jsPDFConstructor();

            doc.setFontSize(16);
            doc.text('Soil Health Report', 20, 20);

            doc.setFontSize(12);
            const lines = [
                `Date: ${report.date}`,
                `Time: ${report.time}`,
                '',
                'Parameters:',
                `- pH: ${report.parameters.ph}`,
                `- Moisture: ${report.parameters.moisture}`,
                `- Temperature: ${report.parameters.temperature}`,
                `- Nitrogen: ${report.parameters.nitrogen}`,
                `- Phosphorus: ${report.parameters.phosphorus}`,
                `- Potassium: ${report.parameters.potassium}`,
                '',
                'Analysis:',
                `- Soil Type: ${report.analysis.soilType}`,
                `- Fertility: ${report.analysis.fertility}`,
                `- Drainage: ${report.analysis.drainage}`,
                `- Organic Matter: ${report.analysis.organicMatter}`,
                '',
                `Recommended Crops: ${report.recommendedCrops.join(', ')}`
            ];

            let y = 30;
            const pageHeight = 297;
            lines.forEach(line => {
                const split = doc.splitTextToSize(line, 170);
                doc.text(split, 20, y);
                y += (split.length) * 7 + 4;
                if (y > (pageHeight - 20)) { doc.addPage(); y = 20; }
            });

            const filename = `soil-report-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);

            if (window.showToast) window.showToast('Soil report downloaded successfully!', 'success');
        } catch (e) {
            console.error('PDF generation error', e);
            if (window.showToast) window.showToast('Failed to generate PDF, downloading JSON instead', 'error');
            downloadJSON();
        }
    })();
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('sensorStatus')) {
        initSoilSensor();
    }

    // Download report button
    const downloadBtn = document.getElementById('downloadReport');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadSoilReport);
    }
});

// ============================================
// Export
// ============================================

window.sensorData = sensorData;
window.readSensorData = readSensorData;
