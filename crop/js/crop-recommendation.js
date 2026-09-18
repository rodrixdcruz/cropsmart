
//  CropSmart — Crop Recommendation + OpenWeatherMap Integration

const WEATHER_API_KEY = '298874dd674a810abd93a493f41a16fb';

// ── Crop data with multi-language support ────────────────────
const allCrops = [
    {
        nameKey: 'crop-rice',
        names: { en: 'Rice', hi: 'चावल', mr: 'तांदूळ', ta: 'அரிசி' },
        image: 'images/rice.png',
        icon: 'fas fa-seedling',
        idealTemp: [22, 35],
        idealHumidity: [70, 95],
        idealRainfall: [150, 300],
        soilTypes: ['loamy', 'clay'],
        profitPerHa: 85000,
        growthDays: 120
    },
    {
        nameKey: 'crop-wheat',
        names: { en: 'Wheat', hi: 'गेहूं', mr: 'गहू', ta: 'கோதுமை' },
        image: 'images/wheat.png',
        icon: 'fas fa-wheat-awn',
        idealTemp: [15, 25],
        idealHumidity: [40, 70],
        idealRainfall: [50, 100],
        soilTypes: ['loamy', 'clay'],
        profitPerHa: 72000,
        growthDays: 110
    },
    {
        nameKey: 'crop-maize',
        names: { en: 'Maize', hi: 'मकई', mr: 'कोंबडी', ta: 'மக்காச்சோளம்' },
        image: 'images/maize.png',
        icon: 'fas fa-seedling',
        idealTemp: [20, 30],
        idealHumidity: [50, 80],
        idealRainfall: [50, 150],
        soilTypes: ['loamy', 'sandy'],
        profitPerHa: 65000,
        growthDays: 90
    },
    {
        nameKey: 'crop-soybean',
        names: { en: 'Soybean', hi: 'सोयाबीन', mr: 'सोयाबीन', ta: 'சோயாபீன்' },
        image: 'images/soybean.png',
        icon: 'fas fa-seedling',
        idealTemp: [20, 30],
        idealHumidity: [40, 70],
        idealRainfall: [40, 120],
        soilTypes: ['loamy', 'sandy'],
        profitPerHa: 78000,
        growthDays: 100
    },
    {
        nameKey: 'crop-cotton',
        names: { en: 'Cotton', hi: 'कपास', mr: 'कापूस', ta: 'பருத்தி' },
        image: 'images/cotton.png',
        icon: 'fas fa-seedling',
        idealTemp: [21, 30],
        idealHumidity: [50, 80],
        idealRainfall: [50, 100],
        soilTypes: ['loamy', 'red'],
        profitPerHa: 95000,
        growthDays: 160
    }
];

// Function to get crop name in current language
function getCropName(crop) {
    const lang = window.getLang ? window.getLang() : 'en';
    return crop.names && crop.names[lang] ? crop.names[lang] : crop.names.en;
}

// ── Region detection from city/state name ───────────────────
const regionMap = {
    punjab: 'punjab',
    haryana: 'punjab',
    chandigarh: 'punjab',
    amritsar: 'punjab',
    ludhiana: 'punjab',
    maharashtra: 'maharashtra',
    mumbai: 'maharashtra',
    pune: 'maharashtra',
    nagpur: 'maharashtra',
    nashik: 'maharashtra',
    'tamil nadu': 'tamilnadu',
    tamilnadu: 'tamilnadu',
    chennai: 'tamilnadu',
    coimbatore: 'tamilnadu',
    madurai: 'tamilnadu',
    karnataka: 'karnataka',
    bengaluru: 'karnataka',
    bangalore: 'karnataka',
    mysuru: 'karnataka',
    mysore: 'karnataka',
    gujarat: 'gujarat',
    ahmedabad: 'gujarat',
    surat: 'gujarat',
    vadodara: 'gujarat',
    rajasthan: 'rajasthan',
    jaipur: 'rajasthan',
    jodhpur: 'rajasthan',
    'uttar pradesh': 'up',
    lucknow: 'up',
    kanpur: 'up',
    agra: 'up',
    varanasi: 'up',
    'madhya pradesh': 'mp',
    bhopal: 'mp',
    indore: 'mp',
    'andhra pradesh': 'andhra',
    visakhapatnam: 'andhra',
    vijayawada: 'andhra',
    telangana: 'telangana',
    hyderabad: 'telangana'
};

