🌦️ Weather Forecasting System (PWA)
📋 Overview

The Weather Forecasting System is a fully responsive, real-time Weather & Air Quality Dashboard built using HTML, CSS, and Vanilla JavaScript.

It provides live weather insights, air quality metrics, smart recommendations, and interactive visualizations — all in a modern glassmorphism UI.

⚡ Works entirely on the frontend — no backend required.

🌐 You can download this App on any device !

👉 https://weather-ritesh.netlify.app/

🚀 Features
🔍 Core Functionality
Search weather by city name
📍 Detect current location using Geolocation API
🌡️ Real-time temperature, feels-like, min/max
☁️ Weather conditions with emoji + labels
🌅 Sunrise & Sunset timings
📊 Data Visualization
📈 24-hour temperature trend chart (Canvas API)
🌧️ Weekly rain probability chart
🕐 Hourly forecast (next 12 hours)
📅 5-day forecast
🌍 Advanced Metrics
🌬️ Wind speed & direction (with dial UI)
💧 Humidity & Dew Point
📊 Pressure gauge visualization
👁️ Visibility indicator
☢️ UV Index with intensity bar
🌫️ Air Quality Index (AQI)
🧠 Smart Features
💬 AI-like weather summary in plain English
🧥 Outfit suggestions based on weather
🏃 Activity recommendations
⚠️ Weather alerts (heat, rain, wind, storms)
🎨 UI / UX Highlights
Glassmorphism design with animations
🎨 Dynamic background changes based on weather
🌙 Auto night mode after sunset
☀️ Light / Dark theme toggle
🌡️ °C / °F unit toggle
💾 User Experience
🕐 Live city clock with timezone
🔄 Search history (last 5 searches)
⭐ Favourite cities
📋 Share weather summary (clipboard)
📱 Progressive Web App (PWA)
Installable on mobile & desktop
Offline support via Service Worker
Web App Manifest enabled
🧠 How It Works
User searches a city or uses geolocation
Coordinates are fetched using Geocoding APIs
Weather + AQI data is retrieved from APIs
Data is processed and rendered dynamically
Charts are drawn using Canvas API
Smart insights are generated using custom logic
🗂️ Project Structure
Weather-Forecasting-System/
├── index.html          # Main UI structure
├── style.css           # Styling, animations, themes
├── script.js           # Core logic, API calls, rendering
├── manifest.json       # PWA configuration
├── sw.js               # Service Worker (offline support)
├── icons/              # App icons (192px, 512px)
├── assets/             # Background GIFs
└── README.md           # Documentation
⚙️ Technologies Used
HTML5 – Structure
CSS3 – Styling, glassmorphism, animations
JavaScript (ES6+) – Logic, API integration, DOM manipulation
Canvas API – Custom chart rendering
LocalStorage – Persistence (history, favourites, settings)
Service Worker – Offline caching
Web Manifest – PWA support
🌐 APIs Used
Open-Meteo API → Weather forecast, hourly & daily data
Open-Meteo Air Quality API → AQI data
Open-Meteo Geocoding API → City search
Nominatim (OpenStreetMap) → Reverse geocoding
