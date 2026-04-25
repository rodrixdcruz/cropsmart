// ============================================================
//  Price Prediction — CropSmart
//  Integrates data.gov.in Agmarknet Commodity Prices API
//  API Docs: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
//
//  HOW TO USE YOUR API KEY:
//  1. Register at https://data.gov.in and get a free API key
//  2. Replace "YOUR_API_KEY_HERE" below with your actual key
// ============================================================

const DATA_GOV_API_KEY = "579b464db66ec23bdd000001f200c6dbe24e49ae448c6af380e659bd";

// Agmarknet resource ID on data.gov.in for daily mandi prices
const AGMARKNET_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

// ── Crop name mapping: internal value → Agmarknet commodity name ──
const CROP_TO_COMMODITY = {
    // Cereals & Grains
    rice:         "Rice",
    wheat:        "Wheat",
    maize:        "Maize",
    barley:       "Barley",
    sorghum:      "Jowar",
    bajra:        "Bajra",
    ragi:         "Ragi",
    // Pulses
    chickpea:     "Gram",
    pigeonpea:    "Arhar",
    lentil:       "Masur",
    greengram:    "Moong",
    blackgram:    "Urad",
    soybean:      "Soybean",
    // Oilseeds
    mustard:      "Mustard",
    groundnut:    "Groundnut",
    sunflower:    "Sunflower",
    sesame:       "Sesamum",
    linseed:      "Linseed",
    castor:       "Castor Seed",
    // Cash Crops
    cotton:       "Cotton",
    sugarcane:    "Sugarcane",
    jute:         "Jute",
    tobacco:      "Tobacco",
    // Spices
    turmeric:     "Turmeric",
    chilli:       "Dry Chillies",
    coriander:    "Coriander Seed",
    cumin:        "Jeera",
    ginger:       "Ginger",
    garlic:       "Garlic",
    onion:        "Onion",
    // Vegetables
    potato:       "Potato",
    tomato:       "Tomato",
    brinjal:      "Brinjal",
    okra:         "Bhindi",
    cabbage:      "Cabbage",
    cauliflower:  "Cauliflower",
    // Fruits
    banana:       "Banana",
    mango:        "Mango",
    grapes:       "Grapes",
    pomegranate:  "Pomegranate",
    orange:       "Orange"
};

// ── Market name mapping: internal value → Agmarknet state/district ──
const MARKET_TO_STATE = {
    // Metro Cities
    delhi:               "Delhi",
    mumbai:              "Maharashtra",
    chennai:             "Tamil Nadu",
    kolkata:             "West Bengal",
    bangalore:           "Karnataka",
    hyderabad:           "Telangana",
    // North India
    amritsar:            "Punjab",
    ludhiana:            "Punjab",
    chandigarh:          "Punjab",
    jaipur:              "Rajasthan",
    jodhpur:             "Rajasthan",
    agra:                "Uttar Pradesh",
    lucknow:             "Uttar Pradesh",
    kanpur:              "Uttar Pradesh",
    varanasi:            "Uttar Pradesh",
    meerut:              "Uttar Pradesh",
    haridwar:            "Uttarakhand",
    shimla:              "Himachal Pradesh",
    dehradun:            "Uttarakhand",
    // West India
    pune:                "Maharashtra",
    nagpur:              "Maharashtra",
    nashik:              "Maharashtra",
    amravati:            "Maharashtra",
    aurangabad:          "Maharashtra",
    kolhapur:            "Maharashtra",
    surat:               "Gujarat",
    ahmedabad:           "Gujarat",
    rajkot:              "Gujarat",
    vadodara:            "Gujarat",
    indore:              "Madhya Pradesh",
    bhopal:              "Madhya Pradesh",
    gwalior:             "Madhya Pradesh",
    jabalpur:            "Madhya Pradesh",
    // South India
    coimbatore:          "Tamil Nadu",
    madurai:             "Tamil Nadu",
    trichy:              "Tamil Nadu",
    salem:               "Tamil Nadu",
    mysore:              "Karnataka",
    hubli:               "Karnataka",
    mangalore:           "Karnataka",
    kochi:               "Kerala",
    thiruvananthapuram:  "Kerala",
    kozhikode:           "Kerala",
    vijayawada:          "Andhra Pradesh",
    visakhapatnam:       "Andhra Pradesh",
    guntur:              "Andhra Pradesh",
    warangal:            "Telangana",
    // East India
    patna:               "Bihar",
    gaya:                "Bihar",
    muzaffarpur:         "Bihar",
    bhubaneswar:         "Odisha",
    cuttack:             "Odisha",
    sambalpur:           "Odisha",
    ranchi:              "Jharkhand",
    jamshedpur:          "Jharkhand",
    siliguri:            "West Bengal",
    asansol:             "West Bengal",
    guwahati:            "Assam",
    dibrugarh:           "Assam",
    // Central India
    raipur:              "Chhattisgarh",
    bilaspur:            "Chhattisgarh",
    nagpur_vidarbha:     "Maharashtra",
    yavatmal:            "Maharashtra"
};

