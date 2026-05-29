import { Sparkles } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-2xl shadow-sm p-8 text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-slate-900 font-semibold mb-2">{title}</h2>
        <p className="text-slate-500 text-sm">{description}</p>
        <p className="text-xs text-blue-600 mt-4 font-medium">Coming in a future enhancement</p>
      </div>
    </div>
  );
}
