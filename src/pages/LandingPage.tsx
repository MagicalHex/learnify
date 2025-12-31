const LandingPage = ({ onExit }: { onExit: () => void }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black text-white overflow-y-auto">
              {/* Sticky Header */}
<div className="sticky top-0 z-10 pb-2">
  <div className="absolute inset-x-0 top-0 h-full bg-black/20 backdrop-blur-sm shadow-md rounded-b-2xl"></div>
  
  <div className="relative flex items-center justify-between px-1 py-4">
        <button
          className="
            text-2xl
            opacity-95
            bg-gradient-to-b
            from-green-900
            via-green-600
            to-green-900
            hover:via-blue-700
            rounded-full
            w-10 h-10
            shadow-xl
            border border-green-700
            flex items-center justify-center
            transition-all hover:scale-105"
          onClick={onExit}
        >
          ←
        </button>
        
    <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">Bee Curious</h1>
      </div>
  </div>

{/* CONTENT */}

      <div className="max-w-5xl mx-auto p-8 pt-20 pb-16 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-8">
          <h1 className="text-6xl md:text-7xl font-bold">
            Bee Curious 🐝
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
          <h2 className="text-4xl font-bold text-center">Why Bee Curious?</h2>
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