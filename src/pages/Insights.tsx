// src/pages/Insights.tsx or components/Insights.tsx
import { useEffect, useState } from 'react';
// Assume you have some mock data or fetch from your backend/localStorage
// For demo: mock data
const mockData = {
  totalStepsCompleted: 42,
  currentStreak: 5,
  longestStreak: 12,
  last7DaysHours: [1.5, 0, 2.5, 3, 1, 4.5, 6], // example hours per day
  last7DaysMoods: ['🚀', '🙂', '😕', '🚀', '🙂', '😴', '🚀'], // mood emojis
  accountAgeDays: 10, // days since first activity
};

const Insights = ({ onExit }: { onExit: () => void }) => {
  const {
    totalStepsCompleted,
    currentStreak,
    longestStreak,
    last7DaysHours,
    last7DaysMoods,
    accountAgeDays,
  } = mockData; // Replace with real data later

  const avgDailyHours = last7DaysHours.reduce((a, b) => a + b, 0) / 7;

  // Adaptive intensity level
  const isNewUser = accountAgeDays < 8;
  let intensityLevel, color, message;

  if (isNewUser) {
    if (avgDailyHours === 0) {
      intensityLevel = 'Just Starting Out 🐣';
      color = 'from-yellow-400 to-amber-500';
      message = 'Welcome to the hive! Even small steps count. Try 30 minutes today? 🐝';
    } else if (avgDailyHours < 2) {
      intensityLevel = 'Great Start!';
      color = 'from-green-400 to-emerald-500';
      message = 'Awesome consistency! You\'re building the habit perfectly.';
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
    // Established user
    if (avgDailyHours < 2) {
      intensityLevel = 'Ok';
      color = 'from-yellow-400 to-orange-500';
      message = 'Room to buzz more! Even 30 extra minutes can make a big difference.';
    } else if (avgDailyHours < 4) {
      intensityLevel = 'Decent';
      color = 'from-green-400 to-teal-500';
      message = 'Solid progress — keep going!';
    } else if (avgDailyHours < 6) {
      intensityLevel = 'Good';
      color = 'from-cyan-500 to-blue-600';
      message = 'Strong and steady — this is the sweet spot!';
    } else if (avgDailyHours < 8) {
      intensityLevel = 'Excellent';
      color = 'from-indigo-500 to-purple-600';
      message = 'Outstanding dedication! You\'re in the zone.';
    } else if (avgDailyHours < 10) {
      intensityLevel = 'Slightly Much';
      color = 'from-orange-500 to-red-500';
      message = 'Impressive dedication! Just watch for signs of fatigue.';
    } else {
      intensityLevel = 'Too Much';
      color = 'from-red-600 to-pink-600';
      message = 'Warning: Risk of burnout – consider a rest day. Your brain needs recovery too! 🐝';
    }
  }

  // Mood trend
  const moodEmoji = last7DaysMoods[6] || '🙂'; // latest mood
  const moodMessage =
    moodEmoji === '🚀' ? 'You\'ve been in flow lately — amazing!' :
    moodEmoji === '🙂' ? 'Steady and positive — perfect pace.' :
    moodEmoji === '😕' ? 'Some confusion? Try reviewing basics or changing topics.' :
    moodEmoji === '🐢' ? 'Feeling stuck? Shorter sessions or a break might help.' :
    'Feeling tired? Rest is part of progress. Come back fresh! 🐝';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-purple-900 text-white pb-6">
                    {/* Sticky Header */}
<div className="sticky top-0 z-11 pb-2">
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

{/* CONTENT */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-12 mt-4">
          Your Learning Insights 🐝📊
        </h1>

        {/* Main Intensity Card */}
        <div className={`bg-gradient-to-br ${color} rounded-3xl p-10 shadow-2xl text-center mb-12`}>
          <h2 className="text-4xl font-bold mb-4">{intensityLevel}</h2>
          <p className="text-2xl mb-2">Average: {avgDailyHours.toFixed(1)} hours/day (last 7 days)</p>
          <p className="text-xl opacity-90">{message}</p>
        </div>

        {/* Grid of Fun Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-3xl p-8 shadow-xl text-center">
            <p className="text-5xl mb-4">🔥</p>
            <h3 className="text-3xl font-bold mb-2">Current Streak</h3>
            <p className="text-4xl font-bold">{currentStreak} days</p>
            <p className="text-lg opacity-80 mt-2">Longest: {longestStreak} days</p>
          </div>

          {/* Steps Completed */}
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-8 shadow-xl text-center">
            <p className="text-5xl mb-4">🎯</p>
            <h3 className="text-3xl font-bold mb-2">Steps Completed</h3>
            <p className="text-4xl font-bold">{totalStepsCompleted}</p>
            <p className="text-lg opacity-80">You're making real progress!</p>
          </div>

          {/* Mood Card */}
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 shadow-xl text-center">
            <p className="text-6xl mb-4">{moodEmoji}</p>
            <h3 className="text-3xl font-bold mb-2">Recent Mood</h3>
            <p className="text-xl opacity-90">{moodMessage}</p>
          </div>
        </div>

        {/* Motivational Footer */}
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