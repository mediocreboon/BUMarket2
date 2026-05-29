import { Wallet } from 'lucide-react';

export function EWallet() {
  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h2 className="text-slate-800">E-Wallet</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your campus marketplace wallet</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl p-8 text-white shadow-lg text-center">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold mb-1">E-Wallet</h3>
          <p className="text-blue-100 text-sm max-w-sm mx-auto">
            We&apos;re working on a built-in wallet for top-ups, transfers, and instant payments
            between buyers and sellers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          {[
            { title: 'Top-ups', desc: 'Add funds via GCash or Maya.' },
            { title: 'Instant Pay', desc: 'Pay sellers from your balance.' },
            { title: 'Wallet History', desc: 'Track every transaction.' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-sm font-medium text-slate-800">{f.title}</p>
              <p className="text-xs text-slate-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          For now, use <strong>Cash on Pickup</strong> to settle orders at meet-up.
        </p>
      </div>
    </div>
  );
}
