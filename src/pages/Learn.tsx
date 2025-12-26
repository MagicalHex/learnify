// ------------------------------------------------------------
// src/pages/Learn.tsx
// ------------------------------------------------------------
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useDebounce } from '@/utils/debounce';

// Reuse the same types as your Roadmap page (or define here if not shared)
interface Step {
  id: string;
  title: string;
  category: 'reading' | 'watching' | 'coding' | 'thinking';
  difficulty: number;
  estimatedTime?: string;
  link?: string; // optional for now
  completed: boolean;
}

interface Roadmap {
  id: string;
  userId: string;
  title: string;
  steps: Step[];
  lastUpdated: string;
}

interface LearningRoadmap extends Roadmap {
  currentStepId: string; // Tracks where the user is
}

// For writing new data
interface StepSummary {
  id: string;
  text: string;
  createdAt: string;
  savedText?: string;   // last version successfully saved to backend (optional)
  isSaving?: boolean;   // optional: for UI feedback
}

  // ---------------------
  // RANDOM PLACEHOLDER SUMMARIES
  // ---------------------
const summaryPlaceholders = [
  "Explain this in your own words…",
  "If you had to explain this to a friend, what would you say?",
  "Write a recap you’d want to read later.",
  "Summarize the core idea in plain language.",
  "What’s the main takeaway from this?",
  "Explain the concept as simply as possible.",
  "Your summary of “{title}”.",
  "Write a recap future-you will thank you for.",
  "Describe what you just learned without using jargon.",
  "What would you say if someone asked you about this?",
  "Make a clear summary you can reuse for revision.",
];

const getRandomSummaryPlaceholder = (title: string) => {
  const raw =
    summaryPlaceholders[
      Math.floor(Math.random() * summaryPlaceholders.length)
    ];

  return raw.replace("{title}", title);
};


