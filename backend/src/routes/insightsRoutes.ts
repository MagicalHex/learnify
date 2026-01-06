// routes/insightsRoutes.ts
import express from 'express';
import Roadmap from '../models/Roadmap';

const router = express.Router();

// ############################
// HELPERS
// ###################
//  calculate hours from a single time log
const calculateHoursFromLog = (log: any): number => {
  let seconds = 0;

  if (log.manualFrom && log.manualTo) {
    // Create full dates by assuming same day (or use savedAt as base)
    const baseDate = log.savedAt ? new Date(log.savedAt) : new Date();
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const day = baseDate.getDate();

    // Parse HH:MM strings
    const parseTime = (timeStr: string): Date => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return new Date(year, month, day, hours, minutes);
    };

    const start = parseTime(log.manualFrom);
    const end = parseTime(log.manualTo);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      seconds = (end.getTime() - start.getTime()) / 1000;

      // Handle break
      if (log.manualBreakFrom && log.manualBreakTo) {
        const bStart = parseTime(log.manualBreakFrom);
        const bEnd = parseTime(log.manualBreakTo);
        if (!isNaN(bStart.getTime()) && !isNaN(bEnd.getTime())) {
          seconds -= (bEnd.getTime() - bStart.getTime()) / 1000;
        }
      }
    }
  }

  if (log.pausedTime) seconds -= log.pausedTime;

  return Math.max(0, seconds / 3600);
};
// TIME SENTIMENT
const getTimeGreeting = (date = new Date()) => {
  const hour = date.getHours();

  if (hour < 5) return 'Still awake 🌄';
    if (hour < 11) return 'Good morning 🐣';
  if (hour < 13) return 'Good lunch time ⛅';
    if (hour < 16) return 'Good afternoon 🐥';
  if (hour < 20) return 'Good evening 🌇';
  return 'Good evening';
};
const composeMessage = (
  baseMessage: string,
  hasWorkedToday: boolean
) => {
  if (hasWorkedToday) return baseMessage;

  const greeting = getTimeGreeting();
  return `${greeting} — ${baseMessage}`;
};

// PHRASES WITH HELPER
const pickRandom = <T,>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const freshStartMessages = [
  'Start gently — even 30–60 minutes counts as a strong start today.',
  'No pressure. 30–60 focused minutes is more than enough to begin.',
  'You decide the pace today. Even 30–60 minutes moves things forward.',
  'Set the tone lightly — 30–60 minutes is a perfectly valid start.',
  'Momentum starts small — 30–60 minutes is all it takes today.',
  'Nothing heavy required — 30–60 minutes is a great way to begin.',
  'Just ease in. A short 30–60 minute session is enough for today.',
  'Start light, but start. 30–60 minutes is the target.',
  'Today isn’t about intensity — 30–60 minutes does the job.',
];


// Cognitive load factors per category
const LOAD_FACTORS: Record<string, number> = {
  reading: 1.0,
  watching: 1.1,
  coding: 1.7,
  thinking: 2.0,
};

// Detect math-heavy roadmaps by title
const isMathRoadmap = (title: string = ''): boolean => {
  const mathKeywords = ['math', 'algebra', 'calculus', 'linear', 'ai', 'proof', 'geometry', 'statistics', 'discrete', 'machine learning', 'ml',
    'physics'
  ];
  return mathKeywords.some(keyword => title.toLowerCase().includes(keyword));
};