// ── Static fallback data (used if API key not set or API fails) ──
const FALLBACK_DATA = {
    // Cereals & Grains (price per quintal)
    rice:         { current: 2850,  trend: 12.5,  rec: "Excellent time to sell!" },
    wheat:        { current: 2420,  trend: -3.2,  rec: "Hold for 2–3 days" },
    maize:        { current: 1875,  trend: 8.7,   rec: "Good selling opportunity" },
    barley:       { current: 1650,  trend: 4.1,   rec: "Good selling opportunity" },
    sorghum:      { current: 2150,  trend: 6.3,   rec: "Good selling opportunity" },
    bajra:        { current: 2350,  trend: 9.2,   rec: "Excellent time to sell!" },
    ragi:         { current: 3800,  trend: 11.0,  rec: "Excellent time to sell!" },
    // Pulses
    chickpea:     { current: 5200,  trend: 7.5,   rec: "Good selling opportunity" },
    pigeonpea:    { current: 7000,  trend: -2.1,  rec: "Hold for 2–3 days" },
    lentil:       { current: 6500,  trend: 5.8,   rec: "Good selling opportunity" },
    greengram:    { current: 7800,  trend: 13.2,  rec: "Excellent time to sell!" },
    blackgram:    { current: 7500,  trend: -4.5,  rec: "Wait for price recovery" },
    soybean:      { current: 4230,  trend: 15.2,  rec: "Best time to sell now!" },
    // Oilseeds
    mustard:      { current: 5600,  trend: 8.9,   rec: "Good selling opportunity" },
    groundnut:    { current: 5900,  trend: 6.2,   rec: "Good selling opportunity" },
    sunflower:    { current: 5200,  trend: 10.1,  rec: "Excellent time to sell!" },
    sesame:       { current: 14000, trend: 12.0,  rec: "Excellent time to sell!" },
    linseed:      { current: 6000,  trend: 3.5,   rec: "Good selling opportunity" },
    castor:       { current: 6200,  trend: 5.0,   rec: "Good selling opportunity" },
    // Cash Crops
    cotton:       { current: 6580,  trend: -5.1,  rec: "Wait for price recovery" },
    sugarcane:    { current: 350,   trend: 2.0,   rec: "Hold for 2–3 days" },
    jute:         { current: 4500,  trend: 4.8,   rec: "Good selling opportunity" },
    tobacco:      { current: 12000, trend: 3.3,   rec: "Good selling opportunity" },
    // Spices
    turmeric:     { current: 13000, trend: 18.5,  rec: "Excellent time to sell!" },
    chilli:       { current: 15000, trend: -6.0,  rec: "Wait for price recovery" },
    coriander:    { current: 7200,  trend: 9.0,   rec: "Good selling opportunity" },
    cumin:        { current: 22000, trend: 22.0,  rec: "Excellent time to sell!" },
    ginger:       { current: 25000, trend: 14.0,  rec: "Excellent time to sell!" },
    garlic:       { current: 18000, trend: -3.5,  rec: "Hold for 2–3 days" },
    onion:        { current: 2000,  trend: -8.0,  rec: "Wait for price recovery" },
    // Vegetables
    potato:       { current: 1500,  trend: 5.0,   rec: "Good selling opportunity" },
    tomato:       { current: 3000,  trend: -12.0, rec: "Wait for price recovery" },
    brinjal:      { current: 2500,  trend: 7.0,   rec: "Good selling opportunity" },
    okra:         { current: 3500,  trend: 10.0,  rec: "Excellent time to sell!" },
    cabbage:      { current: 1200,  trend: 3.0,   rec: "Hold for 2–3 days" },
    cauliflower:  { current: 2000,  trend: 6.0,   rec: "Good selling opportunity" },
    // Fruits
    banana:       { current: 2200,  trend: 8.0,   rec: "Good selling opportunity" },
    mango:        { current: 5000,  trend: 16.0,  rec: "Excellent time to sell!" },
    grapes:       { current: 6000,  trend: 11.0,  rec: "Excellent time to sell!" },
    pomegranate:  { current: 8000,  trend: 9.5,   rec: "Good selling opportunity" },
    orange:       { current: 4500,  trend: 7.0,   rec: "Good selling opportunity" }
};

