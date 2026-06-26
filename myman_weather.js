// This script is intended to be loaded by the MyManager loader alongside the other modules.
// It does not do anything on its own.

// ===================================================================
// === FEATURE: WEATHER WIDGET
// ===================================================================

(function() {
    'use strict';

    // ----------------------------------------------------------------
    // Shared look-up tables
    // ----------------------------------------------------------------
    const WEATHER_ICONS = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
        45: '🌫️', 48: '🌫️',
        51: '🌧️', 53: '🌧️', 55: '🌧️',
        61: '🌧️', 63: '🌧️', 65: '🌧️',
        71: '❄️', 73: '❄️', 75: '❄️',
        80: '🌦️', 81: '🌦️', 82: '🌧️',
        95: '⛈️', 96: '⛈️', 99: '⛈️'
    };

    const WEATHER_DESCRIPTIONS = {
        0: 'Clear sky',       1: 'Mainly clear',     2: 'Partly cloudy',  3: 'Overcast',
        45: 'Foggy',          48: 'Foggy',
        51: 'Light drizzle',  53: 'Moderate drizzle', 55: 'Dense drizzle',
        61: 'Slight rain',    63: 'Moderate rain',    65: 'Heavy rain',
        71: 'Slight snow',    73: 'Moderate snow',    75: 'Heavy snow',
        80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
        95: 'Thunderstorm',   96: 'Thunderstorm + hail', 99: 'Thunderstorm + heavy hail'
    };

    // Athens coordinates
    const LAT = 37.9838;
    const LON = 23.7278;

    function getWindDirection(degrees) {
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return dirs[Math.round(((degrees % 360) / 45)) % 8];
    }

    function getMoonPhase(date) {
        const known = new Date(2000, 0, 6, 18, 14, 0);
        const synodic = 29.530588853;
        const phase = (((date - known) / 86400000) % synodic + synodic) % synodic;
        if (phase < 1.85)  return { icon: '🌑', name: 'New Moon' };
        if (phase < 5.54)  return { icon: '🌒', name: 'Waxing Crescent' };
        if (phase < 9.22)  return { icon: '🌓', name: 'First Quarter' };
        if (phase < 12.91) return { icon: '🌔', name: 'Waxing Gibbous' };
        if (phase < 16.61) return { icon: '🌕', name: 'Full Moon' };
        if (phase < 20.30) return { icon: '🌖', name: 'Waning Gibbous' };
        if (phase < 23.99) return { icon: '🌗', name: 'Last Quarter' };
        if (phase < 27.68) return { icon: '🌘', name: 'Waning Crescent' };
        return { icon: '🌑', name: 'New Moon' };
    }

    function getUVInfo(uv) {
        if (uv <= 2)  return { color: '#4caf50', label: 'Low' };
        if (uv <= 5)  return { color: '#ffeb3b', label: 'Moderate', textColor: '#666' };
        if (uv <= 7)  return { color: '#ff9800', label: 'High' };
        if (uv <= 10) return { color: '#f44336', label: 'Very High' };
        return { color: '#9c27b0', label: 'Extreme' };
    }

    function getAQIInfo(aqi) {
        if (aqi <= 20)  return { color: '#4caf50', label: 'Good',           bg: 'rgba(76,175,80,0.15)' };
        if (aqi <= 40)  return { color: '#8bc34a', label: 'Fair',           bg: 'rgba(139,195,74,0.15)' };
        if (aqi <= 60)  return { color: '#ffeb3b', label: 'Moderate',       bg: 'rgba(255,235,59,0.15)' };
        if (aqi <= 80)  return { color: '#ff9800', label: 'Poor',           bg: 'rgba(255,152,0,0.15)' };
        if (aqi <= 100) return { color: '#f44336', label: 'Very Poor',      bg: 'rgba(244,67,54,0.15)' };
        return                 { color: '#9c27b0', label: 'Extremely Poor', bg: 'rgba(156,39,176,0.15)' };
    }

    function buildHourlyChart(hourlyData, todayStr) {
        const times = hourlyData.time;
        const temps = hourlyData.temperature_2m;
        const todayTemps = [];
        const todayLabels = [];
        for (let i = 0; i < times.length; i++) {
            if (!times[i].startsWith(todayStr)) continue;
            const hour = parseInt(times[i].slice(11, 13));
            if (hour % 3 !== 0) continue;
            todayTemps.push(Math.round(temps[i]));
            todayLabels.push(hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`);
        }
        if (!todayTemps.length) return '';

        const min   = Math.min(...todayTemps) - 2;
        const max   = Math.max(...todayTemps) + 2;
        const range = max - min || 1;
        const W = 600, H = 80, pad = 28;
        const colW = (W - pad * 2) / (todayTemps.length - 1 || 1);

        const pts = todayTemps.map((t, i) => {
            const x = pad + i * colW;
            const y = H - 12 - ((t - min) / range) * (H - 24);
            return `${x},${y}`;
        }).join(' ');

        const dots = todayTemps.map((t, i) => {
            const x = pad + i * colW;
            const y = H - 12 - ((t - min) / range) * (H - 24);
            return `<circle cx="${x}" cy="${y}" r="3.5" fill="#4facfe"/>
                    <text x="${x}" y="${y - 7}" text-anchor="middle" font-size="9" fill="#2c3e50" font-weight="600">${t}°</text>`;
        }).join('');

        const labels = todayLabels.map((lbl, i) => {
            const x = pad + i * colW;
            return `<text x="${x}" y="${H - 1}" text-anchor="middle" font-size="9" fill="#64748b">${lbl}</text>`;
        }).join('');

        return `
            <div style="background:#f8fafc;border-radius:10px;padding:16px 12px 10px;margin-bottom:20px;">
                <div style="font-size:13px;font-weight:600;color:#2c3e50;margin-bottom:10px;">🕐 Today's Temperature</div>
                <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;overflow:visible;">
                    <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stop-color="#4facfe"/>
                            <stop offset="100%" stop-color="#00f2fe"/>
                        </linearGradient>
                    </defs>
                    <polyline points="${pts}" fill="none" stroke="url(#lineGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    ${dots}
                    ${labels}
                </svg>
            </div>
        `;
    }

    // ----------------------------------------------------------------
    // Init — creates the pill widget and starts the refresh cycle
    // ----------------------------------------------------------------
    function initWeatherWidget(parentContainer, config) {
        const weatherWidget = document.createElement('div');
        weatherWidget.id = 'tm-weather-widget';
        weatherWidget.style.cssText = `
            background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: var(--tm-primary-color);
            border: 1px solid rgba(255,255,255,0.2);
            height: 40px;
            padding: 0 14px;
            border-radius: 12px;
            display: ${config.weatherWidgetEnabled ? 'flex' : 'none'};
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
            position: relative;
        `;
        weatherWidget.innerHTML = `
            <span id="tm-weather-icon" style="font-size: 20px; line-height: 1; flex-shrink: 0;">🌤️</span>
            <span id="tm-weather-temp" style="font-size: 13px; font-weight: 700;">Loading...</span>
        `;

        weatherWidget.addEventListener('mouseenter', () => {
            weatherWidget.style.transform = 'translateY(-3px) scale(1.05)';
            weatherWidget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
            weatherWidget.style.borderColor = 'rgba(255,255,255,0.4)';
        });
        weatherWidget.addEventListener('mouseleave', () => {
            weatherWidget.style.transform = 'translateY(0) scale(1)';
            weatherWidget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            weatherWidget.style.borderColor = 'rgba(255,255,255,0.2)';
        });
        weatherWidget.addEventListener('click', () => showWeatherDetails(config));

        parentContainer.appendChild(weatherWidget);

        if (config.weatherWidgetEnabled) {
            fetchWeatherData(config);
            setInterval(() => fetchWeatherData(config), 30 * 60 * 1000);
        }
    }

    // ----------------------------------------------------------------
    // Show / hide (called by settings)
    // ----------------------------------------------------------------
    function updateWeatherWidgetVisibility(config) {
        const widget = document.getElementById('tm-weather-widget');
        if (!widget) return;
        if (config.weatherWidgetEnabled) {
            widget.style.display = 'flex';
            if (!widget.dataset.dataFetched) {
                fetchWeatherData(config);
                widget.dataset.dataFetched = 'true';
                setInterval(() => fetchWeatherData(config), 30 * 60 * 1000);
            }
        } else {
            widget.style.display = 'none';
        }
    }

    // ----------------------------------------------------------------
    // Data fetching — compact widget
    // ----------------------------------------------------------------
    function fetchWeatherData(config) {
        console.log(`[MMS Weather] Fetching current weather for Athens (${LAT}, ${LON})...`);
        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&timezone=auto`,
            onload(res) {
                try {
                    updateWeatherWidget(JSON.parse(res.responseText));
                } catch (e) {
                    console.error('[MMS Weather] Failed to parse weather data:', e);
                }
            },
            onerror(err) {
                console.error('[MMS Weather] Failed to fetch weather:', err);
            }
        });
    }

    // ----------------------------------------------------------------
    // Update the compact pill widget
    // ----------------------------------------------------------------
    function updateWeatherWidget(weatherData) {
        const tempEl = document.getElementById('tm-weather-temp');
        const widget = document.getElementById('tm-weather-widget');
        if (!tempEl || !widget) return;

        const cur  = weatherData.current;
        const temp = Math.round(cur.temperature_2m);
        const icon = WEATHER_ICONS[cur.weather_code] || '🌤️';

        const iconEl = widget.querySelector('#tm-weather-icon');
        if (iconEl) iconEl.textContent = icon;
        tempEl.textContent = `${temp}°C Athens`;

        // Temperature-based hover gradient
        let hoverGrad;
        if      (temp > 30) hoverGrad = 'linear-gradient(135deg, rgba(255,152,0,0.4) 0%, rgba(255,87,34,0.4) 100%)';
        else if (temp > 20) hoverGrad = 'linear-gradient(135deg, rgba(255,213,79,0.4) 0%, rgba(255,179,0,0.4) 100%)';
        else if (temp > 10) hoverGrad = 'linear-gradient(135deg, rgba(79,172,254,0.4) 0%, rgba(0,242,254,0.4) 100%)';
        else                hoverGrad = 'linear-gradient(135deg, rgba(100,181,246,0.4) 0%, rgba(25,118,210,0.4) 100%)';
        widget.dataset.hoverGradient = hoverGrad;

        // Re-wire hover to use temperature colour
        widget.onmouseenter = function() {
            this.style.background      = this.dataset.hoverGradient;
            this.style.backdropFilter  = 'blur(10px)';
            this.style.webkitBackdropFilter = 'blur(10px)';
            this.style.transform       = 'translateY(-3px) scale(1.05)';
            this.style.boxShadow       = '0 6px 16px rgba(0,0,0,0.3)';
            this.style.borderColor     = 'rgba(255,255,255,0.4)';
        };
        widget.onmouseleave = function() {
            this.style.background      = 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)';
            this.style.backdropFilter  = 'blur(10px)';
            this.style.webkitBackdropFilter = 'blur(10px)';
            this.style.transform       = 'translateY(0) scale(1)';
            this.style.boxShadow       = '0 2px 8px rgba(0,0,0,0.15)';
            this.style.borderColor     = 'rgba(255,255,255,0.2)';
        };
    }

    // ----------------------------------------------------------------
    // Detail modal — 5-day forecast
    // ----------------------------------------------------------------
    function showWeatherDetails(config) {
        const overlay = document.createElement('div');
        overlay.className = 'tm-modal-overlay';
        overlay.innerHTML = `
            <div class="tm-modal-content" style="max-width: 960px; max-height: 90vh; overflow-y: auto;">
                <div class="tm-modal-header">
                    <h3>🌤️ Weather Forecast — Athens</h3>
                    <button class="tm-modal-close">&times;</button>
                </div>
                <div class="tm-modal-body">
                    <div id="tm-weather-details" style="text-align: center; padding: 20px;">
                        <div style="font-size: 18px; margin-bottom: 12px; color: #64748b;">Loading detailed forecast...</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        let forecastData = null, aqiData = null, pending = 2;
        function tryRender() {
            pending--;
            if (pending > 0) return;
            if (forecastData) displayWeatherForecast(forecastData, aqiData);
        }

        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
                 `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,surface_pressure,visibility,dew_point_2m` +
                 `&hourly=temperature_2m` +
                 `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,precipitation_probability_max,sunrise,sunset,uv_index_max,wind_speed_10m_max,daylight_duration` +
                 `&timezone=auto&forecast_days=5`,
            onload(res) {
                try {
                    forecastData = JSON.parse(res.responseText);
                    tryRender();
                } catch (e) {
                    console.error('[MMS Weather] Parse error:', e);
                    const el = document.getElementById('tm-weather-details');
                    if (el) el.innerHTML = '<div style="color:#ef5350;">Failed to parse forecast data</div>';
                    tryRender();
                }
            },
            onerror(err) {
                console.error('[MMS Weather] Forecast request error:', err);
                tryRender();
            }
        });

        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone&timezone=auto`,
            onload(res) {
                try {
                    aqiData = JSON.parse(res.responseText);
                } catch (e) {
                    console.warn('[MMS Weather] AQI parse error:', e);
                    aqiData = null;
                }
                tryRender();
            },
            onerror() {
                aqiData = null;
                tryRender();
            }
        });
    }

    function displayWeatherForecast(weatherData, aqiData) {
        const container = document.getElementById('tm-weather-details');
        if (!container) return;

        if (!weatherData || !weatherData.daily) {
            container.innerHTML = '<div style="color:#ef5350;">Invalid weather data received</div>';
            return;
        }

        const todayStr = weatherData.daily.time[0];

        // ── Current conditions ────────────────────────────────────────────
        let currentHTML = '';
        if (weatherData.current) {
            const c       = weatherData.current;
            const temp    = Math.round(c.temperature_2m);
            const icon    = WEATHER_ICONS[c.weather_code] || '🌤️';
            const desc    = WEATHER_DESCRIPTIONS[c.weather_code] || 'Unknown';
            const uvToday = Math.round(weatherData.daily.uv_index_max?.[0] || 0);
            const uvInfo  = getUVInfo(uvToday);
            const stat = (label, value) =>
                `<div style="text-align:center;">
                    <div style="font-size:11px;opacity:0.75;margin-bottom:3px;">${label}</div>
                    <div style="font-size:16px;font-weight:600;">${value}</div>
                </div>`;
            currentHTML = `
                <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2d6a9f 100%);color:white;padding:24px;border-radius:14px;margin-bottom:16px;box-shadow:0 6px 20px rgba(0,0,0,0.2);">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
                        <div>
                            <div style="font-size:13px;opacity:0.75;margin-bottom:4px;letter-spacing:0.5px;text-transform:uppercase;">Right Now</div>
                            <div style="font-size:56px;font-weight:800;line-height:1;letter-spacing:-2px;">${temp}°C</div>
                            <div style="font-size:13px;opacity:0.8;margin-top:6px;">Feels like ${Math.round(c.apparent_temperature)}°C · Dew point ${Math.round(c.dew_point_2m ?? temp)}°C</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="font-size:72px;line-height:1;">${icon}</div>
                            <div style="font-size:12px;opacity:0.85;margin-top:6px;">${desc}</div>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.2);">
                        ${stat('💧 Humidity',  `${c.relative_humidity_2m}%`)}
                        ${stat('💨 Wind',      `${Math.round(c.wind_speed_10m)} km/h ${getWindDirection(c.wind_direction_10m)}`)}
                        ${stat('🌧️ Rain',      `${c.precipitation || 0} mm`)}
                        ${stat('☁️ Cloud',     `${c.cloud_cover ?? '—'}%`)}
                        ${stat('📊 Pressure',  `${Math.round(c.surface_pressure ?? 0)} hPa`)}
                        ${stat('👁 Visibility', `${c.visibility != null ? (c.visibility / 1000).toFixed(0) + ' km' : '—'}`)}
                    </div>
                    <div style="margin-top:12px;display:flex;align-items:center;gap:8px;">
                        <span style="font-size:11px;opacity:0.75;">UV Index</span>
                        <span style="background:${uvInfo.color};color:${uvInfo.textColor || 'white'};padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;">${uvToday} — ${uvInfo.label}</span>
                    </div>
                </div>
            `;
        }

        // ── AQI card ──────────────────────────────────────────────────────
        let aqiHTML = '';
        if (aqiData?.current) {
            const a   = aqiData.current;
            const aqi = a.european_aqi ?? null;
            if (aqi !== null) {
                const info = getAQIInfo(aqi);
                aqiHTML = `
                    <div style="background:${info.bg};border:1px solid ${info.color};border-radius:12px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <div style="background:${info.color};color:white;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;">${aqi}</div>
                            <div>
                                <div style="font-weight:700;font-size:14px;color:#2c3e50;">Air Quality — ${info.label}</div>
                                <div style="font-size:11px;color:#64748b;margin-top:2px;">European AQI</div>
                            </div>
                        </div>
                        <div style="display:flex;gap:20px;font-size:11px;color:#64748b;">
                            ${a.pm10          != null ? `<div><span style="font-weight:600;">PM₁₀</span> ${a.pm10.toFixed(1)} µg/m³</div>` : ''}
                            ${a.pm2_5         != null ? `<div><span style="font-weight:600;">PM₂.₅</span> ${a.pm2_5.toFixed(1)} µg/m³</div>` : ''}
                            ${a.nitrogen_dioxide != null ? `<div><span style="font-weight:600;">NO₂</span> ${a.nitrogen_dioxide.toFixed(1)} µg/m³</div>` : ''}
                            ${a.ozone         != null ? `<div><span style="font-weight:600;">O₃</span> ${a.ozone.toFixed(1)} µg/m³</div>` : ''}
                        </div>
                    </div>
                `;
            }
        }

        // ── Hourly temperature chart ──────────────────────────────────────
        const hourlyChart = weatherData.hourly ? buildHourlyChart(weatherData.hourly, todayStr) : '';

        // ── 5-day forecast cards ──────────────────────────────────────────
        const days = weatherData.daily.time.map((date, i) => {
            const dateObj      = new Date(date);
            const shortDay     = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dateObj.getDay()];
            const maxTemp      = Math.round(weatherData.daily.temperature_2m_max[i]);
            const minTemp      = Math.round(weatherData.daily.temperature_2m_min[i]);
            const wCode        = weatherData.daily.weather_code[i];
            const icon         = WEATHER_ICONS[wCode] || '🌤️';
            const desc         = WEATHER_DESCRIPTIONS[wCode] || 'Unknown';
            const precipProb   = weatherData.daily.precipitation_probability_max?.[i] || 0;
            const precipSum    = weatherData.daily.precipitation_sum?.[i] || 0;
            const uvIndex      = Math.round(weatherData.daily.uv_index_max?.[i] || 0);
            const windMax      = Math.round(weatherData.daily.wind_speed_10m_max?.[i] || 0);
            const daylightSecs = weatherData.daily.daylight_duration?.[i] || 0;
            const daylightH    = Math.floor(daylightSecs / 3600);
            const daylightM    = Math.floor((daylightSecs % 3600) / 60);
            const moon         = getMoonPhase(dateObj);
            const uvInfo       = getUVInfo(uvIndex);
            let sunriseTime    = '', sunsetTime = '';
            if (weatherData.daily.sunrise?.[i]) {
                sunriseTime = new Date(weatherData.daily.sunrise[i]).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
                sunsetTime  = new Date(weatherData.daily.sunset[i]).toLocaleTimeString('el-GR',  { hour: '2-digit', minute: '2-digit' });
            }
            return `
                <div style="background:linear-gradient(145deg,#ffffff 0%,#f0f4f8 100%);padding:16px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.08);border-top:3px solid ${i === 0 ? '#4facfe' : '#e0e0e0'};">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                        <div>
                            <div style="font-weight:700;color:#2c3e50;font-size:15px;">${i === 0 ? 'Today' : shortDay}</div>
                            <div style="font-size:10px;color:#64748b;margin-top:1px;">${desc}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:34px;line-height:1;">${icon}</div>
                            <div style="font-size:12px;margin-top:2px;" title="${moon.name}">${moon.icon}</div>
                        </div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <div>
                            <span style="font-size:22px;font-weight:800;color:#e53935;">${maxTemp}°</span>
                            <span style="font-size:14px;color:#64748b;margin-left:4px;">${minTemp}°</span>
                        </div>
                        <div style="text-align:right;font-size:11px;color:#64748b;line-height:1.6;">
                            ${precipProb > 0 ? `<div>💧 ${precipProb}%</div>` : ''}
                            ${precipSum  > 0 ? `<div>🌧️ ${precipSum.toFixed(1)} mm</div>` : ''}
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;padding-top:8px;border-top:1px solid #e8ecf0;font-size:10px;color:#64748b;line-height:1.8;">
                        <div>💨 ${windMax} km/h</div>
                        <div style="display:flex;align-items:center;gap:4px;">
                            <span style="background:${uvInfo.color};color:${uvInfo.textColor||'white'};padding:1px 5px;border-radius:8px;font-size:9px;font-weight:700;">UV ${uvIndex}</span>
                        </div>
                        ${sunriseTime ? `<div>🌅 ${sunriseTime}</div>` : ''}
                        ${sunsetTime  ? `<div>🌇 ${sunsetTime}</div>`  : ''}
                        ${daylightH   ? `<div style="grid-column:1/-1;">☀️ ${daylightH}h ${daylightM}m daylight</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            ${currentHTML}
            ${aqiHTML}
            ${hourlyChart}
            <h4 style="margin:0 0 12px 0;color:#2c3e50;font-size:15px;font-weight:700;letter-spacing:0.3px;">📅 5-Day Forecast</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:12px;">
                ${days}
            </div>
        `;
        console.log('[MMS Weather] Forecast displayed successfully');
    }

    // ----------------------------------------------------------------
    // Exports
    // ----------------------------------------------------------------
    window.initWeatherWidget             = initWeatherWidget;
    window.updateWeatherWidgetVisibility = updateWeatherWidgetVisibility;

})();
