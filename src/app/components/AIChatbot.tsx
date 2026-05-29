import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, ChevronDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  time: string;
}

interface AIChatbotProps {
  context?: 'buyer' | 'seller' | 'admin';
  page?: string;
}

const CONTEXT_HINTS: Record<string, string> = {
  home: 'Tip: Browse featured products from Home, or open Marketplace to search everything.',
  marketplace: 'Tip: Use filters to narrow products by category, price, condition, rating, or seller verification.',
  orders: 'Tip: Orders move from Pending to Confirmed to Completed. Check notifications for updates.',
  favorites: 'Tip: Favorites help you keep track of products you want to revisit.',
  notifications: 'Tip: Notifications show order confirmations, completions, and seller updates.',
  inventory: 'Tip: Sellers can add products, update stock, and keep listings current from Inventory.',
  dashboard: 'Tip: The dashboard summarizes your current marketplace activity.',
};

const SUGGESTED_PROMPTS = [
  'How do I place an order?',
  'How do I become a seller?',
  'How does meet-up work?',
  'What payment methods are accepted?',
  'How do I track my order?',
];

const BOT_RESPONSES: Record<string, string> = {
  'how do i place an order': '📦 To place an order:\n1. Browse the Marketplace\n2. Click on a product you like\n3. Tap **Buy Now** on the product page\n4. Coordinate with the seller for meet-up or delivery\n5. Confirm payment at meet-up!\n\nEasy lang! 😊',
  'how do i become a seller': '🏪 To become a seller on BUMarket:\n1. Create a Seller Account from the login page\n2. Verify your student ID and department\n3. Set up your shop profile\n4. Start uploading your products!\n\nAll sellers must be verified BU students. 🎓',
  'how does meet-up work': '📍 Meet-up on BUMarket:\n- Buyers and sellers coordinate a meet-up spot on campus\n- Popular spots: Library, Cafeteria, Student Center\n- The seller confirms the time and location\n- Payment is done in person (cash or GCash)\n- Both parties confirm the transaction ✅',
  'what payment methods are accepted': '💳 Accepted Payment Methods:\n- **Cash on Meet-up (COD)** – Most common\n- **GCash** – Seller shares their number\n- **Maya** – Some sellers accept\n\nAlways confirm payment method with the seller when reserving! 👍',
  'how do i track my order': '🔍 Track your order:\n1. Go to **My Orders** in your dashboard\n2. Find your recent reservation\n3. Check the status: Pending → Confirmed → Completed\n4. Chat with the seller if you need updates\n\nYou\'ll also get notifications for status changes! 🔔',
  default: "Hi! I'm BUBot, your BUMarket assistant! 🤖✨\n\nI can help you with:\n• Placing and tracking orders\n• Seller registration & setup\n• Payment and meet-up info\n• Finding products\n• General marketplace guidance\n\nWhat would you like to know? 😊",
};

function getBotResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const key of Object.keys(BOT_RESPONSES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return BOT_RESPONSES[key];
    }
  }
  if (lower.includes('order') || lower.includes('reserve') || lower.includes('buy')) {
    return BOT_RESPONSES['how do i place an order'];
  }
  if (lower.includes('sell') || lower.includes('seller') || lower.includes('shop')) {
    return BOT_RESPONSES['how do i become a seller'];
  }
  if (lower.includes('meet') || lower.includes('pickup') || lower.includes('location')) {
    return BOT_RESPONSES['how does meet-up work'];
  }
  if (lower.includes('pay') || lower.includes('gcash') || lower.includes('cash') || lower.includes('money')) {
    return BOT_RESPONSES['what payment methods are accepted'];
  }
  if (lower.includes('track') || lower.includes('status') || lower.includes('where')) {
    return BOT_RESPONSES['how do i track my order'];
  }
  return "Thanks for reaching out! 😊 I'm still learning, but I can help with orders, seller setup, payments, and meet-ups.\n\nTry asking something like:\n• \"How do I place an order?\"\n• \"How does meet-up work?\"\n• \"What payment methods are accepted?\"";
}

function formatMessage(text: string) {
  return text.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} className={`${line.startsWith('•') || line.match(/^\d\./) ? 'pl-2' : ''} leading-relaxed`} dangerouslySetInnerHTML={{ __html: bold }} />;
  });
}

export function AIChatbot({ context = 'buyer', page }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const greeting =
    context === 'seller'
      ? "Hi! I'm **BUBot** 👋 — Need help managing products, orders, or notifications?"
      : context === 'admin'
        ? "Hi admin! I'm **BUBot**. I can help explain the marketplace flows."
        : "Hi! I'm **BUBot** 👋 — your BUMarket assistant! I can help you with orders, seller info, payments, and more.";

  const pageHint = page && CONTEXT_HINTS[page] ? `\n\n${CONTEXT_HINTS[page]}` : '';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: greeting + pageHint,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, time };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getBotResponse(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 900 + Math.random() * 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group"
          aria-label="Chat with BUBot"
          title="Chat with BUBot"
        >
          <Bot className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
          <div className="absolute bottom-16 right-0 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat with BUBot ✨
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 w-[calc(100vw-2rem)] max-w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? 'h-[60px]' : 'h-[min(500px,calc(100vh-2rem))]'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-white text-sm font-semibold">BUBot</p>
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                </div>
                <p className="text-blue-100 text-xs">BUMarket AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/80 hover:text-white transition-colors p-1 rounded"
                aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1 rounded"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'bot' && (
                      <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                        <Bot className="w-4 h-4 text-indigo-600" />
                      </div>
                    )}
                    <div className="max-w-[80%]">
                      <div className={`rounded-2xl px-4 py-3 text-sm space-y-1 ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-sm'
                          : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-sm'
                      }`}>
                        {formatMessage(msg.text)}
                      </div>
                      <p className={`text-xs text-slate-400 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center mr-2 mt-1">
                      <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1 items-center h-4">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Prompts */}
              {messages.length <= 1 && (
                <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto">
                  {SUGGESTED_PROMPTS.slice(0, 3).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="flex-shrink-0 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-3 py-1.5 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask BUBot anything..."
                  aria-label="Ask BUBot a question"
                  className="flex-1 text-sm px-4 py-2.5 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
