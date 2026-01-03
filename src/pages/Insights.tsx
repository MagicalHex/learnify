// src/pages/Insights.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';

interface TimeLog {
  timerEvents?: { type: string; at: number }[];
  manualFrom?: string;
  manualTo?: string;
  manualBreakFrom?: string;
  manualBreakTo?: string;
  pausedTime?: number;
  savedAt?: string;
  mood?: '🐢' | '😕' | '🙂' | '🚀' | '😴';
}

interface Step {
  id: string;
  title: string;
  category: 'reading' | 'watching' | 'coding' | 'thinking';
  difficulty: number;
  completed: string | null;
  timeLogs: TimeLog[];
  // summaries and other fields omitted for insights
}

interface Roadmap {
  id: string;
  title: string;
  steps: Step[];
}

interface InsightsData {
  totalStepsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  last7DaysHours: number[];
  last7DaysMoods: string[];
  accountAgeDays: number;
// === NEW FIELDS ===
  suggestedHours: number;        // Main suggestion for today
  currentAvgHours: number;       // Average over last 7 days (useful for display)
  timeScore: number;             // How well their time usage aligns with ideal (0–100)
  moodScore: number;             // Average mood over active days last week (0–100)
  streakScore: number;           // Consistency score (0–100)
  totalPoints: number;           // Overall health score (0–100)
}

