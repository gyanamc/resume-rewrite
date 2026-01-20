import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInterface = ({ messages, onSendMessage, isTyping, setApiKey, isAIEnabled }) => {
    const [input, setInput] = useState('');
    const [showKeyInput, setShowKeyInput] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleKeySubmit = (e) => {
        e.preventDefault();
        const key = e.target.key.value;
        if (key) {
            setApiKey(key);
            setShowKeyInput(false);
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
                                    {msg.text}
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
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="p-4 bg-slate-900/90 border-t border-white/5 flex gap-3 items-center">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about Experience, Skills, or Projects..."
                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 pl-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
                        />
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
