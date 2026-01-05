import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface InsightsData {
  totalStepsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  last7DaysHours: number[];
  last7DaysMoods: string[];
suggestedHours: string;  // ← Now a string, e.g. "0–2 hours"
  currentAvgHours: number;
  timeScore: number;
  moodScore: number;
  streakScore: number;
  totalPoints: number;
  message: string;
  intensityLevel: string;
  colorGradient: string;
// NEW
  latestLogTimestamp: string | null;  // ISO string from most recent log
}

const Insights = ({ onExit }: { onExit: () => void }) => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [showFeedbackButtons, setShowFeedbackButtons] = useState(false);

useEffect(() => {
  if (!insights?.latestLogTimestamp) {
    setShowFeedbackButtons(false);
    return;
  }

  const lastFeedbackKey = `lastFeedbackTimestamp_${localStorage.getItem('userId') || 'default'}`;
  const lastFeedbackTime = localStorage.getItem(lastFeedbackKey);

  const currentLogTime = new Date(insights.latestLogTimestamp).getTime();
  const lastFeedbackNum = lastFeedbackTime ? new Date(lastFeedbackTime).getTime() : 0;

  // Show buttons only if this is a NEWER log than the one we last asked about
  setShowFeedbackButtons(currentLogTime > lastFeedbackNum);
}, [insights?.latestLogTimestamp]);

const handleFeedback = (type: 'good' | 'less' | 'more') => {
  if (!insights?.latestLogTimestamp) return;

  const key = `lastFeedbackTimestamp_${localStorage.getItem('userId') || 'default'}`;
  localStorage.setItem(key, insights.latestLogTimestamp); // mark this session as "feedback given"

  setShowFeedbackButtons(false);

  // Optional: send to backend later for analytics (no need now)
  // axios.post('/api/feedback', { type, timestamp: insights.latestLogTimestamp })

  // Optional toast
  alert('Thanks for your feedback! 🐝');
};

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId') || 'pseudo-user-123';

        const response = await axios.get<InsightsData>(
          `http://localhost:5000/api/insights?userId=${userId}`
        );

        setInsights(response.data);
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-purple-900 flex items-center justify-center">
        <p className="text-3xl animate-pulse text-white">Crunching your learning data... 🐝</p>
      </div>
    );
  }

  // No Data Yet
  if (!insights) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-purple-900 flex items-center justify-center flex-col text-white px-6">
        <p className="text-2xl md:text-3xl mb-6 text-center">No learning data yet — start buzzing! 🐝</p>
        <p className="text-xl text-center">Complete your first step to unlock powerful insights.</p>
      </div>
    );
  }

  // Main Display — Everything comes directly from backend!
  const { 
    intensityLevel, 
    colorGradient, 
    message, 
    suggestedHours,
    currentStreak,
    longestStreak,
    totalStepsCompleted,
    currentAvgHours,
    last7DaysMoods,
  } = insights;

  const todayMood = last7DaysMoods[6] || '🙂';
  const moodMessage =
    todayMood === '🚀' ? 'You were in flow today — amazing!' :
    todayMood === '🙂' ? 'Steady and positive — great pace.' :
    todayMood === '😕' ? 'Some confusion? Try reviewing or switching topics.' :
    todayMood === '🐢' ? 'Feeling stuck? Shorter sessions might help.' :
    'Feeling tired? Rest is productive too. Come back fresh! 🐝';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-purple-900 text-white pb-6">
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
          
          <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">Insights</h1>
          
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl md:text-6xl font-bold text-center mb-12 mt-4">
          Your Learning Insights 🐝📊
        </h1>

{/* Today's Recommendation Banner */}
<div className="relative bg-gradient-to-r from-purple-600 via-purple-600 to-pink-600 rounded-3xl p-2 shadow-2xl text-center mb-12 border-4 border-white/20 overflow-hidden">
  <div className="absolute inset-0 bg-white/5 rounded-3xl"></div>
  
  <div className="relative">
    <h2 className="text-2xl md:text-6xl font-extrabold mb-6 text-white drop-shadow-lg">
      Today's Recommendation
    </h2>
    
    <p className="text-2xl md:text-5xl font-bold mb-6">
      Target{" "}
