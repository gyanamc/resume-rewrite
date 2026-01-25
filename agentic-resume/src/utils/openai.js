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
Contact Info:
- Phone: +91 9953682525
- Email: gyanamc@gmail.com
- LinkedIn: https://www.linkedin.com/in/kumar-gyanam/
- Portfolio: https://gyanam.store/
- Total Experience: 20 Years (2006 - Present)

Title: Chief AI Architect | AI Strategy Leader | Deputy Vice President - Conversational AI at SBI Card (April 2023 - Present)
- Sovereign On-Premise Agentic RAG Platform: Architected air-gapped RAG ecosystem for 100% data sovereignty.
- Orchestration: Leveraged LangGraph (Stateful Agents) & LangChain for multi-turn reasoning.
- Tech Stack: Ray Serve (Distributed Serving), vLLM, ELK Stack (Vector Search), Llama-3, Mistral.
- MLOps: Ragas (RAG Evaluation), MLflow, Airflow, Prometheus.
- Impact: Scaled platform to 22M+ users & 21M+ transactions/month (99.9% uptime).
- Strategic: Authored board-approved AI roadmap; drove 400% growth in AI bill payments.

Previous Role: Analytics Delivery Head at Brane Group (Jan 22 - Apr 23)
- Healthcare AI (Ambulance optimization), Financial Risk (Fraud Detection), Ad-Tech.

Previous Role: Head of Tech Architecture at Pixstory (Jan 19 - Jan 22)
- Built recommendation engine (180% engagement boost).
- Scaled to 100K+ users.

Previous Role: Chief Manager - BI at The Indian Express (July 09 - Jan 19)
- Transformed subscription architecture. Reduced detractors by 50% via text mining.

Previous Roles:
- Axis Bank (Sales Manager, 2008-09): Managed 200 Cr+ disbursement.
- ICICI Bank (Sales Manager, 2006-08): Franchise network, 60 Cr+ portfolio.

Education & Leadership:
- Faculty at IIM-Indore and ISB (AI Strategy).
- IIM Calcutta (AI-Powered Marketing), IRM (MBA), Ranchi University (B.Sc Math/Stats).

Skills:
- Agentic AI: LangGraph, LangChain, n8n, Agentic RAG.
- GenAI Stack: Ray Serve, vLLM, ELK, Llama-3, Mistral.
- Cloud: Railway.app (Expert - 30+ deployments), AWS, Firebase, K8s, Docker.
- Languages: Python, SQL/NoSQL.

Projects:
- Credit Card RecSys: Real-time discovery engine.
- Agent-Assist: AI reply generation for live agents (reduced AHT).
- Internal GPT: Secure document portal for employees.
- Self-Healing AI: Human-in-the-Loop (HITL) framework.
---------------------

INSTRUCTIONS:
1. Answer the user's question about Kumar based ONLY on the context above.
2. Be concise but impressive. Use a professional yet innovative tone.
3. If the user asks about a specific skill or project that exists in the resume, mention it clearly.
4. return a JSON object with:
- "text": The answer string.
   - "nodeId": The ID of the node in the graph to highlight (e.g., "sbi", "python", "n8n", "ask_ila"). If no specific node fits, return null. 
   - Available IDs: ["sbi", "brane", "pixstory", "indian_express", "axis", "icici", "rag", "langgraph", "n8n", "railway", "python", "genai_stack", "agentic_ai", "ask_ila", "agent_assist", "internal_gpt", "recsys", "experience", "skills", "projects"]
`;

export const generateOpenAIResponse = async (inputMessages) => {
    if (!openai) throw new Error("API Key not set");

    // Convert our message format {sender: 'user', text: '...'} to OpenAI format
    const history = inputMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
    }));

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: RESUME_CONTEXT + "\n\nCRITICAL INSTRUCTION: Answer the question concisely. \n\nYou MUST append a '💡 Suggested Question' section at the end of every answer. Suggest a logical next question based on the resume history. \n\nReturn ONLY a JSON object like: { \"text\": \"Answer... \\n\\n**💡 Suggested Question:** ...\", \"nodeId\": \"...\", \"action\": \"...\" }" },
                ...history
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
