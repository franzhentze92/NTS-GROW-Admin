const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

// Prevent server crashes on unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const PORT = 3001;

// EOSDA API configuration
const EOSDA_API_KEY = 'apk.95a092bdfdf721c1f721e3a611048643f3fe8c0071bd1a8e6529ea72f885f4fd';
const EOSDA_CONNECT_URL = 'https://api-connect.eos.com';

// The farm geometry is used by multiple endpoints
const yandinaFarmGeometry = {
    "type": "Polygon",
    "coordinates": [[
        [152.9148355104133, -26.49630785386763], [152.9149951437186, -26.49644491790693],
        [152.9150826047683, -26.49643498282219], [152.915136003929, -26.49647654096426],
        [152.9151679717066, -26.49641027369633], [152.9151522879532, -26.4963066956674],
        [152.9151405649811, -26.49617943071427], [152.9151330645278, -26.49603918146022],
        [152.9150405267262, -26.49598117140157], [152.9149028386955, -26.49619458038391],
        [152.9148355104133, -26.49630785386763]
    ]]
};

// Common headers for all requests
const getHeaders = () => {
    // Endpoints on api-connect.eos.com use 'x-api-key'
    return {
        'x-api-key': EOSDA_API_KEY,
        'Content-Type': 'application/json'
    };
};

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'EOSDA Proxy is running!', timestamp: new Date().toISOString() });
});