// Vector prototypes (expand as needed)
const prototypes = [
  {
    name: 'Beginner / Long Break',
    vector: [0.1, 0.1, 0.7, 0.8, 0.1, 1.0],
    suggestedEffective: 2.0,
    message: 'Welcome back! Ease in gently — start with 1–2 focused hours to rebuild momentum 🐣',
    intensity: 'Just Starting Out 🐣',
    gradient: 'from-yellow-400 to-amber-500',
  },
  {
  name: 'Beginner - Solid Start',
  vector: [0.3, 0.4, 0.7, 0.9, 0.1, 1.0],
  suggestedEffective: 3.0,
  message: 'Amazing first session! You’ve already put in solid work today — that’s how momentum starts 🔥',
  intensity: 'Strong Start 🐝',
  gradient: 'from-amber-500 to-orange-600',
},
{
  name: 'Beginner - Deep Dive',
  vector: [0.5, 0.6, 0.8, 0.95, 0.2, 1.0],
  suggestedEffective: 4.0,
  message: 'Whoa — you’re crushing it on your comeback! Deep focus detected. Ride this wave, but listen to your body tomorrow 🌊',
  intensity: 'Beginner on Fire 🔥',
  gradient: 'from-orange-600 to-red-600',
},
  {
    name: 'Stale / Low Activity',
    vector: [0.2, 0.15, 0.6, 0.6, 0.2, 0.0],
    suggestedEffective: 3.5,
    message: 'You are doing great! You can stop now, or buzz some more. Even 30–60 extra minutes today can spark progress.',
    intensity: 'Room for More Buzz',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    name: 'Healthy Balanced',
    vector: [0.5, 0.4, 0.75, 0.8, 0.6, 0.0],
    suggestedEffective: 5.5,
    message: 'Solid and sustainable pace — you’re in the sweet spot! Keep going strong.',
    intensity: 'In the Sweet Spot',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    name: 'Deep Flow',
    vector: [0.7, 0.6, 0.85, 0.9, 0.8, 0.0],
    suggestedEffective: 7.0,
    message: 'You’re in a beautiful flow state — amazing dedication! Keep riding the wave.',
    intensity: 'Deep Flow State',
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    name: 'Burnout Risk',
    vector: [0.85, 0.75, 0.4, 0.3, 0.9, 0.0],
    suggestedEffective: 3.0,
    message: 'Warning: High load detected — take a lighter day or rest. Recovery is progress too! 🐝',
    intensity: 'Burnout Alert',
    gradient: 'from-red-600 to-pink-600',
  },
];

// Main route
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const roadmaps = await Roadmap.find({ userId });
    if (roadmaps.length === 0) {
      return res.json({
        totalStepsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        last7DaysHours: [0, 0, 0, 0, 0, 0, 0],
        last7DaysMoods: ['🙂', '🙂', '🙂', '🙂', '🙂', '🙂', '🙂'],
        suggestedHours: 1.0,
        currentAvgHours: 0,
        timeScore: 50,
        moodScore: 70,
        streakScore: 0,
        totalPoints: 50,
        message: 'Welcome to the hive! Try your first session today 🐝',
        intensityLevel: 'Just Starting Out 🐣',
        colorGradient: 'from-yellow-400 to-amber-500',
      });
    }
    console.log('[Insights] Roadmaps fetched:', roadmaps.length);

roadmaps.forEach((rm, i) => {
  console.log(`Roadmap ${i}:`, {
    title: rm.title,
    stepsCount: rm.steps?.length || 0,
    stepsWithTimeLogs: rm.steps?.filter(s => s.timeLogs && s.timeLogs.length > 0).length || 0,
    sampleStepWithLogs: rm.steps?.find(s => s.timeLogs && s.timeLogs.length > 0) || null,
  });
});

const allSteps = roadmaps.flatMap((rm: any) => rm.steps || []);

console.log('[Insights] Total allSteps:', allSteps.length);
console.log('[Insights] Steps with timeLogs:', allSteps.filter(s => s.timeLogs?.length > 0).length);

const now = new Date();

// Use UTC for consistent "today" across timezones
const todayKey = now.toISOString().split('T')[0]; // e.g. '2026-01-05'

const today = new Date(todayKey + 'T00:00:00.000Z'); // optional, for comparisons

    // Aggregation
    const dailyRawHours: Record<string, number> = {};
    const dailyEffectiveLoad: Record<string, number> = {};
    const dailyMood: Record<string, { mood: string; savedAt: string }> = {};
    const activeDates = new Set<string>();
    let totalCompleted = 0;
    let recentLogDays = 0; // unique days in last 21 days
