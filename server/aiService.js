const axios = require('axios');
const { performSearch } = require('./searchService');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/chat/completions';

if (!DEEPSEEK_API_KEY) {
    console.error("DEEPSEEK_API_KEY environment variable not set on the server.");
}

const deepseekClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    }
});

const webSearchTool = {
    type: "function",
    function: {
        name: "web_search",
        description: "Searches the web for up-to-date information on a given topic. Use this for recent events, news, or any topic requiring current data.",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "The search query to find information about."
                }
            },
            required: ["query"]
        }
    }
};

/**
 * Gets financial advice from the DeepSeek AI based on user query, financial context, and mode.
 * @param {string} userQuery The user's question.
 * @param {object} context The user's financial data.
 * @param {'chat' | 'search'} mode The mode of operation.
 * @returns {Promise<{text: string, sources: Array}>} The AI's response.
 */
async function getAIAdvice(userQuery, context, mode) {
    if (!DEEPSEEK_API_KEY) {
        throw new Error("DeepSeek AI service is not configured on the server. Please set DEEPSEEK_API_KEY.");
    }
    console.log(`[AI Service] Calling DeepSeek in '${mode}' mode...`);

    const financialState = JSON.stringify(context, null, 2);
    let systemPrompt = '';
    const messages = [];
    
    if (mode === 'chat') {
        systemPrompt = `You are an expert financial secretary for a Russian user. Your analysis must be precise, data-driven, and insightful. Always respond in Russian. This is the user's current financial state. Use it as the primary context for all your answers: \n\`\`\`json\n${financialState}\n\`\`\``;
    } else { // 'search' mode
        systemPrompt = `You are a helpful research assistant. Your goal is to answer the user's question by searching the web. When you use the web_search tool, analyze the results and provide a comprehensive answer in Russian, citing your sources.`;
    }

    messages.push({ "role": "system", "content": systemPrompt });
    messages.push({ "role": "user", "content": userQuery });

    try {
        const initialPayload = {
            model: 'deepseek-chat',
            messages: messages,
            stream: false
        };

        if (mode === 'search') {
            initialPayload.tools = [webSearchTool];
            initialPayload.tool_choice = "auto";
        }

        const initialResponse = await deepseekClient.post('', initialPayload);
        const message = initialResponse.data.choices[0].message;

        // Check if the model wants to call a tool
        if (message.tool_calls && message.tool_calls.length > 0) {
            console.log('[AI Service] Model requested a tool call.');
            messages.push(message); // Add AI's tool call request to history

            const toolCall = message.tool_calls[0];
            if (toolCall.function.name === 'web_search') {
                const args = JSON.parse(toolCall.function.arguments);
                const searchResults = await performSearch(args.query);

                const formattedResults = searchResults.map(r => ({ title: r.title, url: r.url, snippet: r.content }));

                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(formattedResults),
                });
                
                console.log('[AI Service] Sending search results back to the model for summarization.');

                // Make a second call with the tool results
                const finalResponse = await deepseekClient.post('', {
                    model: 'deepseek-chat',
                    messages: messages,
                    stream: false
                });

                const text = finalResponse.data.choices[0].message.content;
                const sources = searchResults.map(r => ({ title: r.title, uri: r.url }));

                return { text, sources };
            }
        }

        // If no tool call, just return the direct response
        console.log('[AI Service] No tool call requested. Returning direct response.');
        const text = message.content;
        return { text, sources: [] };

    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error(`Error calling DeepSeek in '${mode}' mode:`, errorMsg);
        throw new Error(`Failed to get response from DeepSeek API: ${errorMsg}`);
    }
}

/**
 * Calculates the financial health score using the DeepSeek AI.
 * @param {object} context The user's financial data.
 * @returns {Promise<{score: number, summary: string}>} The calculated score and summary.
 */
async function getFinancialHealthScore(context) {
    if (!DEEPSEEK_API_KEY) {
        throw new Error("DeepSeek AI service is not configured on the server. Please set DEEPSEEK_API_KEY.");
    }
    console.log('[AI Service] Calling DeepSeek for financial health score...');
    const financialState = JSON.stringify(context, null, 2);

    const prompt = `
You are a financial analyst AI. Your task is to calculate a "Financial Health Score" from 0 to 100 based on the user's financial data. You must also provide a short, one- or two-sentence summary in Russian explaining the score.

Consider these factors for the score:
- Savings rate: Compare income vs. savings/investments.
- Budget adherence: How much of the monthly budget is spent? Is there overspending?
- Asset allocation: Is there a mix of assets (savings, brokerage)?
- Recent transactions: Are there large, unusual expenses? Are income streams regular?

Here is the user's financial data:
\`\`\`json
${financialState}
\`\`\`

Your response MUST be a valid JSON object with NO additional text or markdown formatting. The JSON object must have two keys: "score" (a number) and "summary" (a string). Example: {"score": 78, "summary": "Ваш сберегательный рейтинг высок, но расходы на развлечения превышают бюджет."}
`;

    try {
        const response = await deepseekClient.post('', {
            model: 'deepseek-chat',
            messages: [
                { "role": "system", "content": "You are a helpful assistant that only responds with a single, valid JSON object based on the user's prompt." },
                { "role": "user", "content": prompt }
            ],
            stream: false,
            response_format: { type: "json_object" } // Request JSON output
        });

        // The response content is expected to be a string that is a valid JSON.
        const jsonResponse = JSON.parse(response.data.choices[0].message.content);
        
        if (typeof jsonResponse.score !== 'number' || typeof jsonResponse.summary !== 'string') {
             throw new Error("AI returned JSON with incorrect schema.");
        }

        return {
            score: jsonResponse.score,
            summary: jsonResponse.summary,
        };
    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error('Error calling DeepSeek for health score:', errorMsg);
        throw new Error(`Failed to get health score from DeepSeek API: ${errorMsg}`);
    }
}

module.exports = { getAIAdvice, getFinancialHealthScore };