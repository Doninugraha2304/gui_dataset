# CleanDataUI — Indonesian Datasets & Dashboard Visualizer

A premium, modern glassmorphism web dashboard demonstrating beautifully clean and pre-structured datasets for front-end developers. Specifically designed to showcase clean data structures and native SVG-based dynamic visualizations with zero third-party library dependencies.

## 📊 Datasets Included

This repository contains high-quality, pre-cleaned datasets ready for immediate integration in UI/UX projects:

1. **Indonesian Tourism Destinations (`datasets/indonesia_tourism.csv`)**
   * **Size:** 105 rows (records) of premium tourist spots across 26 provinces.
   * **Columns:** `Place_Id`, `Place_Name`, `Category`, `City`, `Province`, `Price` (IDR), `Rating`, `Lat`, `Long`, `Description`.
   * **Ideal for:** Interactive maps, filtering sliders, classification badges, and rating stars.
   
2. **E-Commerce & Sales (`datasets/ecommerce.json`)**
   * **Contents:** Overall summary, sales trends, top product margins, demographics, and real-time order logs.
   * **Ideal for:** Admin dashboards, Bezier line charts, and donut charts.

3. **Personal Finance (`datasets/finance.json`)**
   * **Contents:** Budget allocations, category expenses (with recommended colors and icons), savings goal indicators, and transaction books.
   * **Ideal for:** Financial planning trackers, category progress bars, and column bar charts.

4. **Weather & Air Quality (`datasets/weather.json`)**
   * **Contents:** Real-time metrics (humidity, wind speed, UV index, atmospheric pressure), hourly forecasts, weekly forecasts, and Air Quality Index (AQI) values.
   * **Ideal for:** Mobile weather widgets and radial gauge metrics.

---

## 🚀 How to Run Locally

Because modern browsers block local HTTP requests (`fetch`) from the `file://` protocol due to CORS security policies, you must serve this folder using a local web server:

### Option A: Using Node.js / NPX
```bash
npx live-server
```

### Option B: Using Python (Mac/Linux default)
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080` in your web browser.

---

## 🎨 Designed by Antigravity
Built with raw HTML5, custom Vanilla CSS HSL tokens, and lightweight Vanilla JS DOM manipulations.