<span className="text-yellow-300 drop-shadow font-semibold">
  {suggestedHours}
</span>{" "}
today
    </p>
    
    <p className="text-xl md:text-2xl opacity-95 max-w-3xl mx-auto px-4 leading-relaxed mb-8">
      {message}
    </p>

    {/* Feedback Buttons — only after a fresh session */}
{showFeedbackButtons && (
  <div className="mt-6 animate-fadeIn">
    <p className="text-lg opacity-90 mb-6">How did this suggestion feel?</p>
    
    {/* Buttons in a single responsive row */}
    <div className="flex flex-row justify-center items-stretch gap-2 px-4 max-w-4xl mx-auto">
      <button
        onClick={() => handleFeedback('good')}
        className="flex-1 flex flex-col items-center justify-center gap-2 px-6 py-5 min-w-0
                   bg-gradient-to-br from-green-500 to-emerald-600 
                   rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 
                   transition-all duration-300 border-2 border-white/30"
      >
        <span className="text-4xl">✅</span>
        <span className="text-sm font-semibold">This is perfect pace</span>
      </button>

      <button
        onClick={() => handleFeedback('less')}
        className="flex-1 flex flex-col items-center justify-center gap-2 px-6 py-5 min-w-0
                   bg-gradient-to-br from-yellow-500 to-amber-600 
                   rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 
                   transition-all duration-300 border-2 border-white/30"
      >
        <span className="text-4xl">🐢</span>
        <span className="text-sm font-semibold">I need less effort</span>
      </button>

      <button
        onClick={() => handleFeedback('more')}
        className="flex-1 flex flex-col items-center justify-center gap-2 px-6 py-5 min-w-0
                   bg-gradient-to-br from-purple-500 to-pink-600 
                   rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 
                   transition-all duration-300 border-2 border-white/30"
      >
        <span className="text-4xl">🚀</span>
        <span className="text-sm font-semibold">I need more effort</span>
      </button>
    </div>

    <p className="text-sm opacity-70 mt-6 text-center">
      You can shape the suggestions better by clicking any of the buttons 🐝
    </p>
  </div>
)}
  </div>
</div>
        

        {/* Intensity Card */}
        <div className={`bg-gradient-to-br ${colorGradient} rounded-3xl p-10 shadow-2xl text-center mb-12 border-2 border-gray-400`}>
          <h2 className="text-4xl font-bold mb-4">{intensityLevel}</h2>
          <p className="text-2xl mb-2">Average: {currentAvgHours.toFixed(1)} hours/day (last 7 days)</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-3xl p-8 shadow-xl text-center border-2 border-gray-400">
            <p className="text-5xl mb-4">🔥</p>
            <h3 className="text-3xl font-bold mb-2">Current Streak</h3>
            <p className="text-4xl font-bold">{currentStreak} days</p>
            <p className="text-lg opacity-80 mt-2">Longest: {longestStreak} days</p>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-8 shadow-xl text-center border-2 border-gray-400">
            <p className="text-5xl mb-4">🎯</p>
            <h3 className="text-3xl font-bold mb-2">Steps Completed</h3>
            <p className="text-4xl font-bold">{totalStepsCompleted}</p>
            <p className="text-lg opacity-80">You're making real progress!</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 shadow-xl text-center border-2 border-gray-400">
            <p className="text-6xl mb-4">{todayMood}</p>
            <h3 className="text-3xl font-bold mb-2">Recent Mood</h3>
            <p className="text-xl opacity-90">{moodMessage}</p>
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="text-center mt-16">
          <p className="text-3xl font-bold italic mb-4">
            Sustainable learning beats intense bursts every time.
          </p>
          <p className="text-2xl opacity-80">
            Keep buzzing at your own perfect pace 🐝✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default Insights;