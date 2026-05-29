export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
      <div className="h-48 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-slate-200 rounded-full" />
          <div className="h-5 w-14 bg-slate-200 rounded-full" />
        </div>
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-6 w-20 bg-slate-200 rounded" />
          <div className="h-8 w-16 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