function detectRegion(cityName, stateName) {
    const combined = ((cityName || '') + ' ' + (stateName || '')).toLowerCase();
    for (const keyword of Object.keys(regionMap)) {
        if (combined.includes(keyword)) return regionMap[keyword];
    }
    return null;
}

// ── Weather icon mapping ─────────────────────────────────────
function getWeatherIcon(weatherMain) {
    const map = {
        'Clear': 'fas fa-sun',
        'Clouds': 'fas fa-cloud',
        'Rain': 'fas fa-cloud-rain',
        'Drizzle': 'fas fa-cloud-drizzle',
        'Thunderstorm': 'fas fa-bolt',
        'Snow': 'fas fa-snowflake',
        'Mist': 'fas fa-smog',
        'Haze': 'fas fa-smog',
        'Fog': 'fas fa-smog',
        'Dust': 'fas fa-wind',
        'Smoke': 'fas fa-smog',
        'Tornado': 'fas fa-tornado'
    };
    return map[weatherMain] || 'fas fa-cloud-sun';
}

// ── Smooth slider animation ──────────────────────────────────
function animateSlider(sliderId, displayId, targetValue, suffix, duration = 800) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    const start = parseFloat(slider.value);
    const end = Math.min(parseFloat(slider.max), Math.max(parseFloat(slider.min), targetValue));
    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * eased);
        slider.value = current;
        display.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ── Show / hide helpers ──────────────────────────────────────
function showElement(id) { document.getElementById(id).classList.remove('hidden'); }
function hideElement(id) { document.getElementById(id).classList.add('hidden'); }

// ── Main auto-fill function ──────────────────────────────────
async function autoFillWeather() {
    if (WEATHER_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
        showWeatherError('Please add your OpenWeatherMap API key in crop-recommendation.js (line 7).');
        return;
    }

    const btn = document.getElementById('weatherFillBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';
    btn.disabled = true;
    hideElement('weatherStatus');
    hideElement('weatherError');

    // Step 1: Get browser geolocation
    if (!navigator.geolocation) {
        showWeatherError('Geolocation is not supported by your browser.');
        resetWeatherBtn();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                await fetchAndFillWeather(latitude, longitude);
            } catch (err) {
                showWeatherError('Failed to fetch weather data. Check your API key or try again.');
                console.error(err);
            }
            resetWeatherBtn();
        },
        (err) => {
            let msg = 'Location access denied.';
            if (err.code === 1) msg = 'Location access denied. Please allow location permission and try again.';
            if (err.code === 2) msg = 'Location unavailable. Try again or fill the form manually.';
            if (err.code === 3) msg = 'Location request timed out. Please try again.';
            showWeatherError(msg);
            resetWeatherBtn();
        },
        { timeout: 10000 }
    );
}