const Learn = ({ onExit }: { onExit: () => void }) => {
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [chosenStepId, setChosenStepId] = useState<string | null>(null);

  // ################
  // FOR LOADING AND DISPLAYING STEPS
  // ################

// Per-step data (much better than global shared state)
const [stepData, setStepData] = useState<Record<string, {
  startTime?: number;
  pausedTime?: number;
  isRunning: boolean;
  showTimer: boolean;
  timerEvents?: { type: 'start' | 'pause'; at: number }[];
  summaries: StepSummary[];
  summaryPlaceholder?: string;
  completed: boolean;
  // manual inputs
  showManualTime?: boolean;
  manualDate?: string;
  manualFrom?: string;
  manualTo?: string;
  manualBreakFrom?: string; // ← added
  manualBreakTo?: string;   // ← added
  manualTime?: string;
}>>({});



// Initialize when step is first expanded
const ensureStepData = (stepId: string, stepTitle?: string) => {
  if (!stepData[stepId]) {
    setStepData(prev => ({
      ...prev,
      [stepId]: {
        startTime: undefined,
        pausedTime: 0,
        isRunning: false,
        showTimer: false,
        summaries: [
          {
            id: crypto.randomUUID(),
            text: '',
            createdAt: new Date().toISOString(),
          }
        ],
        summaryPlaceholder: stepTitle
          ? getRandomSummaryPlaceholder(stepTitle)
          : undefined,
        completed: false,
      }
    }));
  }
};

// Update any field
const updateStepData = (stepId: string, updates: Partial<typeof stepData[string]>) => {
  ensureStepData(stepId);
  setStepData(prev => ({
    ...prev,
    [stepId]: { ...prev[stepId], ...updates }
  }));
};

const stepRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});
// Set step id and expand step
const handleStepClick = async (stepId: string, stepTitle: string) => {
  const nextId = chosenStepId === stepId ? null : stepId;

  if (nextId) {
    // Only fetch if we don't already have data for this step
    if (!stepData[stepId]) {
      const savedSummaries = await fetchStepSummaries(stepId);

      if (savedSummaries && savedSummaries.length > 0) {
        // Load from server
        setStepData(prev => ({
          ...prev,
          [stepId]: {
            startTime: undefined,
            pausedTime: 0,
            isRunning: false,
            showTimer: false,
            summaries: savedSummaries,
            summaryPlaceholder: getRandomSummaryPlaceholder(stepTitle),
            completed: false, // you can also load this from backend later
          }
        }));
      } else {
        // Nothing saved → create fresh local one
        setStepData(prev => ({
          ...prev,
          [stepId]: {
            startTime: undefined,
            pausedTime: 0,
            isRunning: false,
            showTimer: false,
            summaries: [
              {
                id: crypto.randomUUID(),
                text: '',
                savedText: '', // nothing saved yet
                createdAt: new Date().toISOString(),
              }
            ],
            summaryPlaceholder: getRandomSummaryPlaceholder(stepTitle),
            completed: false,
          }
        }));
      }
    }
// Scroll into view smoothly
    setTimeout(() => {
      stepRefs.current[stepId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100); // small delay to allow expand animation
  }

  setChosenStepId(nextId);
};

// ################
// FOR SAVING TIME
// ################

// Perform check
const canSaveTime = (step: typeof stepData[string] | undefined) => {
  if (!step) return false;

  const hasValidManual =
    step.manualFrom &&
    step.manualTo &&
    step.manualFrom !== step.manualTo;

  const hasValidTimer =
    (step.timerEvents?.length ?? 0) >= 2;

  return Boolean(hasValidManual || hasValidTimer);
};
// Save time
const saveTime = async (stepId: string, source: 'timer' | 'manual') => {
    const step = stepData[stepId];

  if (!canSaveTime(step)) {
    console.warn('[saveTime] blocked – no valid time data');
    return;
  }

  // 1️⃣ Run the appropriate save method
  if (source === 'timer') {
    saveTimerTime(stepId);
  } else {
    saveManualTime(stepId);
  }
  const userId = localStorage.getItem('userId') || 'pseudo-user-123';

  if (!step) {
    console.warn('[saveTime] step not found', stepId);
    return;
  }

  // 2️⃣ Post the collected data
  try {
    const payload = {
      userId,
      stepId,
      roadmapId: roadmaps.find(rm => rm.steps.some(s => s.id === stepId))?.id,
      timerEvents: step.timerEvents ?? [],
      manualFrom: step.manualFrom,
      manualTo: step.manualTo,
      manualBreakFrom: step.manualBreakFrom,
      manualBreakTo: step.manualBreakTo,
      pausedTime: step.pausedTime ?? 0,
      timestamp: Date.now(), // optional: record when saved
    };

    const response = await axios.post('http://localhost:5000/api/saveStepTime', payload);
    console.log('[saveTime] posted successfully:', response.data);
  } catch (err) {
    console.error('[saveTime] failed to post:', err);
  }

  // 3️⃣ Reset the timer for next run
  resetStepTime(stepId);
  // updateStepData(stepId, {
  //   isRunning: false,
  //   startTime: undefined,
  //   pausedTime: 0,
  //   timerEvents: [],
  //   showTimer: false,
  // });

  // 4️⃣ Optional debug
  console.log('[saveTime] completed', stepId);
};
const resetStepTime = (stepId: string) => {
  setStepData(prev => ({
    ...prev,
    [stepId]: {
      ...prev[stepId],

      // timer
      startTime: undefined,
      pausedTime: 0,
      isRunning: false,
      timerEvents: [],

      // manual
      manualDate: undefined,
      manualFrom: undefined,
      manualTo: undefined,
      manualBreakFrom: undefined,
      manualBreakTo: undefined,

      showManualTime: false,
    }
  }));

  console.log('[resetStepTime] cleared state for', stepId);
};

// SAVE SUMMARY
const saveSummaryToBackend = async (stepId: string, summaryId: string, currentText: string, savedText: string | undefined) => {
  const trimmed = currentText.trim();

  // Don't save if empty AND was already empty, or if text hasn't changed
  if (trimmed.length === 0) {
    // Optionally clear it on backend if it was previously saved?
    // Usually better to keep old summary if user clears temporarily
    return;
  }

  if (trimmed === savedText) {
    // No change → do nothing
    return;
  }

  const userId = localStorage.getItem('userId') || 'pseudo-user-123';
  const roadmapId = roadmaps.find(rm => rm.steps.some(s => s.id === stepId))?.id;

  try {
    await axios.post('http://localhost:5000/api/saveStepSummary', {
      userId,
      stepId,
      summaryId,
      text: trimmed,
      roadmapId,
      timestamp: Date.now(),
    });

    // After success, update the savedText in state
    setStepData(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        summaries: prev[stepId].summaries.map(s =>
          s.id === summaryId ? { ...s, savedText: trimmed } : s
        )
      }
    }));

    console.log('[saveSummary] saved');
  } catch (err) {
    console.error('[saveSummary] error', err);
    // Optionally show toast/error
  }
};

