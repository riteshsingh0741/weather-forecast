const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const mainCard = document.getElementById("mainCard");
const errorBox = document.getElementById("error");

const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const minmaxEl = document.getElementById("minmax");
const hourlyList = document.getElementById("hourlyList");

const uvLarge = document.getElementById("uvIndexLarge"),
      uvBar = document.getElementById("uvBarFill"),
      uvNote = document.getElementById("uvNote");

const humidityLarge = document.getElementById("humidityLarge"),
      humidityFill = document.getElementById("humidityFill"),
      humNote = document.getElementById("humNote");

const windVal = document.getElementById("windVal"),
      windNeedle = document.getElementById("windNeedle"),
      windDesc = document.getElementById("windDesc");

const dewLarge = document.getElementById("dewPointLarge"),
      dewNote = document.getElementById("dewNote");

const pressureLarge = document.getElementById("pressureLarge"),
      fill = document.getElementById("gFill");

const visLarge = document.getElementById("visLarge"),
      visFill = document.getElementById("visFill"),
      visNote = document.getElementById("visNote");

const aqiValue = document.getElementById("aqiValue"),
      aqiFill = document.getElementById("aqiFill"),
      aqiNote = document.getElementById("aqiNote");

// State
let useFahrenheit = false;
let lastWeatherData = null;
let lastPlace = null;

// ── Helpers ──────────────────────────────────────────────
function toF(c) { return (c * 9/5 + 32).toFixed(1); }
function displayTemp(c) { return useFahrenheit ? `${toF(c)} °F` : `${c.toFixed(1)} °C`; }
function displayTempShort(c) { return useFahrenheit ? `${toF(c)}°F` : `${c.toFixed(1)}°`; }

function uvColor(u) {
  if (u < 2) return "#2be28a";
  if (u < 5) return "#ffd24d";
  if (u < 7) return "#ff8a3d";
  if (u < 10) return "#ff3b3b";
  return "#a50f1f";
}
function uvLabel(u) {
  if (u < 2) return "Low";
  if (u < 5) return "Moderate";
  if (u < 7) return "High";
  if (u < 10) return "Very High";
  return "Extreme";
}
function humNoteText(h) { return h < 40 ? "Dry" : h < 60 ? "Comfortable" : "High humidity"; }
function aqiText(a) {
  if (a <= 50) return "Good";
  if (a <= 100) return "Moderate";
  if (a <= 150) return "Unhealthy for sensitive";
  if (a <= 200) return "Unhealthy";
  if (a <= 300) return "Very Unhealthy";
  return "Hazardous";
}
function aqiColor(a) {
  if (a <= 50) return "#2be28a";
  if (a <= 100) return "#ffd24d";
  if (a <= 150) return "#ff8a3d";
  if (a <= 200) return "#ff3b3b";
  return "#a50f1f";
}
function weatherLabel(code) {
  if (code === 0)  return "Clear Sky";
  if (code <= 2)   return "Partly Cloudy";
  if (code === 3)  return "Overcast";
  if (code <= 48)  return "Foggy";
  if (code <= 57)  return "Drizzle";
  if (code <= 67)  return "Rainy";
  if (code <= 77)  return "Snowy";
  if (code <= 82)  return "Rain Showers";
  if (code <= 86)  return "Snow Showers";
  return "Thunderstorm";
}
function weatherEmoji(code, isDay) {
  if (!isDay) return "🌙";
  if (code === 0)  return "☀️";
  if (code <= 2)   return "⛅";
  if (code === 3)  return "☁️";
  if (code <= 48)  return "🌫️";
  if (code <= 57)  return "🌦️";
  if (code <= 67)  return "🌧️";
  if (code <= 77)  return "❄️";
  if (code <= 82)  return "🌧️";
  if (code <= 86)  return "🌨️";
  return "⛈️";
}

// ── Wind Direction Label ─────────────────────────────────
function windDirLabel(deg) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}

