
import React, { useState, useEffect } from 'react';
import GraphBackground from './components/GraphBackground';
import ChatInterface from './components/ChatInterface';
import resumeData from './data/resumeData.json';
import { initializeAI, generateHybridResponse } from './utils/ai';
import ReactGA from "react-ga4";

const App = () => {
  const [activeNode, setActiveNode] = useState(null);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I am Kumar's AI Digital Twin. I run on a Hybrid Architecture (Gemini Pro + OpenAI Backup) to ensure 100% uptime.\n\nAsk me about his Agentic AI experience or specific projects!" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    initializeAI();

    // Initialize Analytics
    const gaId = import.meta.env.VITE_GA_ID;
    if (gaId) {
      ReactGA.initialize(gaId);
      ReactGA.send({ hitType: "pageview", page: window.location.pathname });
      console.log("📊 Analytics Initialized");
    }
  }, []);

  const handleSendMessage = async (text) => {
    // Analytics Event using optional chaining in case GA isn't init
    if (import.meta.env.VITE_GA_ID) {
      ReactGA.event({
        category: "Chat",
        action: "User Sent Message",
        label: text.substring(0, 50) // Track first 50 chars for privacy/context
      });
    }

    // User Message
    const updatedMessages = [...messages, { sender: 'user', text }];
    setMessages(updatedMessages);
    setIsTyping(true);

    // Simulate thinking delay
    try {
      if (text.length > 0) {
        // Use Hybrid AI with History
        const response = await generateHybridResponse(updatedMessages);
        setIsTyping(false);
        setMessages(prev => [...prev, { sender: 'bot', text: response.text }]);
        if (response.nodeId) setActiveNode(response.nodeId);

        // Handle Actions
        if (response.action) {
          console.log("🚀 Executing Action:", response.action);
          setTimeout(() => {
            switch (response.action) {
              case 'open_linkedin': window.open('https://www.linkedin.com/in/kumar-gyanam/', '_blank'); break;
              case 'open_github': window.open('https://github.com/gyanamc', '_blank'); break;
              case 'open_portfolio': window.open('https://gyanam.store', '_blank'); break;
              case 'call_phone': window.open('tel:+919953682525'); break;
              case 'email_me': window.open('mailto:gyanamc@gmail.com'); break;
              case 'download_resume':
                const link = document.createElement('a');
                link.href = '/resume.pdf';
                link.download = 'Kumar_Gyanam_Resume.pdf';
                link.click();
                break;
            }
          }, 1500); // 1.5s delay so user reads message first
        }
      } else {
        // Fallback to local logic if text is empty (though UI should prevent this)
        setTimeout(() => {
          const response = generateLocalResponse(text); // Renamed old function
          setIsTyping(false);
          setMessages(prev => [...prev, { sender: 'bot', text: response.text }]);
          if (response.nodeId) setActiveNode(response.nodeId);
        }, 800);
      }
    } catch (e) {
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: "Error connecting to Agent. Try checking your API Key." }]);
    }
  };

  const generateLocalResponse = (input) => {
    const lowerInput = input.toLowerCase();

    // 1. Check for specific nodes
    const nodes = resumeData.nodes;
    // Sort by length desc to match longest node names first "Conversational AI" vs "AI"
    const sortedNodes = [...nodes].sort((a, b) => b.name.length - a.name.length);

    for (const node of sortedNodes) {
      if (lowerInput.includes(node.name.toLowerCase())) {
        return {
          text: `Analyzing node[${node.name}]... \n\n${node.desc || "This is a key competency in my graph."} `,
          nodeId: node.id
        };
      }
    }

    // 2. Keyword matching
    if (lowerInput.includes('experience') || lowerInput.includes('work')) {
      return { text: "I have extensive experience at SBI Card, Brane Group, Pixstory, and The Indian Express. Which role interests you?", nodeId: 'experience' };
    }
    if (lowerInput.includes('skill') || lowerInput.includes('tech')) {
      return { text: "My stack includes Conversational AI, RAG, n8n, Python, and more. Asking about a specific one will highlight it.", nodeId: 'skills' };
    }
    if (lowerInput.includes('project')) {
      return { text: "I've built systems like Ask ILA (21M+ txns) and RCA Agents. Ask about 'Ask ILA' to see details.", nodeId: 'projects' };
    }

    // 3. Fallback
    return {
      text: "I am accessing my knowledge graph. Try asking about 'Python', 'Experience', or specific projects like 'Ask ILA'. (Tip: Enter an API Key for full AI mode!)",
      nodeId: null
    };
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 text-white overflow-hidden">
      <GraphBackground data={resumeData} activeNode={activeNode} onNodeClick={(node) => {
        setActiveNode(node.id);
        setMessages(prev => [...prev, { sender: 'bot', text: `You selected[${node.name}]. ${node.desc || ""} ` }]);
      }} />

      {/* Flashy Download Button - Top Right */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={() => {
            const link = document.createElement('a');
            link.href = '/resume.pdf';
            link.download = 'Kumar_Gyanam_Resume.pdf';
            link.click();
          }}
          className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-xl font-semibold text-white shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse"
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:animate-bounce">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="tracking-wide">Download Resume</span>
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
        </button>
      </div>

      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Kumar Gyanam</h1>
        <p className="text-sm text-slate-400">Deputy Vice President - Gen AI Leader</p>
      </div>

      <ChatInterface messages={messages} onSendMessage={handleSendMessage} isTyping={isTyping} isAIEnabled={true} />
    </div>
  );
};

export default App;