let priceChart;

// ── Main entry point called by the Predict button ──
async function predictPrice() {
    const crop   = document.getElementById("cropSelect").value;
    const market = document.getElementById("marketSelect").value;

    if (!crop || !market) {
        alert("Please select both a crop and a market.");
        return;
    }

    const btn = document.querySelector(".btn-analyze");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Fetching data…</span>';

    try {
        let priceData;

        if (DATA_GOV_API_KEY && DATA_GOV_API_KEY !== "579b464db66ec23bdd000001f200c6dbe24e49ae448c6af380e659bd") {
            priceData = await fetchFromAgmarknet(crop, market);
        }

        // Fall back to static data if API not configured or returns nothing
        if (!priceData) {
            priceData = buildFallbackData(crop);
        }

        renderResults(crop, market, priceData);

    } catch (err) {
        console.warn("API error, using fallback data:", err);
        renderResults(crop, market, buildFallbackData(crop));
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic"></i> <span data-i18n="btn-predict">Predict Price</span>';
    }
}

// ── Fetch live prices from data.gov.in Agmarknet API ──
async function fetchFromAgmarknet(crop, market) {
    const commodity = CROP_TO_COMMODITY[crop];
    const state     = MARKET_TO_STATE[market];

    const params = new URLSearchParams({
        "api-key":     DATA_GOV_API_KEY,
        format:        "json",
        limit:         "50",
        filters:       JSON.stringify({ Commodity: commodity, State: state })
    });

    const url = `https://api.data.gov.in/resource/${AGMARKNET_RESOURCE_ID}?${params}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    const records = json.records || json.data || [];

    if (!records.length) return null;

    // Parse modal/modal_price field (₹ per quintal from Agmarknet)
    const prices = records
        .map(r => parseFloat(r.modal_price || r.Modal_Price || r["Modal Price"] || 0))
        .filter(p => p > 0);

    if (!prices.length) return null;

    // Agmarknet returns price per quintal; convert to per kg
    const avgPerQuintal = prices.reduce((a, b) => a + b, 0) / prices.length;
    const currentPerKg  = avgPerQuintal / 100;

    // Build a simple 7-day trend from the last 7 available records
    const last7 = prices.slice(-7).map(p => parseFloat((p / 100).toFixed(2)));
    const trend  = computeTrend(last7);

    return {
        current:    parseFloat(currentPerKg.toFixed(2)),
        trend:      parseFloat(trend.toFixed(1)),
        last7Days:  last7,
        source:     "data.gov.in (Agmarknet)",
        dataPoints: records.length
    };
}

// ── Build the static fallback structure ──
function buildFallbackData(crop) {
    const base = FALLBACK_DATA[crop];
    const current = base.current / 100; // stored as per-quintal, convert to per kg

    // Simulate a 7-day price series
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const factor = 1 + (base.trend / 100) * (i / 6) + (Math.random() - 0.5) * 0.02;
        return parseFloat((current * factor).toFixed(2));
    });

    return {
        current:   current,
        trend:     base.trend,
        last7Days: last7,
        source:    "Demo data (add your data.gov.in API key for live prices)",
        dataPoints: 0
    };
}

// ── Compute % trend from a price series ──
function computeTrend(prices) {
    if (prices.length < 2) return 0;
    const first = prices[0];
    const last  = prices[prices.length - 1];
    return ((last - first) / first) * 100;
}

// ── Render all UI with the resolved price data ──
function renderResults(crop, market, data) {
    const results = document.getElementById("predictionResults");
    results.classList.remove("hidden");

    const { current, trend, last7Days, source } = data;

    // ── Current price ──
    document.getElementById("currentPrice").textContent = `₹${current.toFixed(2)}/kg`;

    // ── Trend badge ──
    const trendBadge = document.getElementById("trendBadge");
    const trendText  = document.getElementById("trendText");
    const isUp = trend >= 0;
    trendBadge.className = `trend-badge ${isUp ? "up" : "down"}`;
    trendBadge.querySelector("i").className = `fas fa-arrow-${isUp ? "up" : "down"}`;
    trendText.textContent = `${isUp ? "UP" : "DOWN"} ${Math.abs(trend).toFixed(1)}%`;

    // ── Recommendation ──
    const recEl = document.getElementById("recommendationText");
    if (isUp && trend > 10) recEl.textContent = "Excellent time to sell!";
    else if (isUp)          recEl.textContent = "Good selling opportunity";
    else if (trend < -8)    recEl.textContent = "Wait for price recovery";
    else                    recEl.textContent = "Hold for 2–3 days";

    // ── Price range ──
    const low  = Math.min(...last7Days);
    const high = Math.max(...last7Days);
    document.getElementById("lowestPrice").textContent  = `₹${low.toFixed(2)}/kg`;
    document.getElementById("highestPrice").textContent = `₹${high.toFixed(2)}/kg`;

    // ── Source badge (show where data came from) ──
    let sourceBadge = document.getElementById("dataSourceBadge");
    if (!sourceBadge) {
        sourceBadge = document.createElement("p");
        sourceBadge.id = "dataSourceBadge";
        sourceBadge.style.cssText =
            "text-align:center;font-size:0.75rem;opacity:0.6;margin-top:8px;";
        results.appendChild(sourceBadge);
    }
    sourceBadge.textContent = `📡 Source: ${source}`;

    // ── Chart ──
    renderChart(crop, last7Days, current);

    results.scrollIntoView({ behavior: "smooth" });
}

// ── Render / update Chart.js line chart ──
function renderChart(crop, last7Days, currentPrice) {
    const ctx = document.getElementById("priceChart").getContext("2d");

    // Build labels: "Day -6" … "Today"
    const labels = last7Days.map((_, i) =>
        i === last7Days.length - 1 ? "Today" : `Day -${last7Days.length - 1 - i}`
    );

    // Project 7 days forward using linear regression
    const projected = projectPrices(last7Days, 7);
    const allLabels = [
        ...labels,
        "Day +1", "Day +2", "Day +3", "Day +4", "Day +5", "Day +6", "Day +7"
    ];
    const historicalData = [...last7Days, ...Array(7).fill(null)];
    const forecastData   = [...Array(last7Days.length - 1).fill(null), last7Days[last7Days.length - 1], ...projected];

    if (priceChart) priceChart.destroy();

    priceChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: allLabels,
            datasets: [
                {
                    label: "Historical (₹/kg)",
                    data: historicalData,
                    borderColor: "#667eea",
                    backgroundColor: "rgba(102,126,234,0.1)",
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4
                },
                {
                    label: "Forecast (₹/kg)",
                    data: forecastData,
                    borderColor: "#48bb78",
                    backgroundColor: "rgba(72,187,120,0.08)",
                    borderDash: [6, 4],
                    tension: 0.4,
                    fill: false,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { position: "top" },
                tooltip: {
                    callbacks: {
                        label: ctx =>
                            ctx.parsed.y != null
                                ? `${ctx.dataset.label}: ₹${ctx.parsed.y.toFixed(2)}`
                                : null
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: v => "₹" + v.toFixed(2)
                    }
                }
            }
        }
    });
}

// ── Simple linear regression to project n future prices ──
function projectPrices(prices, n) {
    const len = prices.length;
    const xMean = (len - 1) / 2;
    const yMean = prices.reduce((a, b) => a + b, 0) / len;

    let num = 0, den = 0;
    prices.forEach((y, x) => {
        num += (x - xMean) * (y - yMean);
        den += (x - xMean) ** 2;
    });

    const slope     = den !== 0 ? num / den : 0;
    const intercept = yMean - slope * xMean;

    return Array.from({ length: n }, (_, i) => {
        const x = len + i;
        const p = intercept + slope * x;
        return parseFloat(Math.max(p, 0).toFixed(2));
    });
}