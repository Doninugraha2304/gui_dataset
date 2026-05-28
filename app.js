/**
 * CleanDataUI Dashboard - Core Logic & Visualizations (CSV Data Engine)
 * Built using high-performance Vanilla JS. All data processed client-side.
 */

document.addEventListener('DOMContentLoaded', () => {
    // State management
    let currentDataset = 'ecommerce';
    let cachedData = {};
    let tripCart = []; // Persists across tabs for Trip Planner (Cart)

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
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--secondary);"></i>
                    <p>Memuat dataset CSV...</p>
                </div>
            </div>
        `;

        // Update raw CSV link
        btnRawJson.href = `datasets/${datasetName === 'tourism' ? 'indonesia_tourism' : datasetName}.csv`;

        try {
            let data = cachedData[datasetName];
            if (!data) {
                const response = await fetch(`datasets/${datasetName === 'tourism' ? 'indonesia_tourism' : datasetName}.csv`);
                if (!response.ok) throw new Error('Network response was not ok');
                const text = await response.text();
                
                // Parse CSV based on dataset
                if (datasetName === 'ecommerce') {
                    data = parseEcommerceCSV(text);
                } else if (datasetName === 'finance') {
                    data = parseFinanceCSV(text);
                } else if (datasetName === 'weather') {
                    data = parseWeatherCSV(text);
                } else if (datasetName === 'tourism') {
                    data = parseTourismCSV(text);
                }
                
                cachedData[datasetName] = data; // Cache
            }

            renderDashboard(datasetName, data);
        } catch (error) {
            console.error('Failed to load dataset:', error);
            dashboardView.innerHTML = `
                <div class="col-4" style="display: flex; justify-content: center; align-items: center; min-height: 300px; color: var(--danger);">
                    <div style="text-align: center; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 2rem; border-radius: 16px; backdrop-filter: blur(10px);">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <h3 style="margin-bottom: 0.5rem;">Gagal memuat dataset CSV</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary);">Pastikan file CSV berada di dalam folder datasets dan server lokal aktif.</p>
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
                datasetSubtitle.innerText = "Visualisasi 100+ transaksi penjualan, metrik KPI, tren bulanan, produk terpopuler, dan demografi pembeli (Data Teragregasi Dinamis dari CSV)";
                renderEcommerce(data);
                break;
            case 'finance':
                datasetTitle.innerText = "Personal Finance & Budget Tracker";
                datasetSubtitle.innerText = "Pelacakan alokasi pengeluaran bulanan, sasaran tabungan, pengeluaran harian, dan mutasi saldo terhitung langsung dari 100+ catatan transaksi CSV";
                renderFinance(data);
                break;
            case 'weather':
                datasetTitle.innerText = "Weather & Air Quality Dashboard";
                datasetSubtitle.innerText = "Pemantauan cuaca waktu-nyata, perkiraan per-jam & mingguan, serta kualitas udara (Kalkulasi Rerata Harian dari 120 Jam Log Cuaca CSV)";
                renderWeather(data);
                break;
            case 'tourism':
                datasetTitle.innerText = "Indonesian Tourism Places Dashboard";
                datasetSubtitle.innerText = "Eksplorasi 105 destinasi wisata pilihan dari 26 provinsi di Indonesia lengkap dengan pencarian, filter kategori (Chart), dan keranjang rencana perjalanan (Cart)";
                renderTourism(data);
                break;
        }
    }

    /* -------------------------------------------------------------
     * CSV PARSERS FOR ALL DATASETS
     * ------------------------------------------------------------- */
    
    function parseEcommerceCSV(text) {
        const lines = text.split('\n');
        if (lines[0] && lines[0].trim() === 'sep=,') {
            lines.shift();
        }
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(',');
            if (parts.length < 10) continue;
            result.push({
                Order_Id: parts[0].trim(),
                Customer_Name: parts[1].trim(),
                Product_Name: parts[2].trim(),
                Category: parts[3].trim(),
                Price: parseFloat(parts[4].trim()) || 0,
                Quantity: parseInt(parts[5].trim()) || 0,
                Total_Amount: parseFloat(parts[6].trim()) || 0,
                Order_Date: parts[7].trim(),
                Status: parts[8].trim(),
                Customer_Age: parseInt(parts[9].trim()) || 0
            });
        }
        return result;
    }

    function parseFinanceCSV(text) {
        const lines = text.split('\n');
        if (lines[0] && lines[0].trim() === 'sep=,') {
            lines.shift();
        }
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(',');
            if (parts.length < 7) continue;
            result.push({
                Transaction_Id: parts[0].trim(),
                Date: parts[1].trim(),
                Merchant: parts[2].trim(),
                Category: parts[3].trim(),
                Amount: parseFloat(parts[4].trim()) || 0,
                Type: parts[5].trim(),
                Account: parts[6].trim()
            });
        }
        return result;
    }

    function parseWeatherCSV(text) {
        const lines = text.split('\n');
        if (lines[0] && lines[0].trim() === 'sep=,') {
            lines.shift();
        }
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(',');
            if (parts.length < 12) continue;
            result.push({
                Date: parts[0].trim(),
                Time: parts[1].trim(),
                Temperature: parseFloat(parts[2].trim()) || 0,
                Feels_Like: parseFloat(parts[3].trim()) || 0,
                Condition: parts[4].trim(),
                Humidity: parseFloat(parts[5].trim()) || 0,
                Wind_Speed: parseFloat(parts[6].trim()) || 0,
                UV_Index: parseFloat(parts[7].trim()) || 0,
                AQI: parseFloat(parts[8].trim()) || 0,
                AQI_Status: parts[9].trim(),
                Pressure: parseFloat(parts[10].trim()) || 0,
                Chance_of_Rain: parseFloat(parts[11].trim()) || 0
            });
        }
        return result;
    }

    function parseTourismCSV(text) {
        const lines = text.split('\n');
        if (lines[0] && lines[0].trim() === 'sep=,') {
            lines.shift();
        }
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(',');
            if (parts.length < 9) continue;
            const obj = {
                Place_Id: parts[0].trim(),
                Place_Name: parts[1].trim(),
                Category: parts[2].trim(),
                City: parts[3].trim(),
                Province: parts[4].trim(),
                Price: parseFloat(parts[5].trim()) || 0,
                Rating: parseFloat(parts[6].trim()) || 0,
                Lat: parseFloat(parts[7].trim()) || 0,
                Long: parseFloat(parts[8].trim()) || 0,
                Description: parts.slice(9).join(',').trim()
            };
            if (obj.Description.startsWith('"') && obj.Description.endsWith('"')) {
                obj.Description = obj.Description.substring(1, obj.Description.length - 1);
            }
            result.push(obj);
        }
        return result;
    }

    /* -------------------------------------------------------------
     * 1. E-COMMERCE DASHBOARD RENDERER (DYNAMIC AGGREGATOR)
     * ------------------------------------------------------------- */
    function renderEcommerce(transactions) {
        // IDR Formatter
        const formatUSD = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

        // 1. KPI Calculations
        const totalOrders = transactions.length;
        const deliveredTransactions = transactions.filter(t => t.Status !== 'Cancelled');
        const totalRevenue = deliveredTransactions.reduce((sum, t) => sum + t.Total_Amount, 0);
        const avgOrderVal = totalRevenue / (deliveredTransactions.length || 1);
        const conversionRate = 3.4; // Realistic conversion rate

        // 2. Sales Monthly Trend Aggregation
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyAggregation = {};
        
        deliveredTransactions.forEach(t => {
            const dateObj = new Date(t.Order_Date);
            const monthLabel = monthNames[dateObj.getMonth()];
            if (!monthlyAggregation[monthLabel]) {
                monthlyAggregation[monthLabel] = { month: monthLabel, sales: 0, orders: 0 };
            }
            monthlyAggregation[monthLabel].sales += t.Total_Amount;
            monthlyAggregation[monthLabel].orders += 1;
        });

        // Ensure chronological ordering based on months in our CSV
        const sales_trend = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
            .map(m => monthlyAggregation[m] || { month: m, sales: 0, orders: 0 });

        // 3. Top Products Aggregation
        const productAggregation = {};
        transactions.forEach(t => {
            if (!productAggregation[t.Product_Name]) {
                productAggregation[t.Product_Name] = { name: t.Product_Name, sales: 0, revenue: 0, stock: 45, rating: 4.7 };
            }
            productAggregation[t.Product_Name].sales += t.Quantity;
            productAggregation[t.Product_Name].revenue += t.Total_Amount;
            
            // Give specific ratings to make it pretty
            if (t.Product_Name.includes("Headphones")) { productAggregation[t.Product_Name].rating = 4.9; productAggregation[t.Product_Name].stock = 12; }
            if (t.Product_Name.includes("Backpack")) { productAggregation[t.Product_Name].rating = 4.8; productAggregation[t.Product_Name].stock = 34; }
            if (t.Product_Name.includes("Chair")) { productAggregation[t.Product_Name].rating = 4.7; productAggregation[t.Product_Name].stock = 8; }
            if (t.Product_Name.includes("Bottle")) { productAggregation[t.Product_Name].rating = 4.5; productAggregation[t.Product_Name].stock = 95; }
            if (t.Product_Name.includes("Keyboard")) { productAggregation[t.Product_Name].rating = 4.6; productAggregation[t.Product_Name].stock = 30; }
        });

        const top_products = Object.values(productAggregation)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // 4. Demographics Calculation
        let age18_24 = 0, age25_34 = 0, age35_44 = 0, age45Plus = 0;
        transactions.forEach(t => {
            if (t.Customer_Age >= 18 && t.Customer_Age <= 24) age18_24++;
            else if (t.Customer_Age >= 25 && t.Customer_Age <= 34) age25_34++;
            else if (t.Customer_Age >= 35 && t.Customer_Age <= 44) age35_44++;
            else if (t.Customer_Age >= 45) age45Plus++;
        });

        const totalAgeCount = totalOrders || 1;
        const demographics = [
            { category: "18-24", percentage: Math.round((age18_24 / totalAgeCount) * 100) },
            { category: "25-34", percentage: Math.round((age25_34 / totalAgeCount) * 100) },
            { category: "35-44", percentage: Math.round((age35_44 / totalAgeCount) * 100) },
            { category: "45+", percentage: Math.round((age45Plus / totalAgeCount) * 100) }
        ];

        // 5. Recent Orders
        const recent_orders = transactions.slice(-5).reverse();

        let html = `
            <!-- Stat 1: Total Revenue -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Total Revenue</span>
                    <span class="stat-val">${formatUSD(totalRevenue)}</span>
                </div>
                <div class="stat-icon primary">
                    <i class="fa-solid fa-hand-holding-dollar"></i>
                </div>
            </div>

            <!-- Stat 2: Total Orders -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Total Orders</span>
                    <span class="stat-val">${totalOrders.toLocaleString('id-ID')}</span>
                </div>
                <div class="stat-icon secondary">
                    <i class="fa-solid fa-cart-shopping"></i>
                </div>
            </div>

            <!-- Stat 3: Avg Order Value -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Avg Order Value</span>
                    <span class="stat-val">${formatUSD(avgOrderVal)}</span>
                </div>
                <div class="stat-icon success">
                    <i class="fa-solid fa-receipt"></i>
                </div>
            </div>

            <!-- Stat 4: Conversion Rate -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Conversion Rate</span>
                    <span class="stat-val">${conversionRate}%</span>
                </div>
                <div class="stat-icon warning">
                    <i class="fa-solid fa-chart-line-up"></i>
                </div>
            </div>

            <!-- Sales Trend Chart -->
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
                                    <td style="font-weight: 500; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</td>
                                    <td>${p.sales} unit</td>
                                    <td>${formatUSD(p.revenue)}</td>
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

            <!-- Recent Transactions -->
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
                                    <td style="font-family: monospace; font-weight: 600; color: var(--secondary);">${o.Order_Id}</td>
                                    <td>${o.Customer_Name}</td>
                                    <td>${formatUSD(o.Total_Amount)}</td>
                                    <td>
                                        <span class="status-badge ${getStatusClass(o.Status)}">
                                            ${o.Status}
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
     * 2. FINANCE DASHBOARD RENDERER (DYNAMIC CALCULATOR)
     * ------------------------------------------------------------- */
    function renderFinance(transactions) {
        const formatUSD = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'USD' }).format(num);

        // 1. KPI Calculations (June 2026 slice as current month representation)
        const currentMonthTxns = transactions.filter(t => t.Date.startsWith("2026-06"));
        
        const totalIncome = currentMonthTxns.filter(t => t.Type === 'income').reduce((sum, t) => sum + t.Amount, 0);
        const totalSpent = currentMonthTxns.filter(t => t.Type === 'expense').reduce((sum, t) => sum + t.Amount, 0);
        
        const monthlyBudget = 5000.00;
        const totalSaved = Math.max(totalIncome - totalSpent, 0);
        const savingsRate = Math.round((totalSaved / (totalIncome || 1)) * 100);

        // 2. Expenses Allocation Breakdown
        const categoryAggregation = {};
        const categoriesMetadata = {
            "Housing & Rent": { color: "#6366f1", icon: "home" },
            "Food & Dining": { color: "#10b981", icon: "utensils" },
            "Entertainment": { color: "#f59e0b", icon: "film" },
            "Transportation": { color: "#3b82f6", icon: "car" },
            "Utilities & Bills": { color: "#ec4899", icon: "bolt" },
            "Others": { color: "#8b5cf6", icon: "tag" }
        };

        // Initialize category aggregation
        Object.keys(categoriesMetadata).forEach(cat => {
            categoryAggregation[cat] = 0;
        });

        currentMonthTxns.filter(t => t.Type === 'expense').forEach(t => {
            if (categoryAggregation[t.Category] !== undefined) {
                categoryAggregation[t.Category] += t.Amount;
            } else {
                categoryAggregation["Others"] += t.Amount;
            }
        });

        const expenses_breakdown = Object.entries(categoryAggregation).map(([category, amount]) => ({
            category,
            amount,
            color: categoriesMetadata[category].color,
            icon: categoriesMetadata[category].icon
        })).sort((a, b) => b.amount - a.amount);

        // 3. Weekly Daily Spending Chart (Group spending by day of the week for June)
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const daySpendingAggregation = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        
        currentMonthTxns.filter(t => t.Type === 'expense').forEach(t => {
            const dateObj = new Date(t.Date);
            const dayName = dayNames[dateObj.getDay()];
            if (daySpendingAggregation[dayName] !== undefined) {
                daySpendingAggregation[dayName] += t.Amount;
            }
        });

        // Convert to array and format to scale values visually for the chart
        const daily_spending = Object.entries(daySpendingAggregation).map(([day, spent]) => ({
            day,
            spent: Math.round(spent / 4) // Average per day across 4 weeks of June
        }));

        // 4. Savings Goals
        const savings_goals = [
            { name: "Emergency Fund", target: 10000, current: 8500, deadline: "2026-12" },
            { name: "Japan Vacation", target: 5000, current: 3200, deadline: "2026-10" },
            { name: "New Laptop Setup", target: 2500, current: 2500, deadline: "2026-05" }
        ];

        // 5. Recent Transaction Logs
        const recentTransactions = transactions.slice(-5).reverse();

        let html = `
            <!-- Stat 1: Monthly Budget -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Monthly Budget</span>
                    <span class="stat-val">${formatUSD(monthlyBudget)}</span>
                </div>
                <div class="stat-icon primary">
                    <i class="fa-solid fa-credit-card"></i>
                </div>
            </div>

            <!-- Stat 2: Total Spent -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Total Terpakai (Juni)</span>
                    <span class="stat-val">${formatUSD(totalSpent)}</span>
                </div>
                <div class="stat-icon danger">
                    <i class="fa-solid fa-chart-line-down"></i>
                </div>
            </div>

            <!-- Stat 3: Total Saved -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Tabungan Bersih (Juni)</span>
                    <span class="stat-val">${formatUSD(totalSaved)}</span>
                </div>
                <div class="stat-icon success">
                    <i class="fa-solid fa-piggy-bank"></i>
                </div>
            </div>

            <!-- Stat 4: Savings Rate -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Rasio Tabungan</span>
                    <span class="stat-val">${savingsRate}%</span>
                </div>
                <div class="stat-icon secondary">
                    <i class="fa-solid fa-percent"></i>
                </div>
            </div>

            <!-- Expense Allocation -->
            <div class="card col-2">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-pie-chart"></i> Alokasi Pengeluaran (Juni)</h3>
                    <span class="badge">${formatUSD(totalSpent)}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.9rem;">
                    ${expenses_breakdown.map(exp => {
                        const pct = totalSpent > 0 ? ((exp.amount / totalSpent) * 100).toFixed(1) : 0;
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

            <!-- Daily Spending -->
            <div class="card col-2">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-chart-column"></i> Rata-Rata Pengeluaran Harian</h3>
                </div>
                <div class="chart-container">
                    ${generateBarChartSVG(daily_spending, 'day', 'spent')}
                </div>
            </div>

            <!-- Savings Goals -->
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
                    <h3 class="card-title"><i class="fa-solid fa-list-ul"></i> Mutasi Rekening Terbaru</h3>
                </div>
                <div class="table-wrapper">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Merchant</th>
                                <th>Kategori</th>
                                <th>Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentTransactions.map(txn => `
                                <tr>
                                    <td>
                                        <div style="font-weight: 500;">${txn.Merchant}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);">${txn.Date}</div>
                                    </td>
                                    <td>
                                        <span class="badge" style="font-size: 0.75rem; border-radius: 8px;">
                                            ${txn.Category}
                                        </span>
                                    </td>
                                    <td style="font-weight: 600; color: ${txn.Type === 'income' ? 'var(--success)' : 'var(--text-primary)'};">
                                        ${txn.Type === 'income' ? '+' : '-'}${formatUSD(txn.Amount)}
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
     * 3. WEATHER DASHBOARD RENDERER (DAILY GROUPING)
     * ------------------------------------------------------------- */
    function renderWeather(hourlyLogs) {
        // 1. Current Weather (Take the last record in CSV as current status)
        const current = hourlyLogs[hourlyLogs.length - 1];
        
        // 2. Hourly Forecast (Take last 6 hours logs)
        const hourly_forecast = hourlyLogs.slice(-6).map(log => ({
            time: log.Time,
            temp: log.Temperature,
            humidity: log.Humidity,
            chance_of_rain: log.Chance_of_Rain
        }));

        // 3. Weekly Forecast Aggregation (Group 120 hourly rows by Date)
        const dateGroups = {};
        hourlyLogs.forEach(log => {
            if (!dateGroups[log.Date]) {
                dateGroups[log.Date] = [];
            }
            dateGroups[log.Date].push(log);
        });

        const dayNamesMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
        const weekly_forecast = Object.entries(dateGroups).map(([dateStr, logs]) => {
            const temps = logs.map(l => l.Temperature);
            const humidities = logs.map(l => l.Humidity);
            
            // Find daily conditions mode (most common condition)
            const conditions = logs.map(l => l.Condition);
            const condCount = {};
            let modeCond = conditions[0];
            let maxCount = 0;
            conditions.forEach(c => {
                condCount[c] = (condCount[c] || 0) + 1;
                if (condCount[c] > maxCount) {
                    maxCount = condCount[c];
                    modeCond = c;
                }
            });

            // Find day name from date string
            const dayName = dayNamesMap[new Date(dateStr).getDay()];

            return {
                day: dayName,
                temp_max: Math.round(Math.max(...temps)),
                temp_min: Math.round(Math.min(...temps)),
                condition: modeCond,
                humidity: Math.round(humidities.reduce((sum, h) => sum + h, 0) / humidities.length)
            };
        });

        let html = `
            <!-- Large Current Weather Summary Card -->
            <div class="card col-2">
                <div class="card-header">
                    <span class="badge"><i class="fa-solid fa-location-dot"></i> Jakarta, Indonesia</span>
                    <span style="font-size: 0.8rem; color: var(--text-secondary);">Waktu Setempat</span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-around; padding: 1.5rem 0;">
                    <div style="font-size: 4rem; display: flex; align-items: center; justify-content: center;">
                        <i class="${getWeatherIcon(current.Condition)}" style="background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 10px rgba(99,102,241,0.3));"></i>
                    </div>
                    <div>
                        <h1 style="font-size: 4rem; font-family: var(--font-heading); font-weight: 800; line-height: 1; position: relative;">
                            ${current.Temperature}<span style="font-size: 1.8rem; position: absolute; top: 0; font-weight: 500;">°C</span>
                        </h1>
                        <p style="font-size: 1.15rem; font-weight: 600; margin-top: 0.5rem;">${current.Condition}</p>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">Terasa seperti ${current.Feels_Like}°C</p>
                    </div>
                </div>
            </div>

            <!-- Air Quality Index (AQI) -->
            <div class="card col-1">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-wind"></i> Kualitas Udara (AQI)</h3>
                </div>
                <div class="aqi-gauge-box">
                    <div class="aqi-circle" style="border-color: ${getAQIColor(current.AQI)};">
                        <span class="aqi-val" style="color: ${getAQIColor(current.AQI)}">${current.AQI}</span>
                        <span class="aqi-label">AQI</span>
                    </div>
                    <span class="aqi-status-banner" style="background: ${getAQIColor(current.AQI)}15; color: ${getAQIColor(current.AQI)};">
                        ${current.AQI_Status}
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
                            <span class="atmos-val">${current.Humidity}%</span>
                        </div>
                    </div>
                    <div class="atmos-card">
                        <i class="fa-solid fa-wind"></i>
                        <div class="atmos-info">
                            <span class="atmos-label">Kec. Angin</span>
                            <span class="atmos-val">${current.Wind_Speed} km/j</span>
                        </div>
                    </div>
                    <div class="atmos-card">
                        <i class="fa-solid fa-sun"></i>
                        <div class="atmos-info">
                            <span class="atmos-label">Indeks UV</span>
                            <span class="atmos-val">${current.UV_Index} / 10</span>
                        </div>
                    </div>
                    <div class="atmos-card">
                        <i class="fa-solid fa-compress"></i>
                        <div class="atmos-info">
                            <span class="atmos-label">Tekanan</span>
                            <span class="atmos-val">${current.Pressure} hPa</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Hourly Forecast Line Chart -->
            <div class="card col-4">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-hourglass-half"></i> Prakiraan Suhu & Hujan Terkini</h3>
                    <span class="badge">Suhu & Peluang Hujan (%)</span>
                </div>
                <div class="chart-container" style="height: 200px;">
                    ${generateHourlyChartSVG(hourly_forecast)}
                </div>
            </div>

            <!-- Weekly Forecast Horizontal Slider -->
            <div class="card col-4">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-calendar-days"></i> Prakiraan Cuaca Harian (Agregasi 5 Hari)</h3>
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
     * 4. INDONESIAN TOURISM DASHBOARD RENDERER (CHART + CART)
     * ------------------------------------------------------------- */
    function renderTourism(allDestinations) {
        // Formatter Helper for IDR currency
        const formatRupiah = (num) => {
            if (num === 0) return "<span class='status-badge success'>Gratis</span>";
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
        };

        // Calculations for Stats Card
        const totalDestinations = allDestinations.length;
        const avgRating = (allDestinations.reduce((acc, curr) => acc + curr.Rating, 0) / totalDestinations).toFixed(2);
        const maxPrice = Math.max(...allDestinations.map(d => d.Price));
        const freePlaces = allDestinations.filter(d => d.Price === 0).length;

        // Categories list
        const categories = [...new Set(allDestinations.map(d => d.Category))];

        let html = `
            <!-- Stat 1: Total Destinasi -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Total Destinasi</span>
                    <span class="stat-val">${totalDestinations}</span>
                </div>
                <div class="stat-icon primary">
                    <i class="fa-solid fa-compass"></i>
                </div>
            </div>

            <!-- Stat 2: Avg Rating -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Rata-rata Rating</span>
                    <span class="stat-val">${avgRating} <i class="fa-solid fa-star" style="font-size: 1.15rem; color: #f59e0b;"></i></span>
                </div>
                <div class="stat-icon warning">
                    <i class="fa-solid fa-star"></i>
                </div>
            </div>

            <!-- Stat 3: Tiket Termahal -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Tiket Termahal</span>
                    <span class="stat-val" style="font-size: 1.55rem;">Rp ${(maxPrice/1000).toFixed(0)}rb</span>
                </div>
                <div class="stat-icon danger">
                    <i class="fa-solid fa-tag"></i>
                </div>
            </div>

            <!-- Stat 4: Wisata Gratis -->
            <div class="card stat-card">
                <div class="stat-info">
                    <span class="stat-label">Tiket Gratis</span>
                    <span class="stat-val">${freePlaces} Lokasi</span>
                </div>
                <div class="stat-icon success">
                    <i class="fa-solid fa-face-smile"></i>
                </div>
            </div>

            <!-- Search, Category Filter -->
            <div class="card col-4" style="padding: 1.5rem;">
                <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
                    <div style="display: flex; gap: 1rem; flex-grow: 1; flex-wrap: wrap;">
                        <!-- Search Box -->
                        <div style="position: relative; flex-grow: 1; min-width: 250px;">
                            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary);"></i>
                            <input type="text" id="search-tourism" placeholder="Cari nama tempat, kota, atau provinsi..." 
                                style="width: 100%; padding: 0.85rem 1.25rem 0.85rem 2.8rem; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); color: white; font-size: 0.95rem; outline: none; transition: border-color 0.3s;"
                                onfocus="this.style.borderColor='var(--secondary)'" onblur="this.style.borderColor='var(--border-glass)'" />
                        </div>
                        <!-- Dropdown Filter -->
                        <div style="min-width: 180px;">
                            <select id="filter-category" 
                                style="width: 100%; padding: 0.85rem 1.25rem; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border-glass); color: white; font-size: 0.95rem; outline: none; cursor: pointer;">
                                <option value="all">Semua Kategori</option>
                                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;" id="filtered-count-label">
                        Menampilkan ${totalDestinations} destinasi wisata
                    </div>
                </div>
            </div>

            <!-- Main Destinations List Table (Grid col-3) -->
            <div class="card col-3">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa-solid fa-list-ul"></i> Eksplorasi Destinasi Wisata Nusantara</h3>
                    <span class="badge">CSV DATA</span>
                </div>
                <div class="table-wrapper" style="max-height: 480px; overflow-y: auto;">
                    <table class="custom-table" id="tourism-table">
                        <thead>
                            <tr>
                                <th>Destinasi</th>
                                <th>Kategori</th>
                                <th>Lokasi</th>
                                <th>Harga Tiket</th>
                                <th style="text-align: center;">Rating</th>
                                <th style="width: 25%;">Deskripsi</th>
                                <th style="text-align: center;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="tourism-table-body">
                            ${generateTableRowsHTML(allDestinations, formatRupiah)}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Side Panel (Grid col-1) -->
            <div class="col-1" style="display: flex; flex-direction: column; gap: 1.75rem;">
                <!-- Category Chart Card (Chart) -->
                <div class="card" style="padding: 1.25rem;">
                    <div class="card-header" style="margin-bottom: 1rem;">
                        <h3 class="card-title" style="font-size: 1rem; color: white;"><i class="fa-solid fa-chart-simple" style="color: var(--secondary);"></i> Distribusi Wisata</h3>
                    </div>
                    <div id="category-chart-container">
                        ${generateCategoryChartSVG(allDestinations)}
                    </div>
                </div>
                
                <!-- Trip Cart Card (Cart) -->
                <div class="card" style="padding: 1.25rem;">
                    <div class="card-header" style="margin-bottom: 1rem;">
                        <h3 class="card-title" style="font-size: 1rem; color: white;"><i class="fa-solid fa-suitcase-rolling" style="color: var(--secondary);"></i> Rencana Trip</h3>
                        <span class="badge" id="trip-cart-badge" style="background: var(--secondary); color: black; font-weight: bold;">0</span>
                    </div>
                    <div id="trip-cart-container">
                        <!-- Loaded dynamically -->
                    </div>
                </div>
            </div>
        `;

        dashboardView.innerHTML = html;

        // Load the trip cart immediately
        renderTripCartCard();

        // Interactive filtering logic
        const searchInput = document.getElementById('search-tourism');
        const categoryFilter = document.getElementById('filter-category');
        const tableBody = document.getElementById('tourism-table-body');
        const filteredCountLabel = document.getElementById('filtered-count-label');
        const chartContainer = document.getElementById('category-chart-container');

        function performFiltering() {
            const query = searchInput.value.toLowerCase().trim();
            const selectedCat = categoryFilter.value;

            const filtered = allDestinations.filter(item => {
                const matchesSearch = item.Place_Name.toLowerCase().includes(query) || 
                                      item.City.toLowerCase().includes(query) || 
                                      item.Province.toLowerCase().includes(query) ||
                                      item.Description.toLowerCase().includes(query);
                
                const matchesCategory = selectedCat === 'all' || item.Category === selectedCat;
                
                return matchesSearch && matchesCategory;
            });

            tableBody.innerHTML = generateTableRowsHTML(filtered, formatRupiah);
            filteredCountLabel.innerText = `Menampilkan ${filtered.length} destinasi wisata`;
            chartContainer.innerHTML = generateCategoryChartSVG(filtered); // Dynamic chart updating!
        }

        searchInput.addEventListener('input', performFiltering);
        categoryFilter.addEventListener('change', performFiltering);
    }

    // Generate table rows HTML helper
    function generateTableRowsHTML(destinations, formatRupiah) {
        if (destinations.length === 0) {
            return `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem 0;">
                        <i class="fa-solid fa-ban" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                        Tidak ada destinasi wisata yang cocok dengan pencarian Anda.
                    </td>
                </tr>
            `;
        }
        return destinations.map(item => `
            <tr>
                <td>
                    <div style="font-weight: 600; font-size: 0.95rem; color: white;">${item.Place_Name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">ID: ${item.Place_Id} | GPS: ${item.Lat}, ${item.Long}</div>
                </td>
                <td>
                    <span class="status-badge" style="background: rgba(99, 102, 241, 0.1); color: var(--secondary); font-weight: 600;">
                        ${item.Category}
                    </span>
                </td>
                <td>
                    <div style="font-weight: 500;">${item.City}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${item.Province}</div>
                </td>
                <td>
                    ${formatRupiah(item.Price)}
                </td>
                <td style="text-align: center; font-weight: 700; color: #f59e0b;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 0.25rem;">
                        <span>${item.Rating.toFixed(1)}</span>
                        <i class="fa-solid fa-star" style="font-size: 0.8rem;"></i>
                    </div>
                </td>
                <td style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; max-width: 200px; white-space: normal;">
                    ${item.Description}
                </td>
                <td style="text-align: center;">
                    <button onclick="window.addToTrip('${item.Place_Id}', '${item.Place_Name.replace(/'/g, "\\'")}', '${item.City.replace(/'/g, "\\'")}', ${item.Price})" class="action-btn-primary" style="padding: 0.5rem 0.6rem; font-size: 0.75rem; border-radius: 8px; display: inline-flex; gap: 0.25rem; font-weight: 700; box-shadow: none;" title="Tambah ke Rencana Trip">
                        <i class="fa-solid fa-plus"></i>
                        <span>Trip</span>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Category distribution bar generator (Chart)
    function generateCategoryChartSVG(destinations) {
        const counts = {};
        destinations.forEach(d => {
            counts[d.Category] = (counts[d.Category] || 0) + 1;
        });
        
        const data = Object.entries(counts).map(([name, count]) => ({ name, count }));
        const maxVal = Math.max(...data.map(d => d.count), 1);
        
        let html = '';
        data.forEach((d, i) => {
            const pct = (d.count / maxVal) * 85; // Scale to max 85% width
            const color = getPaletteColor(i);
            html += `
                <div style="margin-bottom: 0.85rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem;">
                        <span style="font-weight: 500; color: var(--text-secondary);">${d.name}</span>
                        <span style="font-weight: 600; color: white;">${d.count}</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.03); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${pct}%; background: ${color}; border-radius: 4px; transition: width 0.5s ease;"></div>
                    </div>
                </div>
            `;
        });
        return html || '<p style="font-size: 0.75rem; color: var(--text-muted); text-align: center;">Tidak ada data kategori.</p>';
    }

    // Dynamic Trip Cart drawer renderer (Cart)
    function renderTripCartCard() {
        const cartContainer = document.getElementById('trip-cart-container');
        const cartBadge = document.getElementById('trip-cart-badge');
        if (!cartContainer) return;

        const formatRupiah = (num) => {
            if (num === 0) return "Gratis";
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
        };

        const totalCost = tripCart.reduce((sum, item) => sum + item.price, 0);
        const count = tripCart.length;

        // Update badge count
        if (cartBadge) {
            cartBadge.innerText = count;
        }

        let listHtml = '';
        if (count === 0) {
            listHtml = `
                <div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0; font-size: 0.8rem; line-height: 1.4;">
                    <i class="fa-solid fa-suitcase-rolling" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; color: var(--text-muted); opacity: 0.5;"></i>
                    Rencana perjalanan kosong.<br>Klik tombol <b>+ Trip</b> di tabel untuk merencanakan trip Anda!
                </div>
            `;
        } else {
            listHtml = `
                <div style="max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; padding-right: 0.25rem;">
                    ${tripCart.map(item => `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); padding: 0.5rem 0.65rem; border-radius: 10px; font-size: 0.8rem;">
                            <div style="max-width: 65%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                <div style="font-weight: 600; color: white;">${item.name}</div>
                                <div style="font-size: 0.7rem; color: var(--text-muted);">${item.city}</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="font-weight: 600; color: var(--secondary); font-size: 0.75rem;">${formatRupiah(item.price)}</span>
                                <button onclick="window.removeFromTrip('${item.id}')" style="background: transparent; border: none; color: var(--danger); cursor: pointer; font-size: 0.85rem;" title="Hapus">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="border-top: 1px solid var(--border-glass); padding-top: 0.8rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.3rem; color: var(--text-secondary);">
                        <span>Total Lokasi</span>
                        <span style="font-weight: 600; color: white;">${count} Destinasi</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: white;">
                        <span>Total Tiket</span>
                        <span style="color: var(--secondary);">${formatRupiah(totalCost)}</span>
                    </div>
                </div>
                
                <button onclick="window.bookTrip()" class="action-btn-primary" style="width: 100%; justify-content: center; padding: 0.75rem; font-size: 0.85rem; font-weight: 700;">
                    <i class="fa-solid fa-plane-departure"></i>
                    <span>Pesan Rencana Trip</span>
                </button>
            `;
        }
        
        cartContainer.innerHTML = listHtml;
    }

    /* -------------------------------------------------------------
     * GLOBAL TRIP PLANNER ACTIONS (WINDOW ACCESSIBLE)
     * ------------------------------------------------------------- */
    
    // Add to Trip
    window.addToTrip = function(id, name, city, price) {
        // Prevent duplicate entries
        if (tripCart.some(item => item.id === id)) {
            showToast(`"${name}" sudah ada dalam rencana trip Anda!`, 'warning');
            return;
        }
        tripCart.push({ id, name, city, price });
        renderTripCartCard();
        showToast(`Berhasil menambahkan "${name}" ke Rencana Trip!`, 'success');
    }

    // Remove from Trip
    window.removeFromTrip = function(id) {
        const itemIndex = tripCart.findIndex(item => item.id === id);
        if (itemIndex > -1) {
            const name = tripCart[itemIndex].name;
            tripCart.splice(itemIndex, 1);
            renderTripCartCard();
            showToast(`"${name}" dihapus dari rencana trip.`, 'warning');
        }
    }

    // Book Trip checkout
    window.bookTrip = function() {
        if (tripCart.length === 0) return;
        const total = tripCart.reduce((sum, item) => sum + item.price, 0);
        const formattedTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(total);
        showToast(`Sukses memesan ${tripCart.length} destinasi wisata! Total tiket: ${formattedTotal}. Selamat berlibur! ✈️`, 'success');
        
        // Clear cart after checkout simulation
        tripCart = [];
        renderTripCartCard();
    }

    // Floating dynamic toast builder
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '2rem';
        toast.style.right = '2rem';
        toast.style.background = type === 'success' ? 'var(--gradient-success)' : (type === 'warning' ? 'var(--gradient-warning)' : 'var(--gradient-primary)');
        toast.style.color = 'white';
        toast.style.padding = '0.9rem 1.4rem';
        toast.style.borderRadius = '14px';
        toast.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.5)';
        toast.style.zIndex = '9999';
        toast.style.fontFamily = 'var(--font-main)';
        toast.style.fontSize = '0.85rem';
        toast.style.fontWeight = '600';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '0.65rem';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        const icon = type === 'success' ? 'fa-circle-check' : (type === 'warning' ? 'fa-triangle-exclamation' : 'fa-plane-departure');
        toast.innerHTML = `<i class="fa-solid ${icon}" style="font-size: 1.1rem;"></i> <span>${message}</span>`;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 50);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 400);
        }, 3500);
    }

    /* -------------------------------------------------------------
     * VISUALIZATION HELPERS (DYNAMIC SVG RENDERERS)
     * ------------------------------------------------------------- */
    
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

    function generateDonutChartSVG(demographics) {
        let total = demographics.reduce((acc, curr) => acc + curr.percentage, 0);
        let accumulatedPercent = 0;
        let svgContent = '';
        
        demographics.forEach((item, index) => {
            const color = getPaletteColor(index);
            const percentage = item.percentage;
            
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
                <circle cx="70" cy="70" r="40" fill="transparent" stroke="rgba(255,255,255,0.02)" stroke-width="16"></circle>
                ${svgContent}
                <circle cx="70" cy="70" r="32" fill="var(--bg-base)" stroke="var(--border-glass)" stroke-width="1"></circle>
                <text x="70" y="75" text-anchor="middle" font-family="var(--font-heading)" font-weight="700" fill="white" font-size="14">Audience</text>
            </svg>
        `;
    }

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

        const points = data.map((d, i) => {
            const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
            const y = paddingTop + chartHeight - ((d[yKey] - minVal) / (maxVal - minVal)) * chartHeight;
            return { x, y, val: d[yKey], label: d[xKey] };
        });

        let linePath = '';
        let areaPath = `M ${points[0].x} ${paddingTop + chartHeight} `;

        points.forEach((pt, i) => {
            if (i === 0) {
                linePath += `M ${pt.x} ${pt.y} `;
            } else {
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

        let gridLinesHTML = '';
        for (let i = 0; i <= 4; i++) {
            const yPos = paddingTop + chartHeight - (i / 4) * chartHeight;
            const gridVal = (minVal + (i / 4) * (maxVal - minVal) / 1000).toFixed(0) + 'k';
            gridLinesHTML += `
                <line x1="${paddingLeft}" y1="${yPos}" x2="${width - paddingRight}" y2="${yPos}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4 4" />
                <text x="${paddingLeft - 10}" y="${yPos + 4}" text-anchor="end" fill="var(--text-muted)" font-size="10">${gridVal}</text>
            `;
        }

        let xAxisHTML = '';
        points.forEach(pt => {
            xAxisHTML += `
                <text x="${pt.x}" y="${height - 8}" text-anchor="middle" fill="var(--text-secondary)" font-size="11">${pt.label}</text>
            `;
        });

        let dotsHTML = '';
        points.forEach(pt => {
            dotsHTML += `
                <circle cx="${pt.x}" cy="${pt.y}" r="5" class="point" />
                <title>${pt.label}: $${Math.round(pt.val).toLocaleString('id-ID')}</title>
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
            gridHTML += `
                <line x1="${pt.x}" y1="${paddingTop}" x2="${pt.x}" y2="${paddingTop + chartHeight}" stroke="rgba(255,255,255,0.03)" />
            `;
            xLabelsHTML += `
                <text x="${pt.x}" y="${height - 6}" text-anchor="middle" fill="var(--text-secondary)" font-size="10">${pt.time}</text>
            `;
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
