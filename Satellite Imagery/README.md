# GROW-GDD-Tool

A web-based Growing Degree Days (GDD) tool with EOSDA weather API integration for crop protection and biological recommendations.

## Features
- Calculate Growing Degree Days (GDD) for any location and date range
- Fetch real-time and historical weather data from the EOSDA API
- Visualize GDD time series and growth stages with interactive charts
- Biological product recommendations based on pest and crop stage
- Node.js proxy server for secure API requests

## Setup
1. **Clone the repository:**
   ```sh
   git clone https://github.com/franzhentze92/GROW-GDD-Tool.git
   cd GROW-GDD-Tool
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure EOSDA API:**
   - Set your EOSDA API key in the proxy server (`ndvi-proxy.js`)
4. **Start the proxy server:**
   ```sh
   node ndvi-proxy.js
   ```
5. **Open the tool:**
   - Open `gdd-bootstrap.html` in your browser

## Usage
- Select your location and date range
- View GDD calculations and growth stage progress
- See recommended biological products for selected pests

## Project Structure
- `gdd-bootstrap.html` — Main web UI and logic
- `ndvi-proxy.js` — Node.js proxy server for EOSDA API
- `package.json` — Project dependencies

## Contact
For questions or support, contact Franz Hentze or open an issue on GitHub. 