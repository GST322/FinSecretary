const axios = require('axios');

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const API_URL = 'https://api.tavily.com/search';

if (!TAVILY_API_KEY) {
    console.error("TAVILY_API_KEY environment variable not set on the server.");
}

/**
 * Performs a web search using Tavily API.
 * @param {string} query The search query.
 * @returns {Promise<Array<{title: string, url: string, content: string}>>} A list of search results.
 */
async function performSearch(query) {
    if (!TAVILY_API_KEY) {
        throw new Error("Tavily search service is not configured on the server. Please set TAVILY_API_KEY.");
    }
    console.log(`[Search Service] Performing search for: "${query}"`);
    try {
        const response = await axios.post(API_URL, {
            api_key: TAVILY_API_KEY,
            query: query,
            search_depth: "basic",
            include_answer: false,
            max_results: 5
        });
        
        // Tavily returns results in `response.data.results`
        return response.data.results || [];
    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error(`Error calling Tavily API:`, errorMsg);
        throw new Error(`Failed to get response from Tavily Search API: ${errorMsg}`);
    }
}

module.exports = { performSearch };
