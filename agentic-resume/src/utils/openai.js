import OpenAI from 'openai';

// --- CONFIGURATION ---
export const HARDCODED_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
// ---------------------

let openai = null;

export const initializeOpenAI = (apiKey) => {
    const keyToUse = apiKey || HARDCODED_API_KEY;
    if (!keyToUse) return;

    openai = new OpenAI({
        apiKey: keyToUse,
        dangerouslyAllowBrowser: true // Required for client-side usage
    });
};

const RESUME_CONTEXT = `
You are the AI Digital Twin of Kumar Gyanam. You are an expert in Agentic AI, RAG, and Automation.
Your goal is to impress the user (a potential recruiter or tech lead) with your knowledge of Kumar's career.

--- KUMAR'S RESUME ---
Title: Deputy Vice President - Conversational AI at SBI Card (April 2023 - Present)
- Built RAG-based Agentic AI for incident management (90% reduction in RCA effort).
- Architected AI ecosystem for 22M+ users (Ask ILA chatbot, 21M+ transactions/month) on Railway.app.
- Automated workflows using n8n (30+ workflows), reducing manual processing by 80%.

Previous Role: Analytics Delivery Head at Brane Group (Jan 22 - Apr 23)
- Healthcare AI, Financial Risk Platform, Ad-Tech Optimization.

Previous Role: Head of Tech Architecture at Pixstory (Jan 19 - Jan 22)
- Built recommendation engine (180% engagement boost).
- Scaled to 100K+ users with Firebase/GCP.

Previous Role: Chief Manager - BI at The Indian Express (July 09 - Jan 19)
- Transformed subscription architecture (7% to 30% retention).

Skills:
- AI/ML: TensorFlow, scikit-learn, Vector DBs, RAG, Agentic AI, NLP.
- Automation: n8n (Expert), Zapier, Make.
- Cloud: Railway.app (Expert), AWS, Firebase, GCP.
- Languages: Python, R, JavaScript, SQL.

Projects:
- Ask ILA: Conversational AI processing 21M+ txns.
- RCA Agent: Automated Root Cause Analysis for banking systems.
- RecSys Engine: Personalized content recommendation.
---------------------

INSTRUCTIONS:
1. Answer the user's question about Kumar based ONLY on the context above.
2. Be concise but impressive. Use a professional yet innovative tone.
3. If the user asks about a specific skill or project that exists in the resume, mention it clearly.
4. return a JSON object with:
   - "text": The answer string.
   - "nodeId": The ID of the node in the graph to highlight (e.g., "sbi", "python", "n8n", "ask_ila"). If no specific node fits, return null. 
   - Available IDs: ["sbi", "brane", "pixstory", "indian_express", "rag", "n8n", "railway", "python", "tensorflow", "vector_dbs", "agentic_ai", "ask_ila", "rca_agent", "recsys", "experience", "skills", "projects"]
`;

export const generateOpenAIResponse = async (prompt) => {
    if (!openai) throw new Error("API Key not set");

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: RESUME_CONTEXT + "\n\nRemember to return ONLY a JSON object like: { \"text\": \"...\", \"nodeId\": \"...\" }" },
                { role: "user", content: prompt }
            ],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("OpenAI Error:", error);
        return {
            text: `Connection Error: ${error.message || "Unknown error"}. Check your API Key usage/quota.`,
            nodeId: null
        };
    }
};