// Create debounced version (2 second delay)
const debouncedSaveSummary = useDebounce(
  (stepId: string, summaryId: string, currentText: string, savedText: string | undefined) =>
    saveSummaryToBackend(stepId, summaryId, currentText, savedText),
  2000
);

const saveStepCompletion = async (stepId: string, completed: boolean) => {
  const userId = localStorage.getItem('userId') || 'pseudo-user-123';
  const roadmapId = roadmaps.find(rm => rm.steps.some(s => s.id === stepId))?.id;

  if (!roadmapId) return;

  try {
    await axios.post('http://localhost:5000/api/saveStepCompletion', {
      userId,
      stepId,
      roadmapId,
      completed,
    });
    console.log('[completion] saved');
  } catch (err) {
    console.error('[completion] save failed', err);
    // Optional: revert local state on failure
    // Or show toast: "Failed to save — will retry later"
  }
};

// ################
// Saving methods
// ################

// Save manually added time 2025-12-12 13.03 - 2025-12-12 14.03
const saveManualTime = (stepId: string) => {
  const d = stepData[stepId];
  if (!d?.manualDate || !d.manualFrom || !d.manualTo) return;

  const start = new Date(`${d.manualDate}T${d.manualFrom}`).getTime();
  const end   = new Date(`${d.manualDate}T${d.manualTo}`).getTime();

  console.log('Saving manual timestamps:', [
    { type: 'start', at: start },
    { type: 'pause', at: end }
  ]);

  updateStepData(stepId, {
    pausedTime: Math.floor((end - start) / 1000),
    isRunning: false,
    startTime: undefined,
    showManualTime: false,
    showTimer: false
  });
};


const saveTimerTime = (stepId: string) => {
  const d = stepData[stepId];
  if (!d?.timerEvents || d.timerEvents.length === 0) return;

  console.log('Saving timer timestamps:', d.timerEvents);

  updateStepData(stepId, {
    pausedTime: getElapsedTime(stepId), // keep for UI continuity
    isRunning: false,
    startTime: undefined,
    showTimer: false,
    timerEvents: [] // clear after save
  });
};


// Get current elapsed time (accurate even after pause/resume)
const getElapsedTime = (stepId: string) => {
  const data = stepData[stepId];
  if (!data) return 0;

  const base = data.pausedTime || 0;
  if (!data.isRunning || !data.startTime) return base;

  return base + Math.floor((Date.now() - data.startTime) / 1000);
};

// Format seconds → MM:SS
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// Toggle timer (start/pause)
const toggleTimer = (stepId: string) => {
  ensureStepData(stepId);

  setStepData(prev => {
    const d = prev[stepId];
    const now = Date.now();

    const events = d.timerEvents ?? [];

    if (d.isRunning) {
      // pause
      return {
        ...prev,
        [stepId]: {
          ...d,
          pausedTime: getElapsedTime(stepId),
          isRunning: false,
          startTime: undefined,
          timerEvents: [...events, { type: 'pause', at: now }]
        }
      };
    } else {
      // start
      return {
        ...prev,
        [stepId]: {
          ...d,
          startTime: now,
          isRunning: true,
          timerEvents: [...events, { type: 'start', at: now }]
        }
      };
    }
  });
};


// ################
// HIDE AND SHOW 
// ################

// timer
const setShowTimer = (stepId: string, show: boolean) => {
  ensureStepData(stepId);
  setStepData(prev => ({
    ...prev,
    [stepId]: { ...prev[stepId], showTimer: show }
  }));
};

