import { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, CreditCard, Eye, EyeOff } from 'lucide-react';

const transactions = [
  { id: 'TXN-001', type: 'debit', description: 'Purchase – Homemade Strawberry Cake', amount: 250, date: 'May 11, 2026', status: 'completed' },
  { id: 'TXN-002', type: 'credit', description: 'Refund – Cancelled Order', amount: 150, date: 'May 10, 2026', status: 'completed' },
  { id: 'TXN-003', type: 'debit', description: 'Purchase – Engineering Textbook Bundle', amount: 1200, date: 'May 9, 2026', status: 'completed' },
  { id: 'TXN-004', type: 'credit', description: 'Top-up via GCash', amount: 2000, date: 'May 8, 2026', status: 'completed' },
  { id: 'TXN-005', type: 'debit', description: 'Purchase – Wireless Earbuds', amount: 950, date: 'May 7, 2026', status: 'completed' },
];

export function EWallet() {
  const [showBalance, setShowBalance] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');

  const balance = 3450.00;
  const credits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const debits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-slate-800">E-Wallet</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your campus marketplace wallet</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl p-6 text-white mb-4 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-200" />
              <p className="text-blue-100 text-sm">BUMarket Wallet</p>
            </div>
            <button onClick={() => setShowBalance(!showBalance)} className="text-blue-200 hover:text-white transition-colors p-1">
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <div className="mb-6">
            <p className="text-blue-200 text-sm mb-1">Available Balance</p>
            <p className="text-4xl font-bold">
              {showBalance ? `₱${balance.toLocaleString('en', { minimumFractionDigits: 2 })}` : '₱•••••'}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs">Student ID</p>
              <p className="text-white text-sm font-medium">2024-00001</p>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-1.5">
              <p className="text-white text-xs">🟢 Active</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-500">Total Received</p>
            </div>
            <p className="text-emerald-600 font-bold">+₱{credits.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-xs text-slate-500">Total Spent</p>
            </div>
            <p className="text-red-500 font-bold">-₱{debits.toLocaleString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowTopUp(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Top Up
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-600 py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm">
            <CreditCard className="w-4 h-4" /> Linked Cards
          </button>
        </div>

        {/* Top Up Modal */}
        {showTopUp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTopUp(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-slate-800 mb-4">Top Up Wallet</h3>
              <div className="space-y-3 mb-4">
                {[100, 200, 500, 1000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTopUpAmount(amount.toString())}
                    className={`w-full py-2.5 rounded-xl border text-sm transition-colors ${topUpAmount === amount.toString() ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    ₱{amount.toLocaleString()}
                  </button>
                ))}
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={e => setTopUpAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowTopUp(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
                <button
                  onClick={() => { setShowTopUp(false); alert(`✅ ₱${topUpAmount} added to your wallet!`); }}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h4 className="text-slate-800 text-sm font-semibold mb-4">Transaction History</h4>
          <div className="space-y-3">
            {transactions.map(txn => (
              <div key={txn.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {txn.type === 'credit' ? (
                      <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-slate-700">{txn.description}</p>
                    <p className="text-xs text-slate-400">{txn.date} · #{txn.id}</p>
                  </div>
                </div>
                <p className={`font-semibold text-sm ${txn.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {txn.type === 'credit' ? '+' : '-'}₱{txn.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
