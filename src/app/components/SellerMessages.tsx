import { useState } from 'react';
import { Send, Search, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Conversation {
  id: string;
  buyer: string;
  buyerAvatar: string;
  product: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface Message {
  id: string;
  role: 'buyer' | 'seller';
  text: string;
  time: string;
}

const CONVERSATIONS: Conversation[] = [
  { id: '1', buyer: 'John Davis', buyerAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200', product: 'Scientific Calculator', lastMessage: 'Is this still available?', time: '5 min ago', unread: 2 },
  { id: '2', buyer: 'Lisa Wong', buyerAvatar: 'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=200', product: 'Engineering Textbook Bundle', lastMessage: 'Can we meet at 2pm instead?', time: '15 min ago', unread: 1 },
  { id: '3', buyer: 'Michael Brown', buyerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', product: 'Campus Hoodie', lastMessage: 'Thanks! See you tomorrow.', time: '1 hour ago', unread: 0 },
  { id: '4', buyer: 'Ana Reyes', buyerAvatar: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=200', product: 'Coffee & Pastry Bundle', lastMessage: 'Can I get 2 pcs?', time: '2 hours ago', unread: 0 },
];

const MESSAGES_BY_CONVO: Record<string, Message[]> = {
  '1': [
    { id: '1', role: 'buyer', text: 'Hi! Is this still available?', time: '4:25 PM' },
    { id: '2', role: 'seller', text: 'Yes, still available! Just 1 left.', time: '4:28 PM' },
    { id: '3', role: 'buyer', text: 'Great! Can we meet at the library tomorrow?', time: '4:30 PM' },
  ],
  '2': [
    { id: '1', role: 'buyer', text: 'Hi! I want to reserve the Engineering Textbook Bundle.', time: '3:00 PM' },
    { id: '2', role: 'seller', text: 'Sure! When can we meet?', time: '3:05 PM' },
    { id: '3', role: 'buyer', text: 'Can we meet at 2pm instead?', time: '3:10 PM' },
  ],
  '3': [
    { id: '1', role: 'buyer', text: 'Is the hoodie size M available?', time: '10:00 AM' },
    { id: '2', role: 'seller', text: 'Yes! Size M is available. Meet at Student Center?', time: '10:05 AM' },
    { id: '3', role: 'buyer', text: 'Thanks! See you tomorrow.', time: '10:10 AM' },
  ],
  '4': [
    { id: '1', role: 'buyer', text: 'Good morning! Can I get 2 pcs of the pastry bundle?', time: '8:00 AM' },
  ],
};

export function SellerMessages() {
  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MESSAGES_BY_CONVO);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  const filteredConvos = conversations.filter(c =>
    !search || c.buyer.toLowerCase().includes(search.toLowerCase()) || c.product.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectConvo = (convo: Conversation) => {
    setSelectedConvo(convo);
    setConversations(prev => prev.map(c => c.id === convo.id ? { ...c, unread: 0 } : c));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedConvo) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'seller',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => ({
      ...prev,
      [selectedConvo.id]: [...(prev[selectedConvo.id] || []), newMsg],
    }));
    setConversations(prev => prev.map(c =>
      c.id === selectedConvo.id ? { ...c, lastMessage: input, time: 'Just now' } : c
    ));
    setInput('');
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="flex-1 flex bg-slate-50 overflow-hidden" style={{ height: 'calc(100vh - 0px)' }}>
      {/* Conversation List */}
      <div className="w-72 bg-white border-r border-slate-100 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-800">Messages</h3>
            {totalUnread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{totalUnread}</span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvos.map(convo => (
            <button
              key={convo.id}
              onClick={() => handleSelectConvo(convo)}
              className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left ${selectedConvo?.id === convo.id ? 'bg-indigo-50' : ''}`}
            >
              <div className="relative flex-shrink-0">
                <ImageWithFallback src={convo.buyerAvatar} alt={convo.buyer} className="w-10 h-10 rounded-full object-cover" />
                {convo.unread > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs" style={{fontSize: '10px'}}>{convo.unread}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${convo.unread > 0 ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{convo.buyer}</p>
                  <span className="text-xs text-slate-400 flex-shrink-0">{convo.time}</span>
                </div>
                <p className="text-xs text-indigo-500 mb-0.5 truncate">{convo.product}</p>
                <p className={`text-xs truncate ${convo.unread > 0 ? 'text-slate-800' : 'text-slate-400'}`}>{convo.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      {selectedConvo ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <ImageWithFallback src={selectedConvo.buyerAvatar} alt={selectedConvo.buyer} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="text-slate-800 font-medium">{selectedConvo.buyer}</p>
              <p className="text-xs text-slate-400">Inquiry about: {selectedConvo.product}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {(messages[selectedConvo.id] || []).map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'seller' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${msg.role === 'seller' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === 'seller'
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-slate-400">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="px-6 py-4 bg-white border-t border-slate-100 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400 flex-col gap-3">
          <MessageCircle className="w-12 h-12 opacity-30" />
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
