import { serve } from "bun";

const PORT = process.env.PORT || 3000;
const EARTHMC_API_BASE = "https://api.earthmc.net/v3/aurora";

// Generic proxy handler for POST requests to EarthMC
const forwardPostRequest = (endpoint) => async (req) => {
    try {
        const body = await req.json();
        const response = await fetch(`${EARTHMC_API_BASE}/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    } catch (error) {
        console.error(`Error forwarding POST to /${endpoint}:`, {
            message: error.message,
        });
        return new Response(
            JSON.stringify({ error: `Failed to contact EarthMC API for /${endpoint}` }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        );
    }
};

const server = serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);
        const pathname = url.pathname;

        // CORS preflight
        if (req.method === "OPTIONS") {
            return new Response(null, {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }

        // Routes
        if (req.method === "POST") {
            if (pathname === "/api/players") return forwardPostRequest("players")(req);
            if (pathname === "/api/towns") return forwardPostRequest("towns")(req);
            if (pathname === "/api/nations") return forwardPostRequest("nations")(req);
            if (pathname === "/api/nearby") return forwardPostRequest("nearby")(req);
            if (pathname === "/api/quarters") return forwardPostRequest("quarters")(req);
            if (pathname === "/api/location") return forwardPostRequest("location")(req);
        }

        if (req.method === "GET") {
            if (pathname === "/api") {
                try {
                    const response = await fetch(`${EARTHMC_API_BASE}/`);
                    const data = await response.json();
                    return new Response(JSON.stringify(data), {
                        status: response.status,
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                        },
                    });
                } catch (error) {
                    return new Response(
                        JSON.stringify({ error: "Failed to fetch API data" }),
                        {
                            status: 500,
                            headers: {
                                "Content-Type": "application/json",
                                "Access-Control-Allow-Origin": "*",
                            },
                        }
                    );
                }
            }

            if (pathname === "/health") {
                return new Response(
                    JSON.stringify({ status: "ok", message: "Proxy running" }),
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                        },
                    }
                );
            }
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Bun proxy server running on port ${PORT}`);