// ── Smart Summary ─────────────────────────────────────────
function smartSummary(code, temp, humidity, wind, rain) {
  let summary = "";
  if (temp > 35) summary = "It's very hot today. Stay hydrated and avoid direct sunlight.";
  else if (temp > 28) summary = "It's warm and pleasant outside. Great time to go out!";
  else if (temp > 20) summary = "Comfortable weather today. Enjoy your day!";
  else if (temp > 10) summary = "It's a bit cool today. A light jacket would help.";
  else summary = "It's cold outside. Bundle up before heading out!";
  if (rain > 60) summary += " High chance of rain — carry an umbrella.";
  if (humidity > 80) summary += " Very humid conditions expected.";
  if (wind > 30) summary += " Strong winds today, be cautious outdoors.";
  return summary;
}
function outfitSuggestion(temp, rain, wind) {
  if (temp > 35) return "👕 Outfit: Light cotton clothes, sunglasses, sunscreen";
  if (temp > 28) return "👔 Outfit: Light clothes, comfortable footwear";
  if (temp > 20) return "🧥 Outfit: Light jacket or hoodie recommended";
  if (temp > 10) return "🧣 Outfit: Warm jacket, scarf and closed shoes";
  return "🧤 Outfit: Heavy coat, gloves and warm layers";
}
function activitySuggestion(code, temp, rain, wind) {
  if (rain > 70 || code >= 61) return "🏠 Activity: Best to stay indoors today";
  if (wind > 40) return "⚠️ Activity: Avoid outdoor activities due to strong winds";
  if (temp > 38) return "🌊 Activity: Stay cool indoors or near water";
  if (temp > 20 && rain < 30) return "🏃 Activity: Great day for outdoor run or cycling!";
  if (temp > 15) return "🚶 Activity: Good for a walk or light outdoor activity";
  return "☕ Activity: Cozy indoor day — perfect for reading or coffee";
}

// ── Weather Alert ─────────────────────────────────────────
function checkAlert(code, temp, wind, rain) {
  const alerts = [];
  if (temp > 42) alerts.push("🔥 Extreme heat warning! Avoid outdoor exposure.");
  if (temp < 0)  alerts.push("🥶 Freezing temperatures! Risk of ice and frost.");
  if (wind > 50) alerts.push("💨 Strong wind alert! Secure loose objects.");
  if (rain > 80) alerts.push("🌧️ Heavy rain expected. Possible flooding in low areas.");
  if (code >= 95) alerts.push("⛈️ Thunderstorm warning! Stay indoors.");
  const card = document.getElementById("alertCard");
  const msg  = document.getElementById("alertMsg");
  if (alerts.length) {
    card.style.display = "";
    msg.innerHTML = alerts.join("<br>");
  } else {
    card.style.display = "none";
  }
}

// ── City Clock ────────────────────────────────────────────
let clockInterval = null;
function startClock(timezone) {
  if (clockInterval) clearInterval(clockInterval);
  function tick() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { timeZone: timezone, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateStr = now.toLocaleDateString("en-US", { timeZone: timezone, weekday: "long", year: "numeric", month: "long", day: "numeric" });
    document.getElementById("cityTime").textContent = timeStr;
    document.getElementById("cityDate").textContent = dateStr;
    document.getElementById("cityTimezone").textContent = timezone;
  }
  tick();
  clockInterval = setInterval(tick, 1000);
}

// ── Charts ────────────────────────────────────────────────
function drawChart(canvasId, labels, data, color, label) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const parent = canvas.parentElement;
  const W = parent ? parent.offsetWidth - 28 : 400;
  canvas.width  = W;
  canvas.height = 120;
  const ctx = canvas.getContext("2d");
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 20, bottom: 30, left: 30, right: 10 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const min = Math.min(...data) - 2;
  const max = Math.max(...data) + 2;
  const xStep = chartW / (data.length - 1);

  const xPos = i => pad.left + i * xStep;
  const yPos = v => pad.top + chartH - ((v - min) / (max - min)) * chartH;

  // Grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
  }

  // Fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, H);
  grad.addColorStop(0, color + "88");
  grad.addColorStop(1, color + "00");
  ctx.beginPath();
  ctx.moveTo(xPos(0), yPos(data[0]));
  data.forEach((v, i) => ctx.lineTo(xPos(i), yPos(v)));
  ctx.lineTo(xPos(data.length - 1), H);
  ctx.lineTo(xPos(0), H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  data.forEach((v, i) => i === 0 ? ctx.moveTo(xPos(i), yPos(v)) : ctx.lineTo(xPos(i), yPos(v)));
  ctx.stroke();

  // Labels
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "10px Poppins";
  ctx.textAlign = "center";
  labels.forEach((l, i) => {
    if (i % 2 === 0) ctx.fillText(l, xPos(i), H - 6);
  });

  // Values on points
  ctx.fillStyle = color;
  ctx.font = "bold 10px Poppins";
  data.forEach((v, i) => {
    if (i % 2 === 0) ctx.fillText(Math.round(v), xPos(i), yPos(v) - 6);
  });
}