const Insights = ({ onExit }: { onExit: () => void }) => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper: calculate active hours from one time log
    // Helper: calculate active hours from one time log
  const calculateHoursFromLog = (log: TimeLog): number => {
    let seconds = 0;

    if (log.manualFrom && log.manualTo) {
      const start = new Date(log.manualFrom);
      const end = new Date(log.manualTo);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        seconds = (end.getTime() - start.getTime()) / 1000;

        if (log.manualBreakFrom && log.manualBreakTo) {
          const bStart = new Date(log.manualBreakFrom);
          const bEnd = new Date(log.manualBreakTo);
          if (!isNaN(bStart.getTime()) && !isNaN(bEnd.getTime())) {
            seconds -= (bEnd.getTime() - bStart.getTime()) / 1000;
          }
        }
      }
    }

    if (log.pausedTime) seconds -= log.pausedTime;

    return Math.max(0, seconds / 3600);
  };

  // Core computation function — pure, testable, clean
  const computeInsightsFromSteps = (allSteps: Step[]): InsightsData => {
    console.log('Computing insights from', allSteps.length, 'steps');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let totalCompleted = 0;
    const dailyHours: Record<string, number> = {};
    const dailyMood: Record<string, { mood: string; savedAt: string }> = {};
    const activeDates = new Set<string>();
    let firstActivityDate: Date | null = null;

    allSteps.forEach(step => {
      if (step.completed) totalCompleted++;

      step.timeLogs.forEach(log => {
        const logDateStr = log.savedAt || log.manualFrom;
        if (!logDateStr) return;

        const logDate = new Date(logDateStr);
        if (isNaN(logDate.getTime())) return;

        const dateKey = logDate.toISOString().split('T')[0];

        const hours = calculateHoursFromLog(log);
        if (hours > 0.01) {
          dailyHours[dateKey] = (dailyHours[dateKey] || 0) + hours;
          activeDates.add(dateKey);
        }

        const mood = log.mood || '🙂';
        const savedAt = log.savedAt || log.manualFrom || '';
        const existing = dailyMood[dateKey];
        if (!existing || savedAt > existing.savedAt) {
          dailyMood[dateKey] = { mood, savedAt };
        }

        if (!firstActivityDate || logDate < firstActivityDate) {
          firstActivityDate = logDate;
        }
      });
    });

    // Last 7 days arrays
    const last7DaysHours: number[] = [];
    const last7DaysMoods: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const key = day.toISOString().split('T')[0];
      last7DaysHours.push(parseFloat((dailyHours[key] || 0).toFixed(2)));
      last7DaysMoods.push(dailyMood[key]?.mood || '🙂');
    }

    // Streaks
    const sortedActiveDates = Array.from(activeDates)
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());

    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < sortedActiveDates.length; i++) {
      const diffDays = (sortedActiveDates[i].getTime() - sortedActiveDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      if (Math.abs(diffDays - 1) < 0.1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Current streak
    if (sortedActiveDates.length > 0) {
      const lastActive = sortedActiveDates[sortedActiveDates.length - 1];
      const lastKey = lastActive.toISOString().split('T')[0];
      const todayKey = today.toISOString().split('T')[0];
      const yesterdayKey = new Date(today.getTime() - 86400000).toISOString().split('T')[0];

      if (lastKey === todayKey) {
        currentStreak = tempStreak;
      } else if (lastKey === yesterdayKey) {
        currentStreak = 1;
      }
    }

    const accountAgeDays = firstActivityDate
      ? Math.floor((now.getTime() - new Date(firstActivityDate).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)) + 1
      : 1;

    // New: Define static "ideal" boundaries as constants (linear ramp-up model)
    const minHealthyHours = 1.0; // Slow zone floor
    const idealHoursRampDays = 21; // Days to reach full ideal
    const idealHours = Math.min(accountAgeDays / idealHoursRampDays * 4.0 + minHealthyHours, 5.0); // Linear: 1->5 over 21 days
    const maxHealthyHours = idealHours + 2.0; // Steady/intense ceiling
    const riskHours = maxHealthyHours + 3.0; // Risk starts here

    // Compute avg hours (already have last7DaysHours)
    const avgDailyHours = last7DaysHours.reduce((a, b) => a + b, 0) / 7;

    // Mood mapping to scores (static map, no if/else)
// Inside computeInsightsFromSteps — mood mapping (only your emojis)
const moodScoreMap: Record<string, number> = {
  '😴': 20,   // Tired
  '😕': 40,   // Confused
  '🙂': 70,   // Steady (default)
  '🚀': 90,   // Flow
  '🐢': 30,   // Stuck
};
    const moodScores = last7DaysMoods.map(m => moodScoreMap[m] ?? 70);
    const avgMoodScore = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;

    // Time score: Linear distance from ideal (0-100, penalized for deviation)
    const timeDeviation = Math.abs(avgDailyHours - idealHours);
    const timeScore = Math.max(0, 100 - (timeDeviation / idealHours) * 100); // Closer to ideal = higher score

    // Streak score: Linear saturation (0-100 based on consistency relative to age)
    const maxExpectedStreak = Math.min(accountAgeDays, 30); // Cap at 30 for sanity
    const streakScore = (currentStreak / maxExpectedStreak) * 100;

    // Mood score: Already avgMoodScore (0-100)

    // Total points: Weighted average (e.g., 40% time, 30% mood, 30% streak)
    const totalPoints = (0.4 * timeScore + 0.3 * avgMoodScore + 0.3 * streakScore);

    // Suggestion: Overlay user data on static ideals (adjust ideal linearly based on scores)
    const moodAdjustment = avgMoodScore / 100; // 0-1 scale
    const timeAdjustment = timeScore / 100; // Pull towards middle
    const streakBoost = Math.min(streakScore / 100, 0.5); // Max +50%
    const suggestedHours = idealHours * moodAdjustment * timeAdjustment * (1 + streakBoost);
    const clampedSuggested = Math.max(minHealthyHours, Math.min(suggestedHours, maxHealthyHours)); // Stay in healthy zone

const result: InsightsData = {
  totalStepsCompleted: totalCompleted,
  currentStreak,
  longestStreak,
  last7DaysHours,
  last7DaysMoods,
  accountAgeDays,
  currentAvgHours: avgDailyHours,  // <--- ADD THIS LINE (it's required by your interface)
  timeScore: Math.round(timeScore),
  moodScore: Math.round(avgMoodScore),
  streakScore: Math.round(streakScore),
  totalPoints: Math.round(totalPoints),
  suggestedHours: parseFloat(clampedSuggested.toFixed(1)),
};

    console.log('Computed insights:', result);
    return result;
  };

  // Main effect
useEffect(() => {
  const loadInsights = async () => {
    try {
      setLoading(true);

      const userId = localStorage.getItem('userId') || 'pseudo-user-123';
      
      // Cache key unique per user
      const cacheKey = `insights_${userId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const ageInMinutes = (Date.now() - timestamp) / (1000 * 60);
        
        if (ageInMinutes < 10) { // Fresh: under 10 minutes
          console.log('Insights loaded from cache 🐝');
          setInsights(data);
          setLoading(false);
          return; // Skip fetch
        }
      }

      console.log('Fetching fresh insights...');
      const response = await axios.get(`http://localhost:5000/api/roadmaps?userId=${userId}`);
      const roadmaps: Roadmap[] = response.data;

      const allSteps = roadmaps.flatMap(rm => rm.steps);
      const computedInsights = computeInsightsFromSteps(allSteps);

      // Cache it with timestamp
      localStorage.setItem(cacheKey, JSON.stringify({
        data: computedInsights,
        timestamp: Date.now()
      }));

      setInsights(computedInsights);
    } catch (error: any) {
      console.error('Error loading insights:', error);
      
      // Optional: fallback to old cache even if expired
      const cacheKey = `insights_${localStorage.getItem('userId') || 'pseudo-user-123'}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data } = JSON.parse(cached);
        setInsights(data);
        console.log('Using expired cache as fallback');
      }
    } finally {
      setLoading(false);
    }
  };

  loadInsights();
}, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-purple-900 flex items-center justify-center">
        <p className="text-3xl animate-pulse">Crunching your learning data... 🐝</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-purple-900 flex items-center justify-center flex-col text-white">
        <p className="text-2xl mb-6">No learning data yet — start buzzing! 🐝</p>
        <p className="text-xl">Complete your first step to see insights.</p>
      </div>
    );
  }

  const {
    totalStepsCompleted,
    currentStreak,
    longestStreak,
    last7DaysHours,
    last7DaysMoods,
    accountAgeDays,
  } = insights;

  const avgDailyHours = last7DaysHours.reduce((a, b) => a + b, 0) / 7;

  const isNewUser = accountAgeDays < 8;

  let intensityLevel: string, color: string, message: string;

  if (isNewUser) {
    if (avgDailyHours === 0) {
      intensityLevel = 'Just Starting Out 🐣';
      color = 'from-yellow-400 to-amber-500';
      message = 'Welcome to the hive! Even small steps count. Try 30 minutes today? 🐝';
    } else if (avgDailyHours < 2) {
      intensityLevel = 'Great Start!';
      color = 'from-green-400 to-emerald-500';
      message = "Awesome consistency! You're building the habit perfectly.";
    } else if (avgDailyHours < 4) {
      intensityLevel = 'Buzzing Along!';
      color = 'from-cyan-400 to-blue-500';
      message = 'Love the momentum! Keep it sustainable.';
    } else {
      intensityLevel = 'Impressive Early Dedication!';
      color = 'from-purple-500 to-pink-500';
      message = 'Wow, you\'re diving deep already! Remember to rest too 🐝';
    }
  } else {
    // Established user logic (same as your original, or my tweaked version)
    if (avgDailyHours < 2) {
      intensityLevel = 'Room for More Buzz';
      color = 'from-yellow-400 to-orange-500';
      message = 'Room to buzz more! Even 30 extra minutes can make a big difference.';
    } else if (avgDailyHours < 4) {
      intensityLevel = 'Solid Pace';
      color = 'from-green-400 to-teal-500';
      message = 'Solid progress — keep going!';
    } else if (avgDailyHours < 6) {
      intensityLevel = 'In the Sweet Spot';
      color = 'from-cyan-500 to-blue-600';
      message = 'Strong and steady — this is the sweet spot!';
    } else if (avgDailyHours < 8) {
      intensityLevel = 'Deep Flow State';
      color = 'from-indigo-500 to-purple-600';
      message = 'Outstanding dedication! You\'re in the zone.';
    } else if (avgDailyHours < 10) {
      intensityLevel = 'Power Learner';
      color = 'from-orange-500 to-red-500';
      message = 'Impressive dedication! Just watch for signs of fatigue.';
    } else {
      intensityLevel = 'Burnout Alert';
      color = 'from-red-600 to-pink-600';
      message = 'Warning: Risk of burnout – consider a rest day. Your brain needs recovery too! 🐝';
    }
  }

  const moodEmoji = last7DaysMoods[6] || '🙂';
  const moodMessage =
    moodEmoji === '🚀' ? 'You\'ve been in flow lately - amazing!' :
    moodEmoji === '🙂' ? 'Steady and positive - perfect pace.' :
    moodEmoji === '😕' ? 'Some confusion? Try reviewing basics or changing topics.' :
    moodEmoji === '🐢' ? 'Feeling stuck? Shorter sessions or a break might help.' :
    'Feeling tired? Rest is part of progress. Come back fresh! 🐝';

  // Return the same beautiful JSX as before, now with real data!
  return (
    // ... (your full return JSX from previous version, using the real variables)
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
      {/* Header and all cards — same as your original, just with real data */}
      {/* Paste the return from your original here, replacing mock vars with real ones */}
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl md:text-6xl font-bold text-center mb-12 mt-4">
          Your Learning Insights 🐝📊
        </h1>
                  {insights && (
  <>
    {/* NEW: Suggestion Banner at the top */}
<div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 shadow-2xl text-center mb-12 text-white border-2 border-white/30">
      <h2 className="text-3xl md:text-5xl font-bold mb-4">
        Today's Recommendation
      </h2>
<p className="text-2xl md:text-4xl font-semibold mb-3">
  {insights.accountAgeDays < 8 ? (
    insights.suggestedHours <= 1 ? (
      <>Get 30–60 minutes in today, and you're golden! 🐣</>
    ) : (
      <>Build momentum with 1–2 hours today — perfect start!</>
    )
  ) : insights.moodScore < 50 ? (
    <>Your energy is low - aim for just {insights.suggestedHours.toFixed(1)} hours or rest</>
  ) : insights.suggestedHours >= 5 ? (
    <>You're crushing it! Go for {insights.suggestedHours.toFixed(1)} hours if you feel great 🚀</>
  ) : (
    <>Steady and strong - target {insights.suggestedHours.toFixed(1)} hours today</>
  )}
</p>
      <p className="text-xl opacity-95 mt-4">
        {insights.accountAgeDays < 8
          ? "You're just starting — small consistent steps build big habits 🐣"
          : insights.moodScore < 50
          ? "Listen to your energy. Rest if needed, progress tomorrow 🐝"
          : insights.timeScore > 80
          ? "You're in a great rhythm — keep this sustainable pace! ✨"
          : "Steady wins. Adjust slightly to hit the sweet spot."}
      </p>
    </div>

    {/* Old intensity card — you can keep or simplify */}
    {/* <div className={`bg-gradient-to-br ${color} rounded-3xl p-10 shadow-2xl text-center mb-12`}>
      <h2 className="text-4xl font-bold mb-4">{intensityLevel}</h2>
      <p className="text-2xl mb-2">
        Average: {insights.currentAvgHours.toFixed(1)} hours/day (last 7 days)
      </p>
      <p className="text-xl opacity-90">{message}</p>
    </div> */}
  </>
)}

        <div className={`bg-gradient-to-br ${color} rounded-3xl p-10 shadow-2xl text-center mb-12 border-2 border-gray-400`}>
          <h2 className="text-4xl font-bold mb-4">{intensityLevel}</h2>
          <p className="text-2xl mb-2">Average: {avgDailyHours.toFixed(1)} hours/day (last 7 days)</p>
          <p className="text-xl opacity-90">{message}</p>
        </div>

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
            <p className="text-6xl mb-4">{moodEmoji}</p>
            <h3 className="text-3xl font-bold mb-2">Recent Mood</h3>
            <p className="text-xl opacity-90">{moodMessage}</p>
          </div>
        </div>

        {/* Motivational footer */}
        <div className="text-center">
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