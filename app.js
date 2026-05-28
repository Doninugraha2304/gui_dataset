/**
 * CleanDataUI Dashboard - Core Logic & Visualizations
 * Built using high-performance Vanilla JS.
 */

document.addEventListener('DOMContentLoaded', () => {
    // State management
    let currentDataset = 'ecommerce';
    let cachedData = {};

    // Dom Elements
    const navButtons = document.querySelectorAll('.nav-btn');
    const dashboardView = document.getElementById('dashboard-view');
    const datasetTitle = document.getElementById('dataset-title');
    const datasetSubtitle = document.getElementById('dataset-subtitle');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnRawJson = document.getElementById('btn-raw-json');

    // Init App
    loadDashboard(currentDataset);

    // Event Listeners for Sidebar Tabs
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetBtn = e.currentTarget;
            if (targetBtn.classList.contains('active')) return;

            // Update Active Class
            document.querySelector('.nav-btn.active').classList.remove('active');
            targetBtn.classList.add('active');

            // Switch Dataset
            currentDataset = targetBtn.dataset.dataset;
            loadDashboard(currentDataset);
        });
    });

    // Refresh Button Event
    btnRefresh.addEventListener('click', () => {
        // Add spin animation class
        const icon = btnRefresh.querySelector('i');
        icon.style.transition = 'transform 0.8s ease';
        icon.style.transform = 'rotate(360deg)';
        
        // Reset rotation after transition
        setTimeout(() => {
            icon.style.transition = 'none';
            icon.style.transform = 'rotate(0deg)';
        }, 800);

        // Clear cache and reload
        delete cachedData[currentDataset];
        loadDashboard(currentDataset);
    });

    // Main loading routine
    async function loadDashboard(datasetName) {
        dashboardView.innerHTML = `
            <div class="col-4" style="display: flex; justify-content: center; align-items: center; min-height: 300px; color: var(--text-secondary);">
                <div style="text-align: center;">
                    <i class="fa-solid fa-spinner-third fa-spin" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--secondary);"></i>
                    <p>Memuat dataset...</p>
                </div>
            </div>
        `;

        // Update raw JSON link
        btnRawJson.href = `datasets/${datasetName}.json`;

        try {
            let data = cachedData[datasetName];
            if (!data) {
                const response = await fetch(`datasets/${datasetName}.json`);
                if (!response.ok) throw new Error('Network response was not ok');
                data = await response.json();
                cachedData[datasetName] = data; // Cache
            }

            renderDashboard(datasetName, data);
        } catch (error) {
            console.error('Failed to load dataset:', error);
            dashboardView.innerHTML = `
                <div class="col-4" style="display: flex; justify-content: center; align-items: center; min-height: 300px; color: var(--danger);">
                    <div style="text-align: center; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 2rem; border-radius: 16px; backdrop-filter: blur(10px);">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <h3 style="margin-bottom: 0.5rem;">Gagal memuat dataset</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary);">Pastikan Anda menjalankan aplikasi menggunakan web server lokal (seperti npm run dev atau Live Server).</p>
                    </div>
                </div>
            `;
        }
    }

    // Router for rendering dashboards
    function renderDashboard(name, data) {
        switch (name) {
            case 'ecommerce':
                datasetTitle.innerText = "E-Commerce Sales Dashboard";
                datasetSubtitle.innerText = "Visualisasi metrik penjualan bulanan, produk terlaris, demografi pembeli, dan status order terbaru";
                renderEcommerce(data);
                break;
            case 'finance':
                datasetTitle.innerText = "Personal Finance & Budget Tracker";
                datasetSubtitle.innerText = "Pelacakan alokasi pengeluaran, sasaran tabungan, pengeluaran harian, dan mutasi saldo";
                renderFinance(data);
                break;
            case 'weather':
                datasetTitle.innerText = "Weather & Air Quality Dashboard";
                datasetSubtitle.innerText = "Pemantauan cuaca waktu-nyata, prakiraan per-jam & mingguan, serta kualitas udara (AQI)";
                renderWeather(data);
                break;
        }
    }

    /* -------------------------------------------------------------
     * 1. E-COMMERCE DASHBOARD RENDERER
     * ------------------------------------------------------------- */
    function renderEcommerce(data) {
        const { summary, sales_trend, top_products, demographics, recent_orders } = data;

        // Formatter Helper
        const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

        let html = `
            <!-- Stat 1: Total Revenue -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Total Revenue</span>
                    <span class="stat-val">${formatIDR(summary.total_revenue)}</span>
                </div>
                <div class="stat-icon primary">
                    <i class="fa-solid fa-hand-holding-dollar"></i>
                </div>
            </div>

            <!-- Stat 2: Total Orders -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Total Orders</span>
                    <span class="stat-val">${summary.total_orders.toLocaleString('id-ID')}</span>
                </div>
                <div class="stat-icon secondary">
                    <i class="fa-solid fa-cart-shopping"></i>
                </div>
            </div>

            <!-- Stat 3: Avg Order Value -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Avg Order Value</span>
                    <span class="stat-val">${formatIDR(summary.average_order_value)}</span>
                </div>
                <div class="stat-icon success">
                    <i class="fa-solid fa-receipt"></i>
                </div>
            </div>

            <!-- Stat 4: Conversion Rate -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Conversion Rate</span>
                    <span class="stat-val">${summary.conversion_rate}%</span>
                </div>
                <div class="stat-icon warning">
                    <i class="fa-solid fa-chart-line-up"></i>
                </div>
            </div>

            <!-- Sales Trend Chart (SVG Line Chart) -->
            <div class="card col-3">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-chart-area"></i> Revenue Trend (H1)</h3>
                    <span class="badge">USD</span>
                </div>
                <div class="chart-container" id="revenue-chart-container">
                    ${generateLineChartSVG(sales_trend, 'month', 'sales')}
                </div>
            </div>

            <!-- Demographics Pie Chart -->
            <div class="card col-1">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-users"></i> Demografi Usia</h3>
                </div>
                <div class="flex-row-center">
                    <div class="pie-chart-box">
                        ${generateDonutChartSVG(demographics)}
                    </div>
                    <div class="pie-chart-legend">
                        ${demographics.map((d, i) => `
                            <div class="legend-item">
                                <span class="legend-color" style="background-color: ${getPaletteColor(i)};"></span>
                                <span class="legend-text" style="font-size: 0.75rem; color: var(--text-secondary);">${d.category} (${d.percentage}%)</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Top Selling Products -->
            <div class="card col-2">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-star"></i> Produk Terlaris</h3>
                </div>
                <div class="table-wrapper">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Produk</th>
                                <th>Sales</th>
                                <th>Revenue</th>
                                <th>Stok</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${top_products.map(p => `
                                <tr>
                                    <td style="font-weight: 500;">${p.name}</td>
                                    <td>${p.sales} unit</td>
                                    <td>${formatIDR(p.revenue)}</td>
                                    <td>
                                        <span class="status-badge ${p.stock < 15 ? 'danger' : 'success'}">
                                            ${p.stock}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Recent Orders Table -->
            <div class="card col-2">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-receipt"></i> Transaksi Terbaru</h3>
                </div>
                <div class="table-wrapper">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Pelanggan</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recent_orders.map(o => `
                                <tr>
                                    <td style="font-family: monospace; font-weight: 600; color: var(--secondary);">${o.id}</td>
                                    <td>${o.customer}</td>
                                    <td>${formatIDR(o.total)}</td>
                                    <td>
                                        <span class="status-badge ${getStatusClass(o.status)}">
                                            ${o.status}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        dashboardView.innerHTML = html;
    }

    /* -------------------------------------------------------------
     * 2. FINANCE DASHBOARD RENDERER
     * ------------------------------------------------------------- */
    function renderFinance(data) {
        const { summary, expenses_breakdown, savings_goals, daily_spending, transactions } = data;
        const formatUSD = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'USD' }).format(num);

        let html = `
            <!-- Stat 1: Monthly Budget -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Monthly Budget</span>
                    <span class="stat-val">${formatUSD(summary.monthly_budget)}</span>
                </div>
                <div class="stat-icon primary">
                    <i class="fa-solid fa-credit-card"></i>
                </div>
            </div>

            <!-- Stat 2: Total Spent -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Total Terpakai</span>
                    <span class="stat-val">${formatUSD(summary.total_spent)}</span>
                </div>
                <div class="stat-icon danger">
                    <i class="fa-solid fa-chart-line-down"></i>
                </div>
            </div>

            <!-- Stat 3: Total Saved -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Total Ditabung</span>
                    <span class="stat-val">${formatUSD(summary.total_saved)}</span>
                </div>
                <div class="stat-icon success">
                    <i class="fa-solid fa-piggy-bank"></i>
                </div>
            </div>

            <!-- Stat 4: Savings Rate -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Rasio Tabungan</span>
                    <span class="stat-val">${summary.savings_rate}%</span>
                </div>
                <div class="stat-icon secondary">
                    <i class="fa-solid fa-percent"></i>
                </div>
            </div>

            <!-- Expense Allocation (Custom Categories list with Progress bars) -->
            <div class="card col-2">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-pie-chart"></i> Alokasi Pengeluaran</h3>
                    <span class="badge">${formatUSD(summary.total_spent)}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.9rem;">
                    ${expenses_breakdown.map(exp => {
                        const pct = ((exp.amount / summary.total_spent) * 100).toFixed(1);
                        return `
                            <div class="progress-container">
                                <div class="progress-header">
                                    <span class="progress-name" style="color: var(--text-primary);">
                                        <i class="fa-solid fa-${getCategoryIcon(exp.icon)}" style="color: ${exp.color}; width: 20px;"></i>
                                        ${exp.category}
                                    </span>
                                    <span class="progress-percent" style="font-weight: 600;">${formatUSD(exp.amount)} (${pct}%)</span>
                                </div>
                                <div class="progress-bar-bg">
                                    <div class="progress-bar-fill" style="width: ${pct}%; background: ${exp.color};"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Daily Spending (SVG Bar Chart) -->
            <div class="card col-2">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-chart-column"></i> Pengeluaran Mingguan</h3>
                </div>
                <div class="chart-container">
                    ${generateBarChartSVG(daily_spending, 'day', 'spent')}
                </div>
            </div>

            <!-- Savings Goals (Progress cards) -->
            <div class="card col-2">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-bullseye"></i> Target Tabungan</h3>
                </div>
                <div style="display: flex; flex-direction: column; gap: 1rem; justify-content: center; height: calc(100% - 2.5rem);">
                    ${savings_goals.map(goal => {
                        const pct = Math.min(((goal.current / goal.target) * 100).toFixed(0), 100);
                        return `
                            <div class="progress-container" style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); padding: 1rem; border-radius: 14px;">
                                <div class="progress-header">
                                    <span class="progress-name" style="font-weight: 600;">${goal.name}</span>
                                    <span class="progress-percent" style="color: var(--secondary); font-weight: bold;">
                                        ${formatUSD(goal.current)} / ${formatUSD(goal.target)}
                                    </span>
                                </div>
                                <div class="progress-bar-bg" style="height: 10px; margin: 0.5rem 0;">
                                    <div class="progress-bar-fill" style="width: ${pct}%; background: var(--gradient-primary);"></div>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
                                    <span>Tingkat pencapaian: ${pct}%</span>
                                    <span>Tenggat: ${goal.deadline}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Transactions Log -->
            <div class="card col-2">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-list-ul"></i> Mutasi Rekening</h3>
                </div>
                <div class="table-wrapper">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Keterangan / Merchant</th>
                                <th>Kategori</th>
                                <th>Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transactions.map(txn => `
                                <tr>
                                    <td>
                                        <div style="font-weight: 500;">${txn.merchant}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);">${txn.date}</div>
                                    </td>
                                    <td>
                                        <span class="badge" style="font-size: 0.75rem; border-radius: 8px;">
                                            ${txn.category}
                                        </span>
                                    </td>
                                    <td style="font-weight: 600; color: ${txn.type === 'income' ? 'var(--success)' : 'var(--text-primary)'};">
                                        ${txn.type === 'income' ? '+' : '-'}${formatUSD(txn.amount)}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        dashboardView.innerHTML = html;
    }

    /* -------------------------------------------------------------
     * 3. WEATHER & AQI DASHBOARD RENDERER
     * ------------------------------------------------------------- */
    function renderWeather(data) {
        const { location, current, hourly_forecast, weekly_forecast } = data;

        let html = `
            <!-- Large Current Weather Summary Card -->
            <div class="card col-2">
                <div class="card-header">
                    <span class="badge"><i class="fa-solid fa-location-dot"></i> ${location.city}, ${location.country}</span>
                    <span style="font-size: 0.8rem; color: var(--text-secondary);">${location.timezone}</span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-around; padding: 1.5rem 0;">
                    <div style="font-size: 4rem; display: flex; align-items: center; justify-content: center;">
                        <i class="${getWeatherIcon(current.condition)}" style="background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 10px rgba(99,102,241,0.3));"></i>
                    </div>
                    <div>
                        <h1 style="font-size: 4rem; font-family: var(--font-heading); font-weight: 800; line-height: 1; position: relative;">
                            ${current.temperature}<span style="font-size: 1.8rem; position: absolute; top: 0; font-weight: 500;">°C</span>
                        </h1>
                        <p style="font-size: 1.15rem; font-weight: 600; margin-top: 0.5rem;">${current.condition}</p>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">Terasa seperti ${current.feels_like}°C</p>
                    </div>
                </div>
            </div>

            <!-- Air Quality Index (AQI) Circular Gauge -->
            <div class="card col-1">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-wind"></i> Kualitas Udara (AQI)</h3>
                </div>
                <div class="aqi-gauge-box">
                    <div class="aqi-circle" style="border-color: ${getAQIColor(current.air_quality_idx)};">
                        <span class="aqi-val" style="color: ${getAQIColor(current.air_quality_idx)}">${current.air_quality_idx}</span>
                        <span class="aqi-label">AQI</span>
                    </div>
                    <span class="aqi-status-banner" style="background: ${getAQIColor(current.air_quality_idx)}15; color: ${getAQIColor(current.air_quality_idx)};">
                        ${current.air_quality_status}
                    </span>
                </div>
            </div>

            <!-- Atmospheric Metrics Card -->
            <div class="card col-1">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-gauge"></i> Parameter Udara</h3>
                </div>
                <div class="atmospheric-grid">
                    <div class="atmos-card">
                        <i class="fa-solid fa-droplet"></i>
                        <div class="atmos-info">
                            <span class="atmos-label">Kelembaban</span>
                            <span class="atmos-val">${current.humidity}%</span>
                        </div>
                    </div>
                    <div class="atmos-card">
                        <i class="fa-solid fa-wind"></i>
                        <div class="atmos-info">
                            <span class="atmos-label">Kec. Angin</span>
                            <span class="atmos-val">${current.wind_speed} km/j</span>
                        </div>
                    </div>
                    <div class="atmos-card">
                        <i class="fa-solid fa-sun"></i>
                        <div class="atmos-info">
                            <span class="atmos-label">Indeks UV</span>
                            <span class="atmos-val">${current.uv_index} / 10</span>
                        </div>
                    </div>
                    <div class="atmos-card">
                        <i class="fa-solid fa-compress"></i>
                        <div class="atmos-info">
                            <span class="atmos-label">Tekanan</span>
                            <span class="atmos-val">${current.pressure} hPa</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Hourly Forecast Line Chart -->
            <div class="card col-4">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-hourglass-half"></i> Prakiraan Suhu & Hujan Per Jam</h3>
                    <span class="badge">Suhu & Peluang Hujan (%)</span>
                </div>
                <div class="chart-container" style="height: 200px;">
                    ${generateHourlyChartSVG(hourly_forecast)}
                </div>
            </div>

            <!-- Weekly Forecast Horizontal Slider -->
            <div class="card col-4">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-calendar-days"></i> Prakiraan Cuaca 7 Hari Depan</h3>
                </div>
                <div class="forecast-list">
                    ${weekly_forecast.map(w => `
                        <div class="forecast-item">
                            <span class="forecast-day">${w.day}</span>
                            <span class="forecast-icon">
                                <i class="${getWeatherIcon(w.condition)}" style="color: var(--secondary);"></i>
                            </span>
                            <span class="forecast-temp">${w.temp_max}°<span>${w.temp_min}°</span></span>
                            <span style="font-size: 0.7rem; color: var(--text-muted);"><i class="fa-solid fa-droplet" style="font-size: 0.65rem;"></i> ${w.humidity}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        dashboardView.innerHTML = html;
    }

    /* -------------------------------------------------------------
     * VISUALIZATION HELPERS (DYNAMIC SVG RENDERERS)
     * ------------------------------------------------------------- */
    
    // palette for demographics donut chart
    function getPaletteColor(index) {
        const colors = [
            'hsl(250, 85%, 65%)', // Purple
            'hsl(190, 90%, 50%)', // Cyan
            'hsl(150, 80%, 45%)', // Emerald
            'hsl(35, 90%, 55%)'   // Amber
        ];
        return colors[index % colors.length];
    }

    function getCategoryIcon(name) {
        // Safe mapping
        return name || 'tag';
    }

    function getStatusClass(status) {
        if (!status) return '';
        switch(status.toLowerCase()) {
            case 'delivered':
            case 'completed':
            case 'income':
                return 'success';
            case 'processing':
            case 'shipped':
                return 'warning';
            case 'cancelled':
            case 'expense':
                return 'danger';
            default:
                return '';
        }
    }

    function getWeatherIcon(cond) {
        if (!cond) return 'fa-solid fa-cloud';
        switch (cond.toLowerCase()) {
            case 'sunny': return 'fa-solid fa-sun';
            case 'cloudy': return 'fa-solid fa-cloud';
            case 'partly cloudy': return 'fa-solid fa-cloud-sun';
            case 'showers':
            case 'scattered showers':
                return 'fa-solid fa-cloud-showers-heavy';
            case 'thunderstorm': return 'fa-solid fa-cloud-bolt';
            default: return 'fa-solid fa-cloud';
        }
    }

    function getAQIColor(aqi) {
        if (aqi <= 50) return '#10b981'; // Good (Green)
        if (aqi <= 100) return '#f59e0b'; // Moderate (Amber)
        return '#ef4444'; // Unhealthy (Red)
    }

    // Dynamic Donut Chart Generator
    function generateDonutChartSVG(demographics) {
        let total = demographics.reduce((acc, curr) => acc + curr.percentage, 0);
        let accumulatedPercent = 0;
        let svgContent = '';
        
        demographics.forEach((item, index) => {
            const color = getPaletteColor(index);
            const percentage = item.percentage;
            
            // Calculate stroke-dasharray parameters
            // Circumference of circle with r=40 is 2 * PI * 40 = 251.3
            const circumference = 251.3;
            const strokeDash = (percentage / total) * circumference;
            const strokeOffset = circumference - ((accumulatedPercent / total) * circumference);
            
            svgContent += `
                <circle cx="70" cy="70" r="40" 
                    fill="transparent" 
                    stroke="${color}" 
                    stroke-width="16" 
                    stroke-dasharray="${strokeDash} ${circumference - strokeDash}" 
                    stroke-dashoffset="${strokeOffset}" 
                    transform="rotate(-90 70 70)"
                    style="transition: stroke-dashoffset 1s ease-in-out;">
                </circle>
            `;
            accumulatedPercent += percentage;
        });

        return `
            <svg width="100%" height="100%" viewBox="0 0 140 140" class="svg-chart">
                <!-- Outer glow shadow background -->
                <circle cx="70" cy="70" r="40" fill="transparent" stroke="rgba(255,255,255,0.02)" stroke-width="16"></circle>
                ${svgContent}
                <!-- Inner hole -->
                <circle cx="70" cy="70" r="32" fill="var(--bg-base)" stroke="var(--border-glass)" stroke-width="1"></circle>
                <!-- Centered Label -->
                <text x="70" y="75" text-anchor="middle" font-family="var(--font-heading)" font-weight="700" fill="white" font-size="14">Audience</text>
            </svg>
        `;
    }

    // Dynamic Line Chart (Revenue Trend) Generator
    function generateLineChartSVG(data, xKey, yKey) {
        const width = 600;
        const height = 200;
        const paddingLeft = 40;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 30;

        const maxVal = Math.max(...data.map(d => d[yKey])) * 1.15;
        const minVal = 0;

        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        // Map data points to SVG coordinates
        const points = data.map((d, i) => {
            const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
            const y = paddingTop + chartHeight - ((d[yKey] - minVal) / (maxVal - minVal)) * chartHeight;
            return { x, y, val: d[yKey], label: d[xKey] };
        });

        // Construct Polyline/Path points
        let linePath = '';
        let areaPath = `M ${points[0].x} ${paddingTop + chartHeight} `;

        points.forEach((pt, i) => {
            if (i === 0) {
                linePath += `M ${pt.x} ${pt.y} `;
            } else {
                // Bezier curve approximation
                const prev = points[i - 1];
                const cp1x = prev.x + (pt.x - prev.x) / 2;
                const cp1y = prev.y;
                const cp2x = prev.x + (pt.x - prev.x) / 2;
                const cp2y = pt.y;
                linePath += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y} `;
            }
            areaPath += `L ${pt.x} ${pt.y} `;
        });

        areaPath += `L ${points[points.length - 1].x} ${paddingTop + chartHeight} Z`;

        // Render Grid Lines & Labels
        let gridLinesHTML = '';
        for (let i = 0; i <= 4; i++) {
            const yPos = paddingTop + chartHeight - (i / 4) * chartHeight;
            const gridVal = (minVal + (i / 4) * (maxVal - minVal) / 1000).toFixed(0) + 'k';
            gridLinesHTML += `
                <line x1="${paddingLeft}" y1="${yPos}" x2="${width - paddingRight}" y2="${yPos}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4 4" />
                <text x="${paddingLeft - 10}" y="${yPos + 4}" text-anchor="end" fill="var(--text-muted)" font-size="10">${gridVal}</text>
            `;
        }

        // X Axis Labels
        let xAxisHTML = '';
        points.forEach(pt => {
            xAxisHTML += `
                <text x="${pt.x}" y="${height - 8}" text-anchor="middle" fill="var(--text-secondary)" font-size="11">${pt.label}</text>
            `;
        });

        // Hover points
        let dotsHTML = '';
        points.forEach(pt => {
            dotsHTML += `
                <circle cx="${pt.x}" cy="${pt.y}" r="5" class="point" />
                <title>${pt.label}: $${pt.val.toLocaleString('id-ID')}</title>
            `;
        });

        return `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="overflow: visible;">
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--secondary)" stop-opacity="0.3" />
                        <stop offset="100%" stop-color="var(--secondary)" stop-opacity="0.0" />
                    </linearGradient>
                </defs>
                ${gridLinesHTML}
                ${xAxisHTML}
                <path d="${areaPath}" fill="url(#areaGradient)" />
                <path d="${linePath}" fill="none" stroke="var(--secondary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 10px rgba(6, 182, 212, 0.3));" />
                ${dotsHTML}
            </svg>
        `;
    }

    // Dynamic Bar Chart (Daily Spending) Generator
    function generateBarChartSVG(data, xKey, yKey) {
        const width = 500;
        const height = 200;
        const paddingLeft = 40;
        const paddingRight = 10;
        const paddingTop = 20;
        const paddingBottom = 30;

        const maxVal = Math.max(...data.map(d => d[yKey])) * 1.15;
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        const barWidth = (chartWidth / data.length) * 0.6;
        const gap = (chartWidth / data.length) * 0.4;

        let barsHTML = '';
        let xAxisHTML = '';
        let gridHTML = '';

        // Y Grid & axis
        for (let i = 0; i <= 4; i++) {
            const yPos = paddingTop + chartHeight - (i / 4) * chartHeight;
            const gridVal = '$' + ( (i / 4) * maxVal ).toFixed(0);
            gridHTML += `
                <line x1="${paddingLeft}" y1="${yPos}" x2="${width - paddingRight}" y2="${yPos}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4 4" />
                <text x="${paddingLeft - 10}" y="${yPos + 4}" text-anchor="end" fill="var(--text-muted)" font-size="10">${gridVal}</text>
            `;
        }

        data.forEach((d, i) => {
            const xPos = paddingLeft + (i * (barWidth + gap)) + gap/2;
            const barHeight = (d[yKey] / maxVal) * chartHeight;
            const yPos = paddingTop + chartHeight - barHeight;

            // Generate beautifully rounded column bars
            barsHTML += `
                <rect x="${xPos}" y="${yPos}" width="${barWidth}" height="${barHeight}" 
                    rx="6" ry="6" fill="url(#barGradient)" 
                    style="transition: all 0.3s ease; cursor: pointer;">
                    <title>${d[xKey]}: $${d[yKey]}</title>
                </rect>
            `;

            xAxisHTML += `
                <text x="${xPos + barWidth/2}" y="${height - 8}" text-anchor="middle" fill="var(--text-secondary)" font-size="11">${d[xKey]}</text>
            `;
        });

        return `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="overflow: visible;">
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--secondary)" />
                        <stop offset="100%" stop-color="var(--primary)" />
                    </linearGradient>
                </defs>
                ${gridHTML}
                ${barsHTML}
                ${xAxisHTML}
            </svg>
        `;
    }

    // Dynamic Weather Temperature + Rain Probability Chart
    function generateHourlyChartSVG(hourlyData) {
        const width = 700;
        const height = 150;
        const paddingLeft = 40;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 30;

        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        const maxTemp = Math.max(...hourlyData.map(d => d.temp)) + 2;
        const minTemp = Math.min(...hourlyData.map(d => d.temp)) - 2;

        const points = hourlyData.map((d, i) => {
            const x = paddingLeft + (i / (hourlyData.length - 1)) * chartWidth;
            const y = paddingTop + chartHeight - ((d.temp - minTemp) / (maxTemp - minTemp)) * chartHeight;
            return { x, y, temp: d.temp, time: d.time, rain: d.chance_of_rain };
        });

        let tempPath = '';
        points.forEach((pt, i) => {
            if (i === 0) tempPath += `M ${pt.x} ${pt.y} `;
            else {
                const prev = points[i-1];
                const cpx1 = prev.x + (pt.x - prev.x)/2;
                const cpx2 = prev.x + (pt.x - prev.x)/2;
                tempPath += `C ${cpx1} ${prev.y}, ${cpx2} ${pt.y}, ${pt.x} ${pt.y} `;
            }
        });

        let gridHTML = '';
        let xLabelsHTML = '';
        let nodesHTML = '';

        points.forEach((pt, i) => {
            // Grid lines
            gridHTML += `
                <line x1="${pt.x}" y1="${paddingTop}" x2="${pt.x}" y2="${paddingTop + chartHeight}" stroke="rgba(255,255,255,0.03)" />
            `;
            
            // X-Axis hours
            xLabelsHTML += `
                <text x="${pt.x}" y="${height - 6}" text-anchor="middle" fill="var(--text-secondary)" font-size="10">${pt.time}</text>
            `;

            // Node temperature tags + Rain chance labels
            nodesHTML += `
                <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="var(--secondary)" stroke="var(--bg-base)" stroke-width="2" />
                <text x="${pt.x}" y="${pt.y - 8}" text-anchor="middle" fill="white" font-weight="700" font-size="9">${pt.temp}°C</text>
                <text x="${pt.x}" y="${paddingTop + chartHeight + 12}" text-anchor="middle" fill="rgba(6, 182, 212, 0.75)" font-size="9">${pt.rain}% <i class="fa-solid fa-droplet"></i></text>
            `;
        });

        return `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="overflow: visible;">
                ${gridHTML}
                <path d="${tempPath}" fill="none" stroke="var(--gradient-warning)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="stroke: #f59e0b; filter: drop-shadow(0 2px 8px rgba(245,158,11,0.4));" />
                ${xLabelsHTML}
                ${nodesHTML}
            </svg>
        `;
    }
});