function applyTheme(isDay) {
  document.body.classList.toggle("night", !isDay);
}
function setBackground(code, isDay) {
  const bg = document.querySelector(".bg");
  let file;
  if (!isDay)          file = "night.gif";
  else if (code === 0) file = "sunny.gif";
  else if (code <= 2)  file = "partly-cloudy.gif";
  else if (code === 3) file = "cloudy.gif";
  else if (code <= 48) file = "foggy.gif";
  else if (code <= 57) file = "drizzle.gif";
  else if (code <= 67) file = "rainy.gif";
  else if (code <= 77) file = "snowy.gif";
  else if (code <= 82) file = "rainy.gif";
  else if (code <= 86) file = "snowy.gif";
  else                 file = "thunderstorm.gif";
  bg.style.backgroundImage = `url("${file}")`;
}

// ── Loader ────────────────────────────────────────────────
function showLoader() { document.getElementById("loaderOverlay").classList.add("active"); }
function hideLoader() { document.getElementById("loaderOverlay").classList.remove("active"); }

// ── Search History ────────────────────────────────────────
function getHistory() { return JSON.parse(localStorage.getItem("wxHistory") || "[]"); }
function saveHistory(city) {
  let h = getHistory().filter(c => c.toLowerCase() !== city.toLowerCase());
  h.unshift(city);
  if (h.length > 5) h = h.slice(0, 5);
  localStorage.setItem("wxHistory", JSON.stringify(h));
  renderHistoryChips();
}
function renderHistoryChips() {
  const h = getHistory();
  const el = document.getElementById("historyChips");
  if (!el) return;
  if (!h.length) {
    el.innerHTML = `<div style="color:rgba(255,255,255,0.4);font-size:0.85rem">No recent searches</div>`;
    return;
  }
  el.innerHTML = "";
  h.forEach(city => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = city;
    btn.addEventListener("click", () => {
      document.getElementById("historyDropdown").classList.remove("open");
      window.search(city);
    });
    el.appendChild(btn);
  });
}

// Toggle history dropdown
document.getElementById("historyToggle").onclick = (e) => {
  e.stopPropagation();
  renderHistoryChips();
  document.getElementById("historyDropdown").classList.toggle("open");
};
document.getElementById("historyDropdown").addEventListener("click", (e) => {
  e.stopPropagation();
});
document.addEventListener("click", () => {
  document.getElementById("historyDropdown").classList.remove("open");
});

// ── Favourites ────────────────────────────────────────────
function getFavs() { return JSON.parse(localStorage.getItem("wxFavs") || "[]"); }
function saveFav(city) {
  let f = getFavs();
  if (!f.includes(city)) { f.push(city); localStorage.setItem("wxFavs", JSON.stringify(f)); }
  renderFavs();
}
window.removeFav = function(city) {
  let f = getFavs().filter(c => c !== city);
  localStorage.setItem("wxFavs", JSON.stringify(f));
  renderFavs();
}
function renderFavs() {
  const f = getFavs();
  const card = document.getElementById("favCard");
  const list = document.getElementById("favList");
  if (!f.length) { card.style.display = "none"; return; }
  card.style.display = "";
  list.innerHTML = "";
  f.forEach(city => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = city;
    btn.addEventListener("click", () => window.search(city));
    const rem = document.createElement("button");
    rem.className = "chip chip-remove";
    rem.textContent = "✕";
    rem.addEventListener("click", () => window.removeFav(city));
    list.appendChild(btn);
    list.appendChild(rem);
  });
}

