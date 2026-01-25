import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInterface = ({ messages, onSendMessage, isTyping, isAIEnabled }) => {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false); // TTS Mute toggle
    const scrollRef = useRef(null);
    const recognitionRef = useRef(null);

    // Auto-scroll to bottom directly
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop unexpected overlap

            // Strip markdown for speech
            const cleanText = text
                .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
                .replace(/\*(.*?)\*/g, '$1')     // Italic
                .replace(/__(.*?)__/g, '$1')     // Underline
                .replace(/`(.*?)`/g, '$1')       // Code
                .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
                .replace(/^- /gm, '')            // List items
                .replace(/#/g, '')               // Headers
                .trim();

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1.1; // Slightly faster for snappiness
            utterance.pitch = 1.0;
            // Select a good english voice if available
            const voices = window.speechSynthesis.getVoices();
            const preferred = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) || voices[0];
            if (preferred) utterance.voice = preferred;

            window.speechSynthesis.speak(utterance);
        }
    };

    // TTS Effect: Speak last bot message if not muted
    useEffect(() => {
        if (!isMuted && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.sender === 'bot') {
                speakText(lastMsg.text);
            }
        }
    }, [messages, isMuted]);

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert("Your browser does not support voice input. Try Chrome.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);

        recognitionRef.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            onSendMessage(transcript); // Auto-send on voice
        };

        recognitionRef.current.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        // Fixed container at bottom-right or center-bottom for better visibility
        // Using Tailwind v4 styling
        <div className="absolute bottom-6 right-6 w-full max-w-md z-20 flex flex-col pointer-events-none px-4 md:px-0">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col h-[500px] max-h-[70vh]">

                {/* Header - Premium Look */}
                <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <div className="absolute top-0 left-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-sm tracking-wide">AGENT_ACTIVE</h3>
                            <p className="text-xs text-slate-400 font-mono">v2.4.0 • <span className="text-emerald-400">AI ONLINE</span></p>
                        </div>
                    </div>
                    {/* Voice Toggle */}
                    <button
                        onClick={() => {
                            window.speechSynthesis.cancel();
                            setIsMuted(!isMuted);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                        title={isMuted ? "Enable Voice Output" : "Mute Voice Output"}
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-emerald-400" />}
                    </button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide bg-black/20">
                    <AnimatePresence mode='popLayout'>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-white/10 shadow-lg ${msg.sender === 'bot' ? 'bg-indigo-600/90' : 'bg-slate-700/90'}`}>
                                    {msg.sender === 'bot' ? <Bot size={18} className="text-white" /> : <User size={18} className="text-white" />}
                                </div>

                                {/* Bubble */}
                                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed max-w-[85%] shadow-md backdrop-blur-sm ${msg.sender === 'bot'
                                    ? 'bg-slate-800/80 text-slate-100 rounded-tl-none border border-white/5'
                                    : 'bg-indigo-600/90 text-white rounded-tr-none'
                                    }`}>
                                    <ReactMarkdown
                                        components={{
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                            li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-semibold text-emerald-300" {...props} />,
                                            a: ({ node, ...props }) => <a className="text-blue-400 underline hover:text-blue-300" target="_blank" rel="noopener noreferrer" {...props} />,
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </motion.div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-600/90 flex items-center justify-center shrink-0 border border-white/10">
                                    <Bot size={18} className="text-white" />
                                </div>
                                <div className="bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-1.5 h-12">
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Starter Chips (Ice Breakers) */}
                    {messages.length === 1 && (
                        <div className="flex flex-wrap gap-2 mt-4 animate-fade-in-up">
                            {["Tell me about your Experience", "What is your Tech Stack?", "Show me your Projects", "Contact Info"].map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSendMessage(q)}
                                    className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 px-3 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="p-4 bg-slate-900/90 border-t border-white/5 flex gap-3 items-center">
                    <div className="relative flex-1 flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Ask about Experience, Skills, or Projects..."}
                            className={`w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 pl-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans ${isListening ? "animate-pulse border-emerald-500/50 ring-1 ring-emerald-500/30" : ""}`}
                        />
                        {/* Mic Button inside Input */}
                        <button
                            type="button"
                            onClick={toggleListening}
                            className={`absolute right-3 p-1.5 rounded-lg transition-colors ${isListening ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-white'}`}
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
