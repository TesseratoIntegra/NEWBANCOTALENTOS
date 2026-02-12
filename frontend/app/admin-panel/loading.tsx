export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Carregando...</p>
      </div>
    </div>
  );
}
