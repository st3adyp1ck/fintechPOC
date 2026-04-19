import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ChevronRight,
} from 'lucide-react';
import {
  calculateComparison,
  calculateSettlementSavings,
  formatCurrency,
} from '../data';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function useAutoScroll(ref: React.RefObject<HTMLDivElement | null>, deps: unknown[]) {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const SUGGESTIONS = [
  'How much do I owe?',
  'How much will I save?',
  'When will I be debt free?',
  'Explain escrow',
  'What are my fees?',
];

export default function ChatBot() {
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useAutoScroll(scrollContainerRef, [messages, isTyping]);

  const comparison = useMemo(
    () => calculateComparison(state.cards, state.totalMonthlyPayment, state.platformFee),
    [state.cards, state.totalMonthlyPayment, state.platformFee]
  );
  const settlement = useMemo(() => calculateSettlementSavings(state.cards), [state.cards]);

  const totalBalance = useMemo(
    () => state.cards.reduce((s, c) => s + c.balance, 0),
    [state.cards]
  );

  const projectedDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + comparison.platformPath.months);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [comparison.platformPath.months]);

  const generateResponse = useCallback(
    (userText: string): string => {
      const text = userText.toLowerCase();

      // Greeting
      if (/\b(hi|hello|hey|greetings|howdy)\b/.test(text)) {
        return `Hello ${state.profile.firstName}! I'm your DebtOptimize AI assistant. I can help you understand your debt profile, settlement savings, escrow balance, and timeline to becoming debt-free. What would you like to know?`;
      }

      // Total debt / balance / owe
      if (/\b(balance|debt|owe|how much|total|owed)\b/.test(text)) {
        const breakdown = state.cards
          .map(
            (c) =>
              `• **${c.creditor}**: ${formatCurrency(c.balance)} at ${c.currentApr}% APR`
          )
          .join('\n');
        return `Your total enrolled debt is **${formatCurrency(totalBalance)}** across ${state.cards.length} creditors:\n\n${breakdown}\n\nThe good news? We've already negotiated settlement offers that could reduce this to **${formatCurrency(settlement.estimatedSettlement)}**.`;
      }

      // Savings
      if (/\b(save|savings|reduction|less|discount|off)\b/.test(text)) {
        return `Based on your current negotiated rates, you stand to save **${formatCurrency(settlement.savings)}** — that's a **${settlement.savingsPercent.toFixed(0)}% reduction** on your total debt of ${formatCurrency(totalBalance)}.\n\nWithout settlement, you'd pay an estimated **${formatCurrency(comparison.statusQuo.totalInterest)}** in interest alone. With DebtOptimize, your interest burden drops significantly and you'll settle for less than the full principal.`;
      }

      // Timeline / when / how long
      if (/\b(when|how long|timeline|months|time|years|done|free|finish)\b/.test(text)) {
        return `At your current monthly payment of **${formatCurrency(state.totalMonthlyPayment)}**, our negotiated settlement path projects you'll be debt-free by **${projectedDate}** (${comparison.platformPath.months} months).\n\nWithout our program, paying minimums at your current APRs would take approximately **${comparison.statusQuo.months} months** — that's **${comparison.monthsSaved} extra months** of payments and **${formatCurrency(comparison.interestSaved)}** more in total costs.`;
      }

      // Escrow
      if (/\b(escrow|account|deposit|fund|savings account|where.*money)\b/.test(text)) {
        const progress = Math.min(100, (state.escrowBalance / settlement.estimatedSettlement) * 100);
        return `Your FDIC-insured escrow account currently holds **${formatCurrency(state.escrowBalance)}**.\n\nThis represents **${progress.toFixed(1)}%** of your estimated settlement target (${formatCurrency(settlement.estimatedSettlement)}).\n\nEach month, your deposit of **${formatCurrency(state.totalMonthlyPayment)}** builds this fund. Once a creditor agrees to a settlement, we pay them directly from this account. You remain in full control — you can withdraw unused funds at any time with no penalty.`;
      }

      // Fees / cost / price
      if (/\b(fee|cost|price|charge|pay.*you|how much.*cost|what.*cost)\b/.test(text)) {
        return `DebtOptimize charges a flat platform fee of **${formatCurrency(state.platformFee)}/month** while you're in the program.\n\nThere are **no upfront fees**, no setup costs, and no hidden charges. We only earn our full success fee when we actually settle a debt — typically a percentage of the amount we save you. If we don't save you money, we don't get paid.`;
      }

      // Creditor specific
      const creditorMatch = state.cards.find((c) => text.includes(c.creditor.toLowerCase()));
      if (creditorMatch) {
        const offer = creditorMatch.settlementOffer ?? creditorMatch.balance * 0.52;
        const saved = creditorMatch.balance - offer;
        return `**${creditorMatch.creditor}** details:\n\n• Current balance: ${formatCurrency(creditorMatch.balance)}\n• Current APR: ${creditorMatch.currentApr}%\n• Negotiated APR: ${creditorMatch.negotiatedApr ?? 'In progress'}%\n• Settlement offer: ${formatCurrency(offer)}\n• You'd save: ${formatCurrency(saved)}\n• Status: **${creditorMatch.status}**\n\nWe're actively negotiating with ${creditorMatch.creditor} and will update you as soon as we have a finalized agreement.`;
      }

      // Credit score
      if (/\b(credit score|credit rating|fico|credit report|rebuild|repair)\b/.test(text)) {
        return `Your current credit score range is **${state.profile.creditScore.charAt(0).toUpperCase() + state.profile.creditScore.slice(1)}**.\n\nIt's normal for scores to dip temporarily during debt settlement since you'll stop paying creditors directly. However, once settlements are complete, our free **Credit Rebuilding Program** has helped clients recover to 700+ within 24 months. The short-term impact is typically far outweighed by the long-term benefit of eliminating high-interest debt.`;
      }

      // Settlement / negotiation process
      if (/\b(settlement|negotiate|negotiation|process|how.*work|what happens)\b/.test(text)) {
        return `Here's how debt settlement works:\n\n**1. Build Escrow** — You stop paying creditors and deposit an affordable amount monthly into your FDIC-insured escrow account.\n\n**2. We Negotiate** — Our experts contact creditors and negotiate lump-sum settlements for less than you owe.\n\n**3. Settle & Pay** — Once a creditor accepts an offer, we pay them from escrow.\n\n**4. Rebuild** — After your last settlement, our credit rebuilding program helps you recover quickly.\n\nYour average settlement is projected at **${settlement.savingsPercent.toFixed(0)}% of principal** — that's industry-leading.`;
      }

      // Monthly payment
      if (/\b(monthly|payment|per month|deposit|afford)\b/.test(text)) {
        return `Your current monthly escrow deposit is **${formatCurrency(state.totalMonthlyPayment)}**.\n\nThis includes your program deposit plus the ${formatCurrency(state.platformFee)} platform fee. This amount was calculated to be affordable based on your income (${formatCurrency(state.profile.annualIncome)}/year) and expenses.\n\nIf your financial situation changes, you can adjust this amount from the Admin panel or contact your account manager.`;
      }

      // Admin / settings
      if (/\b(admin|settings|change|adjust|modify|update)\b/.test(text)) {
        return `You can adjust your program settings — including monthly payment, platform fee, and negotiated APRs — from the **Admin** panel in the sidebar.\n\nAny changes you make will instantly update your dashboard projections and settlement timeline.`;
      }

      // Help / capabilities
      if (/\b(help|what.*do|capable|can you|features|assist|support)\b/.test(text)) {
        return `I can help you with:\n\n• Your total debt and creditor breakdown\n• Estimated settlement savings and timeline\n• Escrow balance and progress toward your target\n• Understanding fees and the settlement process\n• Credit score impact and rebuilding strategies\n• Details on any specific creditor\n\nJust ask me anything about your debt or the DebtOptimize program!`;
      }

      // Goodbye
      if (/\b(bye|goodbye|see you|thanks|thank you|appreciate)\b/.test(text)) {
        return `You're very welcome, ${state.profile.firstName}! I'm here whenever you need clarity on your debt journey. Remember: every month in this program is a month closer to freedom. You've got this! 🎉`;
      }

      // Fallback
      return `I'm not sure I understood that completely, but I'm here to help!\n\nTry asking me about:\n• How much you owe and to whom\n• Your projected savings and timeline\n• How escrow works\n• The settlement negotiation process\n• Details on a specific creditor\n\nWhat would you like to know?`;
    },
    [
      state.profile,
      state.cards,
      state.totalMonthlyPayment,
      state.platformFee,
      state.escrowBalance,
      totalBalance,
      settlement,
      comparison,
      projectedDate,
    ]
  );

  const addMessage = useCallback((role: ChatMessage['role'], content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), role, content, timestamp: new Date() },
    ]);
  }, []);

  const handleSend = useCallback(
    (text?: string) => {
      const messageText = text ?? input.trim();
      if (!messageText || isTyping) return;

      addMessage('user', messageText);
      setInput('');
      setIsTyping(true);

      // Simulate realistic typing delay based on response length estimate
      const estimatedResponseLength = generateResponse(messageText).length;
      const delay = Math.min(2500, Math.max(1200, estimatedResponseLength * 18));

      setTimeout(() => {
        const response = generateResponse(messageText);
        addMessage('assistant', response);
        setIsTyping(false);
      }, delay);
    },
    [input, isTyping, addMessage, generateResponse]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (!hasBeenOpened) {
      setHasBeenOpened(true);
      setIsTyping(true);
      setTimeout(() => {
        addMessage(
          'assistant',
          `Hi ${state.profile.firstName}! I'm your DebtOptimize AI assistant. I can answer questions about your debt, savings, timeline, or anything financial. How can I help you today?`
        );
        setIsTyping(false);
      }, 800);
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [hasBeenOpened, addMessage, state.profile.firstName]);

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-navy-900 rounded-full shadow-2xl flex items-center justify-center text-gold-400 hover:bg-navy-800 transition-colors group"
            aria-label="Open AI Assistant"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            {/* Pulse ring */}
            {!hasBeenOpened && (
              <span className="absolute inset-0 rounded-full bg-gold-400/30 animate-ping" />
            )}
            {/* Tooltip */}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-navy-900 text-cream-50 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              AI Assistant
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-48px)] bg-cream-50 rounded-2xl shadow-2xl border border-cream-300 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-navy-900 text-cream-50 px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gold-500/15 rounded-xl flex items-center justify-center border border-gold-500/20">
                  <Bot className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <p className="text-sm font-bold">DebtOptimize AI</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[11px] text-navy-300">Online</span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-navy-800 flex items-center justify-center text-navy-300 hover:text-cream-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Messages */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll"
            >
              {messages.length === 0 && !isTyping && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <div className="w-12 h-12 bg-gold-100 rounded-2xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-gold-600" />
                  </div>
                  <p className="text-sm text-navy-400 max-w-[200px]">
                    Send a message to start chatting with DebtOptimize AI
                  </p>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-2.5 ${
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        msg.role === 'user'
                          ? 'bg-navy-800 text-cream-50'
                          : 'bg-gold-100 text-gold-700 border border-gold-200'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-navy-900 text-cream-50 rounded-tr-md'
                          : 'bg-cream-100 text-navy-800 border border-cream-200 rounded-tl-md'
                      }`}
                    >
                      <MessageContent content={msg.content} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-gold-100 text-gold-700 border border-gold-200">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-cream-100 border border-cream-200 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && !isTyping && (
              <div className="px-4 pb-2 shrink-0">
                <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-2">
                  Suggested Questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-cream-100 text-navy-600 border border-cream-200 hover:bg-gold-100 hover:border-gold-200 hover:text-navy-800 transition-colors flex items-center gap-1"
                    >
                      {s}
                      <ChevronRight className="w-3 h-3 opacity-50" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-cream-200 bg-cream-50 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything financial..."
                  className="flex-1 bg-cream-100 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:bg-cream-50 transition-colors"
                  disabled={isTyping}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center text-gold-400 hover:bg-navy-800 disabled:opacity-40 disabled:hover:bg-navy-900 transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
              <p className="text-[10px] text-navy-300 text-center mt-2">
                AI responses are simulated for demo purposes
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* Render bold markdown-style **text** in messages */
function MessageContent({ content }: { content: string }) {
  const parts = useMemo(() => {
    const result: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        result.push(
          <span key={`text-${lastIndex}`}>{content.slice(lastIndex, match.index)}</span>
        );
      }
      result.push(
        <strong key={`bold-${match.index}`} className="font-bold">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      result.push(<span key={`text-${lastIndex}`}>{content.slice(lastIndex)}</span>);
    }
    return result;
  }, [content]);

  return <>{parts}</>;
}
