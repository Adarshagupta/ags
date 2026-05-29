export default function Loading() {
  return (
    <div className="fixed inset-0 bg-cream/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-wine/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-wine rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-ink/55 font-medium">Loading...</p>
      </div>
    </div>
  )
}
