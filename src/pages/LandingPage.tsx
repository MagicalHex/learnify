const LandingPage = ({ onExit }: { onExit: () => void }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black text-white overflow-y-auto">
      {/* Close button */}
      <button
        onClick={onExit}
        className="absolute top-4 right-6 text-white/80 hover:text-white text-3xl z-10"
      >
        ×
      </button>

      <div className="max-w-5xl mx-auto p-8 pt-20 pb-16 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-8">
          <h1 className="text-6xl md:text-7xl font-bold">
            NavExplore 🐝
          </h1>
          <p className="text-2xl md:text-3xl text-white/80 max-w-3xl mx-auto">
            Your personal AI-powered learning roadmap builder
          </p>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Stop wandering. Start navigating. Build structured, efficient paths through any topic using the power of large language models.
          </p>
        </div>

        {/* Why this exists */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-center">Why NavExplore?</h2>
          <div className="grid md:grid-cols-2 gap-8 text-lg">
            <div className="bg-white/5 rounded-2xl p-8 backdrop-blur">
              <h3 className="text-2xl font-semibold mb-4">Learning is broken</h3>
              <p className="text-white/80">
                Endless tabs, scattered notes, YouTube rabbit holes, and "I'll remember this later" lies. Most people quit before they finish.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-8 backdrop-blur">
              <h3 className="text-2xl font-semibold mb-4">We fix it with structure + AI</h3>
              <p className="text-white/80">
                Break any skill into clear steps. Track time genuinely. Use AI summaries. See real progress. Finish what you start.
              </p>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <div className="text-center space-y-6">
          <p className="text-2xl">Ready to learn smarter?</p>
          <button
            onClick={onExit}
            className="bg-green-600 hover:bg-green-500 text-white font-bold text-xl px-12 py-6 rounded-2xl transition"
          >
            Explore Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;