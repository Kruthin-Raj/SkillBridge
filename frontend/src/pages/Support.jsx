export default function Support() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in py-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cw-bg-alt text-3xl mb-4">
        🛠️
      </div>
      <h1 className="text-3xl font-bold text-cw-text-1">Support Center</h1>
      <p className="text-lg text-cw-text-2">
        We're working hard to bring you a comprehensive support experience.
      </p>
      
      <div className="card mt-8 max-w-md mx-auto border-dashed border-2 border-cw-border bg-cw-bg-alt/30">
        <h2 className="text-xl font-semibold text-cw-accent mb-2">Coming Soon</h2>
        <p className="text-sm text-cw-text-3">
          Soon you'll be able to open tickets, read FAQs, and chat with moderators directly from this page. 
          Stay tuned!
        </p>
      </div>
    </div>
  );
}
