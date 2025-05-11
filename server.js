const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/api/players", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.earthmc.net/v3/aurora/players",
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error forwarding POST request:", error.message);
    res.status(500).json({ error: "Failed to contact EarthMC API" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