// ── Fetch ─────────────────────────────────────────────────
async function geocode(c) {
  const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(c)}&count=1`);
  const j = await r.json();
  if (!j.results || !j.results.length) throw new Error("City not found");
  return j.results[0];
}
async function geocodeLatLon(lat, lon) {
  const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
  const j = await r.json();
  return j.address?.city || j.address?.town || j.address?.village || j.display_name.split(",")[0];
}
async function fetchWeather(lat, lon) {
  const vars = "temperature_2m,apparent_temperature,precipitation_probability,relativehumidity_2m,dewpoint_2m,pressure_msl,uv_index,visibility,windspeed_10m,winddirection_10m";
  const r = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=${vars}&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset,precipitation_probability_max&timezone=auto`
  );
  return r.json();
}
async function fetchAir(lat, lon) {
  const r = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=us_aqi`);
  return r.json();
}

// ── Render Hourly ─────────────────────────────────────────
function renderHourly(w) {
  hourlyList.innerHTML = "";
  const now = w.current_weather.time;
  const startIdx = Math.max(w.hourly.time.findIndex(t => t === now), 0);
  w.hourly.time.slice(startIdx, startIdx + 12).forEach((t, j) => {
    const i = startIdx + j;
    const time = new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const temp = displayTempShort(w.hourly.temperature_2m[i]);
    const prob = w.hourly.precipitation_probability[i];
    const uv   = w.hourly.uv_index[i];
    const ws   = w.hourly.windspeed_10m[i];
    const item = document.createElement("div");
    item.className = "hourly-item";
    item.innerHTML = `
      <div style="color:#ccc;font-size:0.78rem">${j === 0 ? "Now" : time}</div>
      <div style="font-size:1.1rem;font-weight:700">${temp}</div>
      ${prob > 0 ? `<div style="color:#56d3ff;font-size:0.75rem">💧${prob}%</div>` : "<div style='font-size:0.75rem;opacity:0.4'>--</div>"}
      <div style="color:#ffd24d;font-size:0.75rem">UV ${uv != null ? uv.toFixed(1) : "--"}</div>
      <div style="color:#aaa;font-size:0.75rem">${ws != null ? Math.round(ws) + "km/h" : ""}</div>
    `;
    hourlyList.appendChild(item);
  });
}

// ── Render 5-Day ──────────────────────────────────────────
function renderDaily(w) {
  const list = document.getElementById("dailyList");
  list.innerHTML = "";
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  w.daily.time.slice(0, 5).forEach((t, i) => {
    const day = days[new Date(t).getDay()];
    const hi = displayTempShort(w.daily.temperature_2m_max[i]);
    const lo = displayTempShort(w.daily.temperature_2m_min[i]);
    const emoji = weatherEmoji(w.daily.weathercode[i], 1);
    const div = document.createElement("div");
    div.className = "daily-item";
    div.innerHTML = `<span class="daily-day">${i === 0 ? "Today" : day}</span><span class="daily-emoji">${emoji}</span><span class="daily-label">${weatherLabel(w.daily.weathercode[i])}</span><span class="daily-temps"><b>${hi}</b> / <span style="opacity:0.6">${lo}</span></span>`;
    list.appendChild(div);
  });
}

// ── Render All ────────────────────────────────────────────
function renderAll(place, w, a) {
  lastWeatherData = w;
  lastPlace = place;

  mainCard.classList.remove("hidden");
  mainCard.classList.add("fade-in");
  setTimeout(() => mainCard.classList.remove("fade-in"), 600);

  // Render smart summary & clock immediately after card is visible
  cityNameEl.textContent = `${place.name}, ${place.country || ""}`;
  tempEl.textContent = displayTemp(w.current_weather.temperature);
  conditionEl.textContent = weatherLabel(w.current_weather.weathercode);
  minmaxEl.textContent = `↑ ${displayTempShort(w.daily.temperature_2m_max[0])} / ↓ ${displayTempShort(w.daily.temperature_2m_min[0])}`;

  const isDay = w.current_weather.is_day;
  applyTheme(isDay);
  setBackground(w.current_weather.weathercode, isDay);

  document.getElementById("weatherEmoji").textContent = weatherEmoji(w.current_weather.weathercode, isDay);

  const now = w.current_weather.time;
  const idx = w.hourly.time.findIndex(t => t === now);
  const i = idx !== -1 ? idx : 0;

  const feelsLike = w.hourly.apparent_temperature[i];
  document.getElementById("feels").textContent = `Feels like ${displayTemp(feelsLike)}`;

  const rain = w.hourly.precipitation_probability[i];
  document.getElementById("rainProb").textContent = `💧 Rain chance: ${rain}%`;

  const sunrise = new Date(w.daily.sunrise[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const sunset  = new Date(w.daily.sunset[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  document.getElementById("sunTimes").textContent = `🌅 ${sunrise}  🌇 ${sunset}`;

  renderHourly(w);
  renderDaily(w);

  const hr = w.hourly;
  const uv = Math.max(...hr.uv_index.slice(0, 6));
  const h  = hr.relativehumidity_2m[i];
  const dp = hr.dewpoint_2m[i];
  const p  = hr.pressure_msl[i];
  const v  = hr.visibility[i];
  const ws = w.current_weather.windspeed;
  const wd = w.current_weather.winddirection;

  uvLarge.textContent = uv.toFixed(1);
  uvBar.style.width = (uv / 11) * 100 + "%";
  uvBar.style.background = uvColor(uv);
  uvNote.textContent = uvLabel(uv);

  humidityLarge.textContent = h + "%";
  humidityFill.style.width = h + "%";
  humNote.textContent = humNoteText(h);

  dewLarge.textContent = dp.toFixed(1) + "°C";
  dewNote.textContent = dp > 18 ? "Humid" : "Comfortable";

  pressureLarge.textContent = p.toFixed(1) + " hPa";
  fill.setAttribute("stroke-dasharray", `${Math.round((p - 950) / 100)} 314`);

  const km = (v / 1000).toFixed(1);
  visLarge.textContent = km + " km";
  visFill.style.width = Math.min((km / 20) * 100, 100) + "%";
  visNote.textContent = km > 5 ? "Good" : "Low";

  windVal.textContent = Math.round(ws) + " km/h";
  windNeedle.style.transform = `rotate(${wd}deg)`;
  windDesc.textContent = `${ws < 3 ? "Calm" : ws < 8 ? "Breeze" : ws < 15 ? "Windy" : "Strong"} · ${windDirLabel(wd)}`;

  // Smart summary
  document.getElementById("smartSummary").textContent  = smartSummary(w.current_weather.weathercode, w.current_weather.temperature, h, ws, rain);
  document.getElementById("outfitSuggestion").textContent   = outfitSuggestion(w.current_weather.temperature, rain, ws);
  document.getElementById("activitySuggestion").textContent = activitySuggestion(w.current_weather.weathercode, w.current_weather.temperature, rain, ws);

  // Weather alert
  checkAlert(w.current_weather.weathercode, w.current_weather.temperature, ws, rain);

  // City clock
  startClock(w.timezone || "UTC");

  // Charts — drawn after full paint
  const tempLabels = w.hourly.time.slice(0, 24).map(t => new Date(t).toLocaleTimeString([], { hour: "2-digit" }));
  const tempData   = w.hourly.temperature_2m.slice(0, 24);
  const rainLabels = w.daily.time.slice(0, 7).map(t => new Date(t).toLocaleDateString([], { weekday: "short" }));
  const rainData   = w.daily.precipitation_probability_max
    ? w.daily.precipitation_probability_max.slice(0, 7)
    : w.daily.time.slice(0, 7).map((_, di) => Math.max(...w.hourly.precipitation_probability.slice(di * 24, di * 24 + 24)));

  setTimeout(() => {
    drawChart("tempChart", tempLabels, tempData, "#00b4d8", "Temperature");
    drawChart("rainChart", rainLabels, rainData, "#56d3ff", "Rain %");
  }, 600);

  const k = a.hourly.us_aqi[0];
  aqiValue.textContent = k;
  aqiFill.style.width = Math.min((k / 300) * 100, 100) + "%";
  aqiFill.style.background = aqiColor(k);
  aqiNote.textContent = aqiText(k);

  renderFavs();
}

// ── Search ────────────────────────────────────────────────
const hero = document.getElementById("hero");
const heroInput = document.getElementById("heroInput");
const heroBtn = document.getElementById("heroBtn");

window.search = async function(query) {
  const c = (query || cityInput.value).trim();
  if (!c) return;
  errorBox.textContent = "";
  showLoader();
  try {
    const g = await geocode(c);
    const [w, a] = await Promise.all([fetchWeather(g.latitude, g.longitude), fetchAir(g.latitude, g.longitude)]);
    window._lastAir = a;
    hero.classList.add("hide");
    document.querySelector(".topbar").classList.add("show");
    cityInput.value = c;
    saveHistory(c);
    renderAll(g, w, a);
  } catch (e) {
    errorBox.textContent = e.message;
  } finally {
    hideLoader();
  }
}

// ── Geolocation ───────────────────────────────────────────
async function geoLocate() {
  if (!navigator.geolocation) { errorBox.textContent = "Geolocation not supported"; return; }
  showLoader();
  navigator.geolocation.getCurrentPosition(async pos => {
    try {
      const { latitude: lat, longitude: lon } = pos.coords;
      const cityName = await geocodeLatLon(lat, lon);
      const [w, a] = await Promise.all([fetchWeather(lat, lon), fetchAir(lat, lon)]);
      window._lastAir = a;
      const place = { name: cityName, country: "", latitude: lat, longitude: lon };
      hero.classList.add("hide");
      document.querySelector(".topbar").classList.add("show");
      cityInput.value = cityName;
      saveHistory(cityName);
      renderAll(place, w, a);
    } catch(e) {
      errorBox.textContent = "Could not fetch location weather";
    } finally {
      hideLoader();
    }
  }, () => { hideLoader(); errorBox.textContent = "Location access denied"; });
}

// ── Light/Dark Toggle ───────────────────────────────────────
const themeToggle = document.getElementById("themeToggle");
const heroThemeToggle = document.getElementById("heroThemeToggle");
let isLight = localStorage.getItem("wxLight") === "true";
function applyLightDark() {
  document.body.classList.toggle("light", isLight);
  const label = isLight ? "☀️ Light" : "🌙 Dark";
  themeToggle.textContent = label;
  heroThemeToggle.textContent = label;
}
applyLightDark();
[themeToggle, heroThemeToggle].forEach(btn => {
  btn.addEventListener("click", () => {
    isLight = !isLight;
    localStorage.setItem("wxLight", isLight);
    applyLightDark();
  });
});

// ── Unit Toggle ───────────────────────────────────────────
document.getElementById("unitBtn").onclick = () => {
  useFahrenheit = !useFahrenheit;
  document.getElementById("unitBtn").textContent = useFahrenheit ? "°F / °C" : "°C / °F";
  if (lastWeatherData && lastPlace) renderAll(lastPlace, lastWeatherData, window._lastAir);
};

// ── Favourite ─────────────────────────────────────────────
document.getElementById("favBtn").onclick = () => {
  if (lastPlace) saveFav(lastPlace.name);
};

// ── Share ─────────────────────────────────────────────────
document.getElementById("shareBtn").onclick = () => {
  if (!lastPlace || !lastWeatherData) return;
  const w = lastWeatherData;
  const text = `📍 ${lastPlace.name}\n🌡️ ${displayTemp(w.current_weather.temperature)}\n☁️ ${weatherLabel(w.current_weather.weathercode)}\n💧 Rain: ${w.hourly.precipitation_probability[0]}%`;
  navigator.clipboard.writeText(text).then(() => {
    errorBox.style.color = "#2be28a";
    errorBox.textContent = "✅ Weather summary copied to clipboard!";
    setTimeout(() => { errorBox.textContent = ""; errorBox.style.color = "#ff9999"; }, 3000);
  });
};

// ── Event Listeners ───────────────────────────────────────
heroBtn.onclick = () => search(heroInput.value);
heroInput.onkeyup = (e) => { if (e.key === "Enter") search(heroInput.value); };
searchBtn.onclick = () => search();
cityInput.onkeyup = (e) => { if (e.key === "Enter") search(); };
document.getElementById("geoBtn").onclick = geoLocate;
document.getElementById("geoBtnTop").onclick = geoLocate;

window._lastAir = null;

renderHistoryChips();
renderFavs();

// Register Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js")
    .then(() => console.log("PWA ready"))
    .catch(e => console.log("SW error", e));
}