async function fetchAndFillWeather(lat, lon) {
    // ── Fetch current weather ────────────────────────────────
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error(`Weather API error: ${weatherRes.status}`);
    const weather = await weatherRes.json();

    // ── Fetch 5-day forecast for rainfall estimate ───────────
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    const forecastRes = await fetch(forecastUrl);
    const forecast = forecastRes.ok ? await forecastRes.json() : null;

    // ── Extract values ───────────────────────────────────────
    const temp        = Math.round(weather.main.temp);
    const humidity    = Math.round(weather.main.humidity);
    // rain.1h is mm in last hour — multiply by 24 for daily estimate
    // Use forecast 3-hour rain sum for next 24h if available, else current
    let rainfall = 0;
    if (forecast) {
        // Sum rain from next 8 forecast slots (8 × 3h = 24h)
        rainfall = forecast.list.slice(0, 8).reduce((sum, slot) => {
            return sum + (slot.rain ? (slot.rain['3h'] || 0) : 0);
        }, 0);
        rainfall = Math.round(rainfall);
    } else if (weather.rain) {
        rainfall = Math.round((weather.rain['1h'] || 0) * 24);
    }

    const cityName    = weather.name;
    const stateName   = weather.sys.country === 'IN' ? (weather.name || '') : '';
    const weatherMain = weather.weather[0].main;
    const weatherDesc = weather.weather[0].description;

    // ── Detect region ────────────────────────────────────────
    const detectedRegion = detectRegion(cityName, stateName);

    // ── Animate sliders ──────────────────────────────────────
    animateSlider('temperature', 'tempValue', temp, '°C');
    animateSlider('humidity', 'humidityValue', humidity, '%');
    animateSlider('rainfall', 'rainfallValue', Math.min(300, rainfall), 'mm');

    // ── Set region dropdown ──────────────────────────────────
    if (detectedRegion) {
        document.getElementById('region').value = detectedRegion;
        showElement('regionLiveBadge');
    }

    // ── Show live badges ─────────────────────────────────────
    showElement('tempLiveBadge');
    showElement('humidityLiveBadge');
    showElement('rainfallLiveBadge');

    // ── Show weather status card ─────────────────────────────
    document.getElementById('weatherLocation').textContent = `${cityName}, India`;
    document.getElementById('weatherDesc').textContent =
        weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1);
    document.getElementById('wTemp').textContent = `${temp}°C`;
    document.getElementById('wHumidity').textContent = `${humidity}%`;
    document.getElementById('wRain').textContent = `${rainfall}mm (24h est.)`;
    document.getElementById('weatherIcon').className = getWeatherIcon(weatherMain);
    showElement('weatherStatus');
}

function showWeatherError(msg) {
    document.getElementById('weatherErrorMsg').textContent = msg;
    showElement('weatherError');
}

function resetWeatherBtn() {
    const btn = document.getElementById('weatherFillBtn');
    btn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Use My Location';
    btn.disabled = false;
}

// ── Range slider live display ────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('temperature').addEventListener('input', function () {
        document.getElementById('tempValue').textContent = this.value + '°C';
    });
    document.getElementById('humidity').addEventListener('input', function () {
        document.getElementById('humidityValue').textContent = this.value + '%';
    });
    document.getElementById('rainfall').addEventListener('input', function () {
        document.getElementById('rainfallValue').textContent = this.value + 'mm';
    });
});

// Listen for language changes and update displayed recommendations
window.addEventListener('languageChanged', function(e) {
    const results = document.getElementById('recommendationResults');
    if (!results.classList.contains('hidden')) {
        // Re-render crop cards with new language
        const area = parseFloat(document.getElementById('area').value) || 1;
        const cropsGrid = document.getElementById('cropsGrid');
        
        // Get current recommendations from the rendered cards
        if (cropsGrid.children.length > 0) {
            // Force re-render by calling getRecommendations again
            getRecommendations();
        }
    }
});

// ── Recommendation engine ────────────────────────────────────
function getSuitability(score) {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 55) return 'Good';
    if (score >= 40) return 'Moderate';
    return 'Poor';
}

function getRecommendations() {
    const btn = document.querySelector('.recommendation-form .btn-primary')
        || document.querySelector('.recommendation-form-enhanced .btn-analyze')
        || document.querySelector('.btn-analyze');
    if (btn) {
        if (btn.dataset.busy) return; // ignore re-entrant clicks while analyzing
        btn.dataset.busy = '1';
        var originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        btn.disabled = true;
    }

    setTimeout(() => {
        try { showCropRecommendations(); } finally {
            if (btn) { btn.innerHTML = originalText; btn.disabled = false; delete btn.dataset.busy; }
        }
    }, 2000);
}

