import { initializeGemini, generateGeminiResponse } from './gemini';
import { initializeOpenAI, generateOpenAIResponse } from './openai';

export const initializeAI = () => {
    // Initialize both providers with their internal hardcoded keys
    initializeGemini();
    initializeOpenAI();
};

export const generateHybridResponse = async (prompt) => {
    // 1. Try Gemini Pro (Primary)
    try {
        console.log("🤖 Attempting Primary AI (Gemini Pro)...");
        const response = await generateGeminiResponse(prompt);

        // Check if response is valid (sometimes error handlers return an object with "Connection Error" text)
        // In our utils, we made them return { text: "Connection Error...", nodeId: null } on catch.
        // We need to distinguish between a "graceful error message" and a "throw" to trigger fallback.
        // Currently both utils catch errors and return a safe object. 
        // We should modify them or check the text content.

        if (response.text.includes("Connection Error") || response.text.includes("Gemini API Error")) {
            throw new Error("Gemini Graceful Failure: " + response.text);
        }

        return response;

    } catch (geminiError) {
        console.warn("⚠️ Primary AI Failed. Switching to Backup AI (OpenAI)...", geminiError);

        // 2. Try OpenAI (Backup)
        try {
            const response = await generateOpenAIResponse(prompt);
            // Append a small meta-tag for the user to know (optional, but helpful)
            return {
                ...response,
                text: response.text + "\n\n*(Generated via Backup AI)*"
            };
        } catch (openAIError) {
            console.error("❌ All AI providers failed.", openAIError);
            return {
                text: "CRITICAL FAILURE: I could not connect to Google Gemini OR OpenAI. Please check your API keys and network connection.",
                nodeId: null
            };
        }
    }
};
