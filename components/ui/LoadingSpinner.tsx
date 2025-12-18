export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full bg-zinc-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-sm">Loading 3D Editor...</p>
      </div>
    </div>
  );
}