// Helper function for polling task status
async function pollTaskStatus(taskId) {
    let attempts = 0;
    const maxAttempts = 30; // Increased attempts
    const pollInterval = 10000; // 10 seconds

    while (attempts < maxAttempts) {
        attempts++;
        console.log(`Polling task ${taskId}, attempt ${attempts}...`);
        try {
            const response = await axios({
                method: 'get',
                url: `${EOSDA_CONNECT_URL}/api/gdw/api/${taskId}`,
                headers: getHeaders()
            });

            // Added more detailed logging to debug task status
            const taskStatus = response.data?.status?.toLowerCase();
            console.log(`Task status: ${taskStatus}, Response: ${JSON.stringify(response.data, null, 2)}`);

            if (taskStatus === 'finished' || taskStatus === 'done' || response.data.result_url) {
                console.log('Task completed successfully.');
                return response.data;
            } else if (taskStatus === 'failed' || taskStatus === 'error') {
                throw new Error(`Task failed: ${JSON.stringify(response.data)}`);
            }
            
            // If status is not a final state, continue polling
            console.log(`Task not finished. Waiting ${pollInterval / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, pollInterval));

        } catch (error) {
            console.error('Error polling task status:', error.response?.status, error.response?.data || error.message);
            // Retry on server errors
            if (error.response?.status >= 500) {
                console.log('Server error during polling, retrying...');
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                continue;
            }
            // Don't rethrow for client errors like 429, just continue polling loop
            if (error.response?.status >= 400) {
                 await new Promise(resolve => setTimeout(resolve, pollInterval));
                 continue;
            }
            throw error;
        }
    }
    throw new Error(`Task polling timed out after ${maxAttempts} attempts.`);
}

// Historical Weather
app.post('/fetch-historical-weather', async (req, res) => {
    try {
        const { date_start, date_end } = req.body;
        const url = `${EOSDA_CONNECT_URL}/api/cz/backend/forecast-history/?api_key=${EOSDA_API_KEY}`;
        const payload = { geometry: yandinaFarmGeometry, start_date: date_start, end_date: date_end };
        
        console.log('Fetching historical weather:', JSON.stringify(payload, null, 2));
        const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });

        const transformedData = response.data.map(day => {
            let humidity = 0;
            if (day.vapour_pressure) {
                const vapourPressure = parseFloat(day.vapour_pressure);
                const avgTemp = (parseFloat(day.temperature_min) + parseFloat(day.temperature_max)) / 2;
                const saturationVapourPressure = 6.1094 * Math.exp((17.625 * avgTemp) / (avgTemp + 243.04));
                humidity = Math.min(100, Math.max(0, (vapourPressure / saturationVapourPressure) * 100));
            }
            return {
                date: day.date,
                temperature_min: parseFloat(day.temperature_min),
                temperature_max: parseFloat(day.temperature_max),
                humidity: humidity.toFixed(1),
                rainfall: parseFloat(day.rainfall),
                wind_speed: parseFloat(day.wind_speed)
            };
        });

        res.json({ success: true, data: transformedData });
    } catch (error) {
        console.error('Historical Weather API error:', error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch historical weather', details: error.response?.data || error.message });
    }
});

// Search for Scenes
app.post('/fetch-scenes', async (req, res) => {
    try {
        const { date_start, date_end } = req.body;
        const url = `${EOSDA_CONNECT_URL}/api/lms/search/v2/sentinel2`;
        const payload = {
            search: {
                date: { from: date_start, to: date_end },
                shape: yandinaFarmGeometry
            },
            sort: { "cloudCoverage": "asc" },
            fields: ["sceneID", "cloudCoverage", "date", "view_id"],
            limit: 50
        };

        console.log('Fetching scenes with body:', JSON.stringify(payload, null, 2));
        const response = await axios.post(url, payload, { headers: getHeaders() });
        
        console.log('Scene search successful.');
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Scene Search API error:', error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).json({ success: false, error: true, message: 'Scene Search API error', details: error.response?.data });
    }
});

// Generic async task endpoint creator
async function createAndPollTask(res, payload) {
    try {
        const url = `${EOSDA_CONNECT_URL}/api/gdw/api`;
        console.log(`Creating task with payload:`, JSON.stringify(payload, null, 2));

        const createResponse = await axios.post(url, payload, { headers: getHeaders() });

        if (createResponse.status !== 202 || !createResponse.data.task_id) {
            throw new Error(`Failed to create task: ${JSON.stringify(createResponse.data)}`);
        }

        const taskId = createResponse.data.task_id;
        console.log(`Task created successfully with ID: ${taskId}`);

        const result = await pollTaskStatus(taskId);
        console.log(`Task ${taskId} finished. Result:`, result);

        // Handle different possible result structures
        if (result.result_url) {
            return res.json({ success: true, imageUrl: result.result_url });
        }
        if (result.result) {
            return res.json({ success: true, data: result.result });
        }
        return res.json({ success: true, data: result });

    } catch (error) {
        const errorMessage = error.message || 'Unknown error';
        console.error('Error during async task processing:', errorMessage);
        res.status(500).json({ success: false, error: 'Failed during async task processing', details: errorMessage });
    }
}

// Fetch NDVI Image
app.post('/fetch-ndvi-image', (req, res) => {
    const { view_id } = req.body;
    if (!view_id) {
        return res.status(400).json({ success: false, error: 'view_id is required' });
    }
    const payload = {
        type: "jpeg",
        params: {
            view_id: view_id,
            bm_type: "NDVI",
            geometry: yandinaFarmGeometry,
            px_size: 10,
            format: "png",
            colormap: "a9bc6eceeef2a13bb88a7f641dca3aa0",
            levels: "-1.0,1.0",
            reference: `ndvi_image_${Date.now()}`,
            calibrate: 1
        }
    };
    createAndPollTask(res, payload);
});

// Fetch Vegetation Indices
app.post('/fetch-vegetation-indices', (req, res) => {
    const { date_start, date_end } = req.body;
    const payload = {
        type: "mt_stats",
        params: {
            bm_type: ["NDVI", "EVI", "SAVI"],
            date_start: date_start.split('T')[0],
            date_end: date_end.split('T')[0],
            geometry: yandinaFarmGeometry,
            reference: `vegetation_indices_${Date.now()}`,
            sensors: ["sentinel2"]
        }
    };
    createAndPollTask(res, payload);
});

// Fetch Soil Moisture
app.post('/fetch-soil-moisture', (req, res) => {
    const { date_start, date_end } = req.body;
    const payload = {
        type: "mt_stats",
        params: {
            bm_type: "soilmoisture",
            date_start: date_start.split('T')[0],
            date_end: date_end.split('T')[0],
            geometry: yandinaFarmGeometry,
            reference: `soil_moisture_${Date.now()}`,
            sensors: ["soilmoisture"]
        }
    };
    createAndPollTask(res, payload);
});

// 14-Day Weather Forecast
app.post('/fetch-14-day-forecast', async (req, res) => {
    try {
        const url = `${EOSDA_CONNECT_URL}/api/forecast/weather/forecast/?api_key=${EOSDA_API_KEY}`;
        const payload = { geometry: yandinaFarmGeometry };

        console.log('Fetching 14-day forecast:', JSON.stringify(payload, null, 2));
        const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
        
        console.log('14-day forecast successful.');
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('14-day Forecast API error:', error.response?.status, error.response?.data);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch 14-day forecast', details: error.response?.data || error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`EOSDA Proxy server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop the other process or change the port.`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});