const recentCutoff = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
// This subtracts exactly 21 days, regardless of timezone/DST
    recentCutoff.setDate(today.getDate() - 21);

    allSteps.forEach((step: any) => {
      if (step.completed) totalCompleted++;

      step.timeLogs.forEach((log: any) => {
        const logDateStr = log.savedAt || log.manualFrom;
        if (!logDateStr) return;
        const logDate = new Date(logDateStr);
        if (isNaN(logDate.getTime())) return;

        const dateKey = logDate.toISOString().split('T')[0];
        const hours = calculateHoursFromLog(log);
        if (hours < 0.01) return;

        // Category + math override
        let category = step.category;
        const roadmapTitle = roadmaps.find((rm: any) => rm.steps.some((s: any) => s.id === step.id))?.title || '';
        if (isMathRoadmap(roadmapTitle)) {
          category = 'thinking';
        }
        const loadFactor = LOAD_FACTORS[category] || 1.5;

        dailyRawHours[dateKey] = (dailyRawHours[dateKey] || 0) + hours;
        dailyEffectiveLoad[dateKey] = (dailyEffectiveLoad[dateKey] || 0) + hours * loadFactor;
        activeDates.add(dateKey);

        // Latest mood per day
        const mood = log.mood || '🙂';
        const savedAt = log.savedAt || log.manualFrom || '';
        if (!dailyMood[dateKey] || savedAt > dailyMood[dateKey].savedAt) {
          dailyMood[dateKey] = { mood, savedAt };
        }

        // Count recent activity
        if (logDate >= recentCutoff) {
          const recentKey = logDate.toISOString().split('T')[0];
          if (!dailyRawHours[recentKey] || dailyRawHours[recentKey] === hours) { // first log of day
            recentLogDays++;
          }
        }
      });
    });

    console.log('[Insights RAW DATA]', {
      userId,
      totalSteps: allSteps.length,
      totalTimeLogs: allSteps.flatMap(s => s.timeLogs || []).length,
      sampleLogs: allSteps
        .flatMap(s => s.timeLogs || [])
        .slice(0, 10)
        .map(log => ({
          savedAt: log.savedAt,
          manualFrom: log.manualFrom,
          manualTo: log.manualTo,
          hours: calculateHoursFromLog(log),
          mood: log.mood || '🙂',
          parsedDate: log.savedAt ? new Date(log.savedAt).toISOString() : 
                     log.manualFrom ? new Date(log.manualFrom).toISOString() : 'INVALID',
        })),
      dailyRawHoursKeys: Object.keys(dailyRawHours).sort(),
      dailyRawHoursValues: Object.fromEntries(
        Object.entries(dailyRawHours)
          .sort()
          .map(([k, v]) => [k, parseFloat((v as number).toFixed(2))])
      ),
      todayKey: today.toISOString().split('T')[0],
      todayRawHours: dailyRawHours[today.toISOString().split('T')[0]] || 0,
      activeDates: Array.from(activeDates).sort(),
      recentLogDays,
      recentCutoff: recentCutoff.toISOString().split('T')[0],
      isBeginnerMode: recentLogDays < 3,
    });

    // Last 7 days (index 0 = 6 days ago, index 6 = today)
    const last7DaysRawHours: number[] = [];
    const last7DaysEffective: number[] = [];
    const last7DaysMoods: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const key = day.toISOString().split('T')[0];
      last7DaysRawHours.push(parseFloat((dailyRawHours[key] || 0).toFixed(2)));
      last7DaysEffective.push(parseFloat((dailyEffectiveLoad[key] || 0).toFixed(2)));
      last7DaysMoods.push(dailyMood[key]?.mood || '🙂');
    }

    // Current streak
    const sortedActive = Array.from(activeDates).map(d => new Date(d)).sort((a, b) => +a - +b);
    let currentStreak = 0;
    if (sortedActive.length > 0) {
      const lastActive = sortedActive[sortedActive.length - 1];
      const lastKey = lastActive.toISOString().split('T')[0];
      const todayKey = today.toISOString().split('T')[0];
      const yesterdayKey = new Date(today.getTime() - 86400000).toISOString().split('T')[0];

      let temp = 1;
      for (let i = sortedActive.length - 1; i > 0; i--) {
        const diff = (sortedActive[i].getTime() - sortedActive[i - 1].getTime()) / 86400000;
        if (Math.abs(diff - 1) < 0.1) temp++;
        else break;
      }
      if (lastKey === todayKey || lastKey === yesterdayKey) {
        currentStreak = temp;
      }
    }

    // Beginner mode
    const isBeginnerMode = recentLogDays < 3;

    // Mood scoring
    const moodMap: Record<string, number> = { '😴': 0.2, '😕': 0.4, '🐢': 0.3, '🙂': 0.7, '🚀': 0.9 };
    const moodScores = last7DaysMoods.map(m => moodMap[m]);
    const avgMoodScore = moodScores.reduce((a, b) => a + b, 0) / 7;
    const todayMoodScore = moodScores[6];

    // Vector
    const normalize = (val: number, min: number, max: number) => 
      Math.max(0, Math.min(1, (val - min) / (max - min)));

    const avgEffective = last7DaysEffective.reduce((a, b) => a + b, 0) / 7;
const todayEffective = last7DaysEffective[6];