// static time
const setShowManualTime = (stepId: string, show: boolean) => {
  ensureStepData(stepId);
  setStepData(prev => ({
    ...prev,
    [stepId]: { ...prev[stepId], showManualTime: show }
  }));
};

// Manual time add
useEffect(() => {
  if (!chosenStepId) return;

  const stepId = chosenStepId;
  const step = stepData[stepId];

  // Only initialize if manualFrom/manualTo not yet set
  if (!step?.showManualTime || step?.manualFrom || step?.manualTo) return;

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  const from = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const to = `${pad(oneHourLater.getHours())}:${pad(oneHourLater.getMinutes())}`;

  updateStepData(stepId, {
    manualDate: now.toISOString().slice(0, 10),
    manualFrom: from,
    manualTo: to,
  });
}, [chosenStepId, stepData]);

// To update timer every second in UI
const [, forceTick] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    forceTick(t => t + 1);
  }, 1000);
  return () => clearInterval(interval);
}, []);

// ################ 
// FETCH DATA
// ################

// Call this when clicking a step
const fetchStepSummaries = async (stepId: string): Promise<StepSummary[] | null> => {
  const userId = localStorage.getItem('userId') || 'pseudo-user-123';
  const roadmapId = roadmaps.find(rm => rm.steps.some(s => s.id === stepId))?.id;

  if (!roadmapId) return null;

  try {
    const response = await axios.get('http://localhost:5000/api/getStepSummaries', {
      params: { userId, stepId, roadmapId }
    });

    if (response.data && Array.isArray(response.data.summaries) && response.data.summaries.length > 0) {
      return response.data.summaries.map((s: any) => ({
        id: s.summaryId,
        text: s.text || '',
        savedText: s.text || '', // important: mark as already saved
        createdAt: s.timestamp || new Date().toISOString(),
      }));
    }
    return null; // nothing saved yet
  } catch (err) {
    console.error('[fetchStepSummaries] error', err);
    return null; // fail silently, fall back to local
  }
};

  // FETCH REAL ROADMAPS FROM BACKEND, ON COMPONENT LOAD
  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const userId = localStorage.getItem('userId') || 'pseudo-user-123';
        const response = await axios.get(`http://localhost:5000/api/roadmaps?userId=${userId}`);
        
        // Transform to LearningRoadmap: default currentStepId to first step
        const transformed: LearningRoadmap[] = response.data.map((rm: Roadmap) => ({
          ...rm,
          currentStepId: rm.steps[0]?.id || '',
        }));
        
        setRoadmaps(transformed);
      } catch (error) {
        console.error('Failed to fetch roadmaps:', error);
        setRoadmaps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  const selectedRoadmap = roadmaps.find((rm) => rm.id === selectedRoadmapId);

  

  // ---------------------
  // SELECTED ROADMAP
  // ---------------------
  if (selectedRoadmap) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white overflow-y-auto">
  {/* Full-width Sticky Header (fixed to viewport) */}
{/* Full-width Sticky Header */}
<div className="sticky top-0 z-10 pb-2 mb-4">
  {/* Backdrop */}
  <div className="absolute left-0 right-0 top-0 h-full bg-black/20 backdrop-blur-sm shadow-md rounded-b-2xl"></div>
  
  {/* Use ul/li properly */}
  <ul className="relative px-2 pt-4">
    {/* Row 1: Back button + empty right side */}
    <li className="flex justify-between items-center">
      <button
        className="text-2xl opacity-95 bg-gradient-to-b from-green-900 via-green-600 to-green-900 hover:via-blue-700 rounded-full w-12 h-12 shadow-xl border border-green-700 flex items-center justify-center transition-all hover:scale-105"
        onClick={() => setSelectedRoadmapId(null)}
      >
        ←
      </button>
      <h1 className="text-2xl md:text-3xl font-bold absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-shadow-lg">
        {selectedRoadmap.title}
      </h1>
    </li>

    {/* Row 2: Centered title */}
    {/* <li className="text-center mb-3">
      <h1 className="text-3xl md:text-4xl font-bold whitespace-nowrap overflow-hidden text-ellipsis">
        {selectedRoadmap.title}
      </h1>
    </li> */}

    {/* Row 3: Steps - small and subtle */}
    <li className="text-center">
      <p className="text-base opacity-80">
        {selectedRoadmap.steps.length} steps
      </p>
    </li>
  </ul>
</div>

        {/* <h1 className="text-5xl font-bold mb-4">{selectedRoadmap.title}</h1> */}

        {/* Read-only steps list */}
<ul className="space-y-4 mb-12">
  {selectedRoadmap.steps.map((step) => {
    const isActive = step.id === selectedRoadmap.currentStepId;
    const isChosen = step.id === chosenStepId;

    return (
<li
  key={step.id}
ref={(el) => {
    stepRefs.current[step.id] = el;  // ← Assign, but DON'T return anything
  }}  // ← TO SCROLL INTO PLACE WHEN CLICKING STEP
  className={`p-5 rounded-xl transition
    ${
      step.completed
        ? 'border-2 border-yellow-400/40 bg-green-800/40 opacity-60'
        : isChosen || isActive
          ? 'bg-green-800/60 border-2 border-green-400'
          : 'bg-white/5 hover:bg-white/10'
    }
  `}
>
        {/* Title area clickable (expand/close) */}
<div
  onClick={() => handleStepClick(step.id, step.title)}
  className="cursor-pointer"
>
  <h3 className="text-xl font-semibold">{step.title}</h3>
  <p className="text-sm capitalize mt-1 opacity-80">{step.category}</p>

  {step.link && (
    <a
      href={step.link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-300 underline text-sm"
      onClick={(e) => e.stopPropagation()}
    >
      Open link →
    </a>
  )}
</div>


        {/* Expanded content */}
{isChosen && (
  <div className="mt-6 pt-6 border-t border-white/20 space-y-6">

    {/* Complete step */}
<button
  onClick={(e) => {
    e.stopPropagation();

    const newCompleted = !step.completed;

    // 1. Optimistic update: Update the roadmap in state (this triggers re-render with new value)
    setRoadmaps(prevRoadmaps =>
      prevRoadmaps.map(rm =>
        rm.id === selectedRoadmap?.id
          ? {
              ...rm,
              steps: rm.steps.map(s =>
                s.id === step.id
                  ? { ...s, completed: newCompleted }
                  : s
              )
            }
          : rm
      )
    );

    // 2. Optional: Also keep stepData in sync (if you use it elsewhere)
    updateStepData(step.id, { completed: newCompleted });

    // 3. Save to backend (fire and forget — UI already updated)
    saveStepCompletion(step.id, newCompleted);
  }}
  className={`flex flex-col items-center p-3 rounded-xl transition m-auto mb-5
    ${step.completed
      ? 'bg-emerald-700/40 border-2 border-yellow-400/80 hover:bg-emerald-700/50'
      : 'bg-white/10 border border-white/20 hover:bg-white/20'
    }`}
>
  <span className="text-3xl mb-1">
    {step.completed ? '💪' : '☐'}
  </span>
  <span className="text-xs opacity-80">
    {step.completed ? 'Completed' : 'Not completed'}
  </span>
</button>


    {/* Action Bar with Emoji Buttons */}
{/* Action Bar with Emoji Buttons */}
<div className="flex flex-wrap gap-3 justify-center">

  <button
    onClick={(e) => {
      e.stopPropagation();
      setShowTimer(step.id, !stepData[step.id]?.showTimer);
      // hide manual input if timer is shown
      setShowManualTime(step.id, false);
    }}
    className="flex flex-col items-center p-3 bg-white/10 rounded-xl hover:bg-white/20 transition"
  >
    
    <span className="text-3xl mb-1">⏱️</span>
    <span className="text-xs opacity-80">
      {stepData[step.id]?.showTimer ? 'Hide' : 'Start'} Timer
    </span>
  </button>

  <button
    onClick={(e) => {
      e.stopPropagation();
      setShowManualTime(step.id, !stepData[step.id]?.showManualTime);
      // hide live timer when showing manual input
      setShowTimer(step.id, false);
    }}
    className="flex flex-col items-center p-3 bg-white/10 rounded-xl hover:bg-white/20 transition"
  >
    <span className="text-3xl mb-1">🕒</span>
    <span className="text-xs opacity-80">
      Add Time
    </span>
  </button>
</div>

{/* Timer */}
{stepData[step.id]?.showTimer && (
  <div className="py-4 bg-black/20 rounded-xl space-y-4">

    {/* Time row */}
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleTimer(step.id);
          setShowManualTime(step.id, false);
        }}
        className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition"
      >
        <span className="text-3xl">
          {stepData[step.id]?.isRunning ? '⏸️' : '▶️'}
        </span>
      </button>

      <div className="text-5xl font-mono tracking-wider">
        {formatTime(getElapsedTime(step.id))}
      </div>
    </div>

    <p className="text-sm opacity-70 text-center">
      started{' '}
      {stepData[step.id]?.startTime
        ? new Date(stepData[step.id].startTime!).toLocaleTimeString()
        : '—'}
    </p>

    {/* Save time */}
    <div className="flex justify-center">
      <button
        onClick={(e) => {
          e.stopPropagation();
          saveTime(step.id, 'timer');
        }}
        className="px-4 py-2 bg-green-600 rounded-xl hover:bg-green-500 text-sm"
      >
        Save time
      </button>
    </div>
  </div>
)}

{/* Manual Input Display */}
{stepData[step.id]?.showManualTime && (
  <div
    className="py-4 px-4 bg-black/20 rounded-xl flex flex-col items-center gap-4"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Date */}
    <input
      type="date"
      className="p-2 rounded-xl bg-white/10 border border-white/20 text-sm"
      value={
        stepData[step.id]?.manualDate ||
        new Date().toISOString().slice(0, 10)
      }
      onChange={(e) =>
        updateStepData(step.id, { manualDate: e.target.value })
      }
    />

    {/* Time range */}
    <div className="flex items-center gap-3">
      <input
        type="time"
        className="p-2 rounded-xl bg-white/10 border border-white/20 text-sm"
        value={stepData[step.id]?.manualFrom || ''}
        onChange={(e) =>
          updateStepData(step.id, { manualFrom: e.target.value })
        }
      />

      <span className="opacity-60 text-sm">→</span>

      <input
        type="time"
        className="p-2 rounded-xl bg-white/10 border border-white/20 text-sm"
        value={stepData[step.id]?.manualTo || ''}
        onChange={(e) =>
          updateStepData(step.id, { manualTo: e.target.value })
        }
      />
    </div>

    {/* Break */}
<div className="flex flex-col items-center gap-2">
  <span className="text-xs opacity-60">Break</span>

  <div className="flex items-center gap-3">
    <input
      type="time"
      className="p-2 rounded-xl bg-white/10 border border-white/20 text-sm"
      value={stepData[step.id]?.manualBreakFrom || ''}
      onChange={(e) =>
        updateStepData(step.id, { manualBreakFrom: e.target.value })
      }
    />

    <span className="opacity-60 text-sm">→</span>

    <input
      type="time"
      className="p-2 rounded-xl bg-white/10 border border-white/20 text-sm"
      value={stepData[step.id]?.manualBreakTo || ''}
      onChange={(e) =>
        updateStepData(step.id, { manualBreakTo: e.target.value })
      }
    />
  </div>
</div>


    {/* Save */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        saveTime(step.id, 'manual');
      }}
      className="mt-2 px-5 py-2 bg-green-600/80 rounded-xl hover:bg-green-500 transition text-sm"
    >
      Save time
    </button>
  </div>
)}

{/* Summary Section */}
<div className="space-y-3">
  <p className="text-lg font-medium">What did you learn?</p>

{(stepData[step.id]?.summaries || []).map((summary) => (
  <textarea
    key={summary.id}
    value={summary.text}
    onClick={(e) => e.stopPropagation()}
onChange={(e) => {
  const value = e.target.value;

  setStepData(prev => ({
    ...prev,
    [step.id]: {
      ...prev[step.id],
      summaries: prev[step.id].summaries.map(s =>
        s.id === summary.id ? { ...s, text: value } : s
      )
    }
  }));

  // Only schedule save if there's potentially something to save
  if (value.trim().length > 0) {
    const savedText = stepData[step.id]?.summaries.find(s => s.id === summary.id)?.savedText;
    debouncedSaveSummary(step.id, summary.id, value, savedText);
  }
  // If empty, do nothing — don't cancel, just let it not trigger
}}
onBlur={(e) => {
  const value = e.target.value.trim();

  // Only attempt save if there's non-empty content
  if (value.length === 0) return;

  // Get the last saved version for comparison
  const currentSummary = stepData[step.id]?.summaries.find(s => s.id === summary.id);
  const savedText = currentSummary?.savedText;

  // If text hasn't changed from what was last saved, no need to save
  if (value === savedText) return;

  // Trigger the debounced save (it will also re-check inside, but this avoids unnecessary scheduling)
  debouncedSaveSummary(step.id, summary.id, e.target.value, savedText);
}}
    placeholder={
      stepData[step.id]?.summaryPlaceholder ||
      "Explain this in your own words…"
    }
    className="
      w-full p-2 rounded-xl border resize-y
      bg-white/10 border-white/20 transition-all duration-300
      min-h-[50px] focus:min-h-[400px] focus:border-green-400/50
    "
  />
))}
</div>

  </div>
)}
      </li>
    );
  })}
