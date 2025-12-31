
const How = ({ onExit }: { onExit: () => void }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
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
        
    <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">How?</h1>
      </div>
  </div>
  {/* CONTENT */}
      <div className="max-w-5xl mx-auto mt-4">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-12">
          How to Learn Effectively
        </h1>
        <p className="text-xl text-center text-gray-400 mb-20 max-w-3xl mx-auto">
          Science-backed techniques that actually work. No AI fluff - just what decades of cognitive research show leads to deeper, longer-lasting learning.
        </p>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Technique 1 */}
          <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold mb-4">1. Retrieval Practice (Active Recall)</h2>
            <p className="text-lg mb-6">
              Instead of re-reading or highlighting, test yourself. Close the book and try to recall key ideas from memory.
            </p>
            <p className="text-gray-400">
              <strong>Why it works:</strong> Forcing retrieval strengthens neural pathways far more than passive review. Meta-analyses show it's one of the most effective techniques.
            </p>
          </div>

          {/* Technique 2 */}
          <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold mb-4">2. Spaced Repetition</h2>
            <p className="text-lg mb-6">
              Review material over increasing intervals (today, tomorrow, in 3 days, in a week...).
            </p>
            <p className="text-gray-400">
              <strong>Why it works:</strong> It combats forgetting curves (Ebbinghaus). Tools like Anki automate this perfectly.
            </p>
          </div>

          {/* Technique 3 */}
          <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold mb-4">3. Interleaving</h2>
            <p className="text-lg mb-6">
              Mix different topics or problem types in one session instead of blocking one topic at a time.
            </p>
            <p className="text-gray-400">
              <strong>Why it works:</strong> Improves discrimination between concepts and long-term retention.
            </p>
          </div>

          {/* Technique 4 */}
          <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold mb-4">4. Elaboration</h2>
            <p className="text-lg mb-6">
              Explain ideas in your own words. Ask "why" and "how" — connect new material to what you already know.
            </p>
            <p className="text-gray-400">
              <strong>Why it works:</strong> Builds richer connections and deeper understanding.
            </p>
          </div>

          {/* Technique 5 */}
          <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold mb-4">5. Dual Coding</h2>
            <p className="text-lg mb-6">
              Combine words with visuals — draw diagrams, mind maps, or sketches while studying.
            </p>
            <p className="text-gray-400">
              <strong>Why it works:</strong> Information processed through both verbal and visual channels is remembered better.
            </p>
          </div>

          {/* Technique 6 */}
          <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold mb-4">6. Concrete Examples</h2>
            <p className="text-lg mb-6">
              When learning abstract concepts, find multiple real-world examples.
            </p>
            <p className="text-gray-400">
              <strong>Why it works:</strong> Grounds ideas in reality, making them easier to understand and recall.
            </p>
          </div>
        </div>

        {/* Bonus section on your original idea */}
        <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-8">Advanced Tip: Vary Your Learning Contexts</h2>
          <p className="text-xl max-w-4xl mx-auto mb-8">
            Study the same material in different environments (quiet library, café, outdoors) and emotional states (calm, lightly stressed, focused flow).
          </p>
          <p className="text-lg text-gray-300">
            Research on context-dependent memory shows that varying environments creates multiple retrieval cues, making knowledge more flexible and robust — especially useful when you'll need to recall it under varying real-world conditions.
          </p>
        </div>

        <p className="text-center text-gray-500 mt-20">
          These techniques (especially the top 6) come from rigorous meta-analyses of thousands of studies. Use them consistently and watch your learning accelerate.
        </p>
      </div>
    </div>
  );
};

export default How;