const hasWorkedToday = todayEffective > 0.05; // This checks if user has any hours input today (if not, display 'Welcome ..')


    const userVector = [
      normalize(avgEffective, 0, 10),        // 0: 7-day average effective hours (0–1)
      normalize(todayEffective, 0, 8),       // 1: Today's effective hours (0–1)
      avgMoodScore,                          // 2: Average mood last 7 days (0–1)
      todayMoodScore * 1.3,                  // 3: Today's mood, boosted (0–1.3 capped)
      normalize(currentStreak, 0, 21),       // 4: Streak strength (0–1)
      isBeginnerMode ? 1 : 0,                // 5: Is this a new/low-activity user? (1 = yes)
    ];

    // Find best prototype
    const cosineSimilarity = (a: number[], b: number[]) => {
      const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
      const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
      return magA && magB ? dot / (magA * magB) : 0;
    };

let best;

if (!hasWorkedToday) {
  const message = pickRandom(freshStartMessages);

  best = {
    name: 'Fresh Start',
    suggestedEffective: isBeginnerMode ? 1.5 : 2.0,
    message: message, // no greeting here
    intensity: 'Fresh Start',
    gradient: 'from-yellow-300 to-orange-400',
  };
} else {
  let bestSim = -1;
  best = prototypes[2]; // fallback

  prototypes.forEach(p => {
    const sim = cosineSimilarity(userVector, p.vector);
    if (sim > bestSim) {
      bestSim = sim;
      best = p;
    }
  });
}

    // Final suggestion
    let suggestedEffective = isBeginnerMode ? 2.0 : best.suggestedEffective;
    if (todayMoodScore < 0.5) suggestedEffective *= 0.7; // tired override

    // Use next step's category for final hours (fallback to thinking if unknown)
    // You can improve this by finding current/active step
// Use "0-2 hours" instead of "2.0 hours"
let targetEffective = isBeginnerMode ? 2.0 : best.suggestedEffective;
if (todayMoodScore < 0.5) targetEffective *= 0.7;

// Conservative default load factor (thinking = highest cognitive load)
const nextLoadFactor = 2.0;

// Compute the raw hour equivalent of the target effective load
let targetRawHours = targetEffective / nextLoadFactor;

// Now create a friendly upper-bound range: 0–X hours
// Round up slightly for nicer numbers (e.g., 1.2 → 2, 2.8 → 3, 4.7 → 5)
const upperHours = Math.ceil(targetRawHours);

// But don't suggest 0–1 if we're recommending more than ~0.8
// And cap minimum at 1 for very low suggestions (so we don't say 0–0 😂)
const minUpper = targetRawHours < 0.8 ? 1 : Math.max(1, upperHours);

// Special case: if very low (beginner + tired), allow 0–1 or 0–2
const finalUpper = targetRawHours < 1.2 ? (targetRawHours < 0.6 ? 1 : 2) : minUpper;

const suggestedHoursRange = `0–${finalUpper} hours`;

    // Scores
    const currentAvgHours = parseFloat((last7DaysRawHours.reduce((a, b) => a + b, 0) / 7).toFixed(2));
    const timeScore = Math.round(100 - Math.abs(avgEffective - 5.5) * 10);
    const moodScore = Math.round(avgMoodScore * 100);
    const streakScore = Math.round((currentStreak / 21) * 100);
    const totalPoints = Math.round(0.4 * timeScore + 0.3 * moodScore + 0.3 * streakScore);

    // Find the absolute latest time log timestamp
    let latestLogTimestamp: string | null = null;
    let maxTimestamp = 0;

    allSteps.forEach((step: any) => {
      step.timeLogs.forEach((log: any) => {
        const tsStr = log.savedAt || log.manualFrom || log.manualTo;
        if (tsStr) {
          const ts = new Date(tsStr).getTime();
          if (ts > maxTimestamp) {
            maxTimestamp = ts;
            latestLogTimestamp = tsStr;
          }
        }
      });
    });

    // Response
    res.json({
      totalStepsCompleted: totalCompleted,
      currentStreak,
      longestStreak: currentStreak, // or compute longest if you want
      last7DaysHours: last7DaysRawHours,
      last7DaysMoods,
suggestedHours: suggestedHoursRange,
      currentAvgHours,
      timeScore,
      moodScore,
      streakScore,
      totalPoints,
      // message: best.message,
        message: composeMessage(best.message, hasWorkedToday),
      intensityLevel: best.intensity,
      colorGradient: best.gradient,
      latestLogTimestamp, // ISO string or null
      justFinishedSession: false // we let frontend decide — simpler and safer
    });

  } catch (error: any) {
    console.error('Insights computation error:', error);
    res.status(500).json({ message: 'Failed to compute insights' });
  }
});

export default router;