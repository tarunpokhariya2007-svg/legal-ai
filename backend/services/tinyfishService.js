const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;

if (!TINYFISH_API_KEY) {
    console.warn(
        "TINYFISH_API_KEY is not configured. TinyFish features will be unavailable."
    );
}

/**
 * Search the live web using TinyFish.
 *
 * This function is intentionally isolated from the agents so
 * the rest of Nyaya AI does not need to know TinyFish API details.
 */
async function tinyFishSearch(query) {
    if (!TINYFISH_API_KEY) {
        throw new Error("TinyFish API key is not configured.");
    }

    const response = await fetch(
        "https://agent.tinyfish.ai/api/search",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": TINYFISH_API_KEY,
            },
            body: JSON.stringify({
                query,
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `TinyFish Search failed (${response.status}): ${errorText}`
        );
    }

    return await response.json();
}

module.exports = {
    tinyFishSearch,
};