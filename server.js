const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const EARTHMC_API_BASE = "https://api.earthmc.net/v3/aurora";

// Generic proxy handler for POST requests to EarthMC
const forwardPostRequest = (endpoint) => async (req, res) => {
    try {
        const response = await axios.post(`${EARTHMC_API_BASE}/${endpoint}`, req.body, {
            headers: { "Content-Type": "application/json" },
            timeout: 10000
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(`Error forwarding POST to /${endpoint}:`, {
            message: error.message,
            data: error.response?.data,
            status: error.response?.status,
        });
        res.status(500).json({ error: `Failed to contact EarthMC API for /${endpoint}` });
    }
};

// Routes
app.post("/api/players", forwardPostRequest("players"));
app.post("/api/towns", forwardPostRequest("towns"));
app.post("/api/nations", forwardPostRequest("nations"));
app.post("/api/nearby", forwardPostRequest("nearby"));
app.post("/api/quarters", forwardPostRequest("quarters"));
app.post("/api/location", forwardPostRequest("location"));

app.get("/api", async (req, res) => {
    try {
        const response = await axios.get(`${EARTHMC_API_BASE}/`);
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch towns data" });
    }
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Proxy running" });
});


// Localhost route for testing
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
