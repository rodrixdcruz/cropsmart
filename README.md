<div align="center">

# 🌱 CropSmart — AI Crop Advisory for Indian Farmers

**Know what to plant. Know when to sell.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](crop/) [![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)](crop/js/) [![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](crop/css/) [![i18n](https://img.shields.io/badge/i18n-EN%20%2F%20%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80%20%2F%20%E0%A4%AE%E0%A4%B0%E0%A4%BE%E0%A4%A0%E0%A5%80%20%2F%20%E0%AE%A4%E0%AE%AE%E0%AE%BF%E0%AE%B4%E0%AF%8D-blue)](#-features) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

CropSmart is a fast, zero-install web app that gives farmers two decisions that matter most: **which crop fits their conditions** and **when to take their produce to market**.

It works from live data — real-time weather from OpenWeatherMap and daily mandi prices from India's [Agmarknet](https://agmarknet.gov.in) dataset on data.gov.in — matched against an agronomic crop dataset of ideal temperature, humidity, and rainfall windows, with yield and profit-per-hectare context for each crop.

## ✨ Features

| Module | What it does |
|---|---|
| **Crop recommendation** | Live weather for any location → matched against each crop's ideal temperature / humidity / rainfall windows → ranked suitability with images and expected profit per hectare |
| **Price prediction** | Daily mandi prices (Agmarknet via data.gov.in) for staple crops — current price, trend, and a sell recommendation (sell now / hold / wait) |
| **Built-in fallbacks** | Reference price datasets keep the price page useful whenever the live API is unreachable — the page never breaks |
| **Multilingual UI** | Full interface in **English, हिन्दी, मराठी, and தமிழ்** (including per-script font loading), switchable in-app and remembered |
| **Responsive design** | Mobile-first layout with a hamburger navigation, usable on low-end phones |

## 🗂️ Project structure

```
cropsmart/
└── crop/
    ├── index.html                 # Landing page
    ├── crop-recommendation.html   # Crop advisor (weather-driven)
    ├── price-prediction.html      # Mandi price dashboard
    ├── about.html                 # About the project
    ├── css/style.css              # Styling (single stylesheet)
    ├── images/                    # Crop imagery
    └── js/
        ├── main.js                # Navigation & shared behavior
        ├── crop-recommendation.js # Weather fetch + suitability engine
        ├── price-prediction.js    # Agmarknet/data.gov.in integration
        └── language.js            # 4-language i18n system
```

## 🚀 Run it

No build step, no dependencies — it's plain HTML/CSS/JS:

```bash
git clone https://github.com/rodrixdcruz/cropsmart.git
# open crop/index.html in a browser, or serve it:
cd cropsmart/crop && python -m http.server 5500
```

### API keys (free)

| Feature | Provider | Without a key |
|---|---|---|
| Live weather | [OpenWeatherMap](https://openweathermap.org/api) | Recommendation falls back to manual entry |
| Mandi prices | [data.gov.in](https://data.gov.in) (Agmarknet resource) | Reference prices are shown instead |

Keys are read from `js/crop-recommendation.js` and `js/price-prediction.js` — replace the placeholder constants at the top of each file (both providers have free tiers).

## 📜 License

Released under the [MIT License](LICENSE).

## 🌦️ Also from this author

**[WeatherGPT](https://github.com/rodrixdcruz/Weather-GPT)** — the evolution of this idea into a full-stack, explainable weather-risk & disaster decision platform, live at [weathergpt-web.onrender.com](https://weathergpt-web.onrender.com).
