import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  MessageSquare,
  ChevronLeft,
  User,
  Bot,
} from 'lucide-react';

const NEGOTIATOR_REPLIES = [
  {
    pattern: /deposit|payment| escrow/i,
    response: 'Thanks for reaching out. Your escrow deposit is on schedule. If you need to adjust the amount or date, just let me know and I can process the change within 24 hours.',
  },
  {
    pattern: /settlement|offer|negotiat/i,
    response: 'I am actively negotiating with your creditors. I will update you the moment we receive a counter-offer or final agreement. No news is normal — these conversations take time.',
  },
  {
    pattern: /lawsuit|legal|suit|court|garnish/i,
    response: 'I understand this can feel stressful. Our legal team is handling everything. Please upload any mail you receive so we can respond appropriately and on time.',
  },
  {
    pattern: /document|form|sign|vault/i,
    response: 'I have checked your Document Vault. If a document needs your signature, you will see it flagged there. Let me know if you need help with any specific form.',
  },
  {
    pattern: /credit|score|rebuild/i,
    response: 'Credit rebuilding is a marathon, not a sprint. Keep following your checklist and avoid new inquiries. You should see steady improvement month over month.',
  },
  {
    pattern: /cancel|quit|stop|withdraw/i,
    response: 'I am sorry to hear you are considering leaving the program. Before you decide, can we schedule a quick call to review your progress? Most clients who stay the course save significantly.',
  },
];

export default function Messages() {
  const { state, sendMessage, markThreadRead, addReplyToThread } = useApp();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [typingThreadId, setTypingThreadId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const threads = state.messageThreads;
  const activeThread = threads.find((t) => t.id === activeThreadId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeThread?.messages.length, typingThreadId]);

  const unreadThreadCount = useMemo(
    () => threads.filter((t) => t.messages.some((m) => m.sender !== 'user' && !m.read)).length,
    [threads]
  );

  const handleSelectThread = useCallback(
    (id: string) => {
      setActiveThreadId(id);
      markThreadRead(id);
    },
    [markThreadRead]
  );

  const handleSend = useCallback(() => {
    if (!input.trim() || !activeThreadId || typingThreadId) return;
    const text = input.trim();
    sendMessage(activeThreadId, text);
    setInput('');

    // Simulate negotiator typing and reply
    setTypingThreadId(activeThreadId);
    const delay = 1200 + Math.random() * 1500;

    setTimeout(() => {
      setTypingThreadId(null);
      const match = NEGOTIATOR_REPLIES.find((r) => r.pattern.test(text));
      const replyBody = match
        ? match.response
        : "Thanks for your message. I've noted this in your file and will follow up with more detail shortly. Is there anything else I can help clarify today?";
      addReplyToThread(activeThreadId, replyBody);
    }, delay);
  }, [input, activeThreadId, typingThreadId, sendMessage, addReplyToThread]);

  return (
    <div className="bg-cream-50 rounded-2xl border border-cream-300 shadow-sm overflow-hidden h-[calc(100vh-220px)] min-h-[500px] flex">
      {/* Thread List */}
      <div
        className={`w-full md:w-80 border-r border-cream-200 flex flex-col ${activeThreadId ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="p-4 border-b border-cream-200">
          <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gold-600" />
            Messages
            {unreadThreadCount > 0 && (
              <span className="ml-auto text-xs font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                {unreadThreadCount}
              </span>
            )}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => {
            const lastMsg = thread.messages[thread.messages.length - 1];
            const unread = thread.messages.filter((m) => m.sender !== 'user' && !m.read).length;
            return (
              <button
                key={thread.id}
                onClick={() => handleSelectThread(thread.id)}
                className={`w-full text-left px-4 py-3 border-b border-cream-100 hover:bg-cream-100 transition-colors ${
                  activeThreadId === thread.id ? 'bg-cream-100' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-navy-900 truncate">{thread.subject}</p>
                  {unread > 0 && <span className="w-2 h-2 bg-gold-500 rounded-full shrink-0" />}
                </div>
                <p className="text-xs text-navy-500 mt-0.5 truncate">
                  {lastMsg?.sender === 'user' ? 'You: ' : ''}
                  {lastMsg?.body}
                </p>
                <p className="text-[10px] text-navy-400 mt-1">
                  {lastMsg && new Date(lastMsg.timestamp).toLocaleDateString()}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation */}
      <div className={`flex-1 flex flex-col ${activeThreadId ? 'flex' : 'hidden md:flex'}`}>
        {activeThread ? (
          <>
            <div className="p-4 border-b border-cream-200 flex items-center gap-3">
              <button
                onClick={() => setActiveThreadId(null)}
                className="md:hidden p-1.5 rounded-lg hover:bg-cream-100 text-navy-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="text-sm font-bold text-navy-900">{activeThread.subject}</p>
                <p className="text-xs text-navy-400">
                  {activeThread.participants.filter((p) => p !== `${state.profile.firstName} ${state.profile.lastName}`).join(', ')}
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeThread.messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isUser ? 'bg-gold-100 text-gold-700 border border-gold-200' : 'bg-navy-100 text-navy-700'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-gold-500 text-navy-950 rounded-tr-md'
                          : 'bg-cream-100 text-navy-800 border border-cream-200 rounded-tl-md'
                      }`}
                    >
                      {msg.body}
                    </div>
                  </motion.div>
                );
              })}

              <AnimatePresence>
                {typingThreadId === activeThread.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-navy-100 text-navy-700">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-cream-100 border border-cream-200 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 border-t border-cream-200 bg-cream-50">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-cream-100 hover:bg-cream-200 text-navy-400 transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-cream-100 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:bg-cream-50 transition-colors outline-none"
                  disabled={!!typingThreadId}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || !!typingThreadId}
                  className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center text-gold-400 hover:bg-navy-800 disabled:opacity-40 transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
              <p className="text-[10px] text-navy-300 text-center mt-2">
                Responses are simulated for demo purposes
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 bg-gold-100 rounded-2xl flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-gold-600" />
            </div>
            <p className="text-sm text-navy-400">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