function showCropRecommendations() {
    const temp     = parseFloat(document.getElementById('temperature').value);
    const humidity = parseFloat(document.getElementById('humidity').value);
    const rainfall = parseFloat(document.getElementById('rainfall').value);
    const soil     = document.getElementById('soilType').value;
    const area     = parseFloat(document.getElementById('area').value) || 1;

    if (!area || area <= 0) {
        alert('Please enter a valid area.');
        return;
    }

    const recommendations = allCrops.map(crop => {
        let score = 0;

        // Temperature score (40%)
        const tempMid  = (crop.idealTemp[0] + crop.idealTemp[1]) / 2;
        const tempDiff = Math.max(0, Math.min(10, Math.abs(tempMid - temp)));
        score += 40 * (1 - tempDiff / 10);

        // Humidity score (25%)
        const humMid  = (crop.idealHumidity[0] + crop.idealHumidity[1]) / 2;
        const humDiff = Math.max(0, Math.min(20, Math.abs(humMid - humidity)));
        score += 25 * (1 - humDiff / 20);

        // Rainfall score (25%)
        const rainMid  = (crop.idealRainfall[0] + crop.idealRainfall[1]) / 2;
        const rainDiff = Math.max(0, Math.min(100, Math.abs(rainMid - rainfall)));
        score += 25 * (1 - rainDiff / 100);

        // Soil score (10%)
        if (crop.soilTypes.includes(soil)) score += 10;

        return {
            ...crop,
            score: Math.round(score),
            totalProfit: Math.round(crop.profitPerHa * area),
            suitability: getSuitability(score)
        };
    });

    recommendations.sort((a, b) => b.score - a.score);

    const cropsGrid = document.getElementById('cropsGrid');
    cropsGrid.innerHTML = '';

    recommendations.forEach((crop, index) => {
        const card = document.createElement('div');
        const cropName = getCropName(crop);
        const lang = window.getLang ? window.getLang() : 'en';
        const bestChoiceText = lang === 'en' ? 'BEST CHOICE' : 
                               lang === 'hi' ? 'सर्वश्रेष्ठ विकल्प' :
                               lang === 'mr' ? 'सर्वोत्तम निवड' :
                               lang === 'ta' ? 'சிறந்த தேர்வு' : 'BEST CHOICE';
        const profitLabel = lang === 'en' ? 'Profit' :
                            lang === 'hi' ? 'लाभ' :
                            lang === 'mr' ? 'नफा' :
                            lang === 'ta' ? 'லாभ' : 'Profit';
        const growthLabel = lang === 'en' ? 'Growth' :
                            lang === 'hi' ? 'वृद्धि' :
                            lang === 'mr' ? 'वृद्धी' :
                            lang === 'ta' ? 'வளர்ச்சி' : 'Growth';
        const daysLabel = lang === 'en' ? 'days' :
                          lang === 'hi' ? 'दिन' :
                          lang === 'mr' ? 'दिवस' :
                          lang === 'ta' ? 'நாட்கள்' : 'days';

        card.className = `crop-card ${cropName.toLowerCase()}`;
        card.innerHTML = `
            ${index === 0 ? `<div class="best-crop"><i class="fas fa-crown"></i> ${bestChoiceText}</div>` : ''}
            <div class="crop-image">
                <img src="${crop.image}" alt="${cropName}"
                     onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
                <div class="crop-fallback-icon"><i class="${crop.icon}"></i></div>
                <div class="crop-overlay">${crop.suitability}</div>
            </div>
            <h3>${cropName}</h3>
            <div class="crop-score">${crop.score}%</div>
            <p><strong>${profitLabel} (${area}ha):</strong>
                <span style="color:#ffd700">₹${crop.totalProfit.toLocaleString('en-IN')}</span>
            </p>
            <p><strong>${growthLabel}:</strong> ${crop.growthDays} ${daysLabel}</p>
        `;
        cropsGrid.appendChild(card);
    });

    const results = document.getElementById('recommendationResults');
    results.classList.remove('hidden');
    results.scrollIntoView({ behavior: 'smooth' });
}