</ul>

      </div>
    );
  }

  // Main view: list of active learning roadmaps or fallback
  // ---------------------
  // MAIN VIEW
  // ---------------------
  return (
    <div className="w-full h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white overflow-y-auto">
  {/* Full-width Sticky Header (fixed to viewport) */}
  <div className="sticky top-0 z-10 pb-2">
    {/* Backdrop: full viewport width, not scroll width */}
    <div className="absolute left-0 right-0 top-0 h-full bg-black/20 backdrop-blur-sm shadow-md rounded-b-2xl"></div>
    
    {/* Content with safe padding */}
    <div className="relative flex items-center justify-between px-2 py-4">
      {/* Back button */}
      <button
        className="text-2xl opacity-95 bg-gradient-to-b from-green-900 via-green-600 to-green-900 hover:via-blue-700 rounded-full w-12 h-12 shadow-xl border border-green-700 flex items-center justify-center transition-all hover:scale-105"
        onClick={onExit}
      >
        ←
      </button>

      {/* Centered title */}
      <h1 className="text-2xl md:text-3xl font-bold absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-shadow-lg">
        What to learn
      </h1>

      {/* Spacer to balance layout */}
      <div className="w-12 h-12"></div>
    </div>
  </div>

  {/* Main content - add horizontal padding */}
  <div className="px-2 pt-2 pb-2">
    {loading ? (
      <p className="text-xl opacity-80 text-center mt-20">Loading your learning sessions...</p>
    ) : roadmaps.length === 0 ? (
      <div className="text-center mt-20">
        <p className="text-3xl opacity-90 mb-8">
          You don't have anything to learn yet, visit Roadmaps!
        </p>
        <div className="text-6xl">🐝</div>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-2">
        {roadmaps.map((roadmap) => (
          <button
            key={roadmap.id}
            onClick={() => setSelectedRoadmapId(roadmap.id)}
      className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl text-left hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-green-700/30"
            style={{
              boxShadow: '0 0px 4px rgba(0, 44, 4, 0.6), 0 0 20px rgba(0, 71, 22, 0.3)',
            }}
          >
            <h2 className="text-3xl font-bold mb-3 whitespace-nowrap">{roadmap.title}</h2>
            <p className="text-lg opacity-90">
              {roadmap.steps.length} steps · Last used {roadmap.lastUpdated}
            </p>
            <div className="flex justify-end mt-8">
              <div
                className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-2 px-5 rounded-full text-lg"
                style={{
                  boxShadow: '0 0px 4px rgba(0, 44, 4, 0.6), 0 0 20px rgba(0, 71, 22, 0.3)',
                }}
              >
                Continue →
              </div>
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
</div>
  );
};

export default Learn;