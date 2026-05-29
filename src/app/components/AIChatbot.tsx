import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, ChevronDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  time: string;
}

type ChatContext = 'buyer' | 'seller' | 'admin';

interface AIChatbotProps {
  context?: ChatContext;
  page?: string;
}

const CONTEXT_HINTS: Record<string, string> = {
  home: 'Tip: Browse featured products or jump to the Marketplace from the hero banner.',
  marketplace: 'Tip: Use search and category filters to find campus listings faster.',
  orders: 'Tip: Order status moves from Pending → Confirmed → Completed.',
  notifications: 'Tip: Click Refresh to load the latest order updates.',
  inventory: 'Tip: Upload a clear photo and set accurate stock when adding products.',
  dashboard: 'Tip: Confirm pending orders from the Overview or Orders tab.',
};

const BOT_RESPONSES: Record<string, string> = {
  'how do i place an order':
    '📦 To place an order:\n1. Browse the Marketplace\n2. Click on a product you like\n3. Tap **Cash on Pickup** on the product page\n4. Coordinate with the seller for meet-up\n5. Pay in person at meet-up!',
  'how do i become a seller':
    '🏪 To become a seller on BUMarket:\n1. Create a Seller Account from the login page\n2. Set up your shop profile\n3. Start uploading your products!',
  'how does meet-up work':
    '📍 Meet-up on BUMarket:\n- Buyers and sellers coordinate a meet-up spot on campus\n- Payment is done in person (cash or GCash)',
  'what payment methods are accepted':
    '💳 Accepted Payment Methods:\n- **Cash on Pickup** – Most common on BUMarket\n- **GCash** – Seller shares their number at meet-up',
  'how do i track my order':
    '🔍 Track your order:\n1. Go to **My Orders** in your dashboard\n2. Check the status: Pending → Confirmed → Completed\n3. You will get notifications for status changes!',
  default:
    "Hi! I'm BUBot, your BUMarket assistant!\n\nI can help with orders, seller setup, payments, and meet-ups.\n\nWhat would you like to know?",
};

function getBotResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const key of Object.keys(BOT_RESPONSES)) {
    if (key === 'default') continue;
    if (lower.includes(key) || key.includes(lower)) return BOT_RESPONSES[key];
  }
  if (lower.includes('order') || lower.includes('buy') || lower.includes('pickup')) {
    return BOT_RESPONSES['how do i place an order'];
  }
  if (lower.includes('sell') || lower.includes('seller')) return BOT_RESPONSES['how do i become a seller'];
  if (lower.includes('meet') || lower.includes('pickup')) return BOT_RESPONSES['how does meet-up work'];
  if (lower.includes('pay') || lower.includes('gcash') || lower.includes('cash')) {
    return BOT_RESPONSES['what payment methods are accepted'];
  }
  if (lower.includes('track') || lower.includes('status')) return BOT_RESPONSES['how do i track my order'];
  return "Thanks for reaching out! Try asking about orders, seller setup, or meet-ups.";
}

function formatBotMessage(text: string) {
  return text.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
      <p
        key={i}
        className={`${line.startsWith('•') || line.match(/^\d\./) ? 'pl-2' : ''} leading-relaxed`}
        dangerouslySetInnerHTML={{ __html: bold }}
      />
    );
  });
}

function buildGreeting(context: ChatContext, page?: string): string {
  const greeting =
    context === 'seller'
      ? "Hi! I'm **BUBot** — Need help managing products, orders, or notifications?"
      : context === 'admin'
        ? "Hi admin! I'm **BUBot**. I can help explain the marketplace flows."
        : "Hi! I'm **BUBot** — your BUMarket assistant! I can help with orders, seller info, and payments.";
  const pageHint = page && CONTEXT_HINTS[page] ? `\n\n${CONTEXT_HINTS[page]}` : '';
  return greeting + pageHint;
}

export function AIChatbot({ context = 'buyer', page }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: '0',
      role: 'bot',
      text: buildGreeting(context, page),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text, time }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: getBotResponse(text),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          title="Chat with BUBot"
          aria-label="Open BUBot chat assistant"
        >
          <Bot className="w-7 h-7" />
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-[calc(100vw-2rem)] max-w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? 'h-[60px]' : 'h-[min(500px,calc(100vh-6rem))]'}`}
        >
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold flex items-center gap-1.5">
                  BUBot <Sparkles className="w-3 h-3 text-yellow-300" />
                </p>
                <p className="text-blue-100 text-xs">BUMarket Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/80 hover:text-white p-1 rounded"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
              </button>
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'bot' && (
                      <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                        <Bot className="w-4 h-4 text-indigo-600" />
                      </div>
                    )}
                    <div className="max-w-[80%]">
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm space-y-1 ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-sm whitespace-pre-wrap'
                            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-sm'
                        }`}
                      >
                        {msg.role === 'user' ? msg.text : formatBotMessage(msg.text)}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                      <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                      <div className="flex gap-1 h-4 items-center">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="p-3 bg-white border-t border-slate-200 flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask BUBot anything..."
                  className="flex-1 text-sm px-4 py-2.5 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
