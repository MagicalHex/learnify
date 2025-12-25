// ------------------------------------------------------------
// src/pages/Roadmap.tsx
// ------------------------------------------------------------
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Step {
  id: string;
  title: string;
  category: 'reading' | 'watching' | 'coding' | 'thinking';
  difficulty: number; // 1-5
  estimatedTime?: string; // optional, e.g., '2 hours'
}

interface Roadmap {
  id: string;          // This is now the unique ID from MongoDB (string)
  userId: string;
  title: string;
  steps: Step[];
  lastUpdated: string;
}

const RoadmapPage = ({ onExit }: { onExit: () => void }) => {
  // For loading roadmaps
const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'list' | 'create' | 'view' | 'edit'>('list');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [editRoadmap, setEditRoadmap] = useState<Roadmap | null>(null);
  const [llmResponse, setLlmResponse] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const [showCopied, setShowCopied] = useState(false);

  const selectedRoadmap = roadmaps.find((rm) => rm.id === selectedRoadmapId);

  // get roadmaps
  useEffect(() => {
  const fetchRoadmaps = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'pseudo-user-123';
      
      const response = await axios.get(`http://localhost:5000/api/roadmaps?userId=${userId}`);
      setRoadmaps(response.data);
    } catch (error) {
      console.error('Failed to fetch roadmaps:', error);
      // Optional: fallback to empty list or show error
      setRoadmaps([]);
    } finally {
      setLoading(false);
    }
  };

  fetchRoadmaps();
}, []); // Run once on mount

// Updated handleParseAndAdd with robust parsing for the structured roadmap format
const handleParseAndAdd = async () => {
  try {
    // Split the pasted text into lines and clean empty/whitespace lines
    const lines = llmResponse
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) throw new Error('No content found');

    const newSteps: Step[] = [];
    let currentMajorSection = '';
    let stepIndex = 0;

    for (const line of lines) {
      // Match pattern like "1.0 Title" or "1.1 Subtitle"
      const match = line.match(/^(\d+\.\d+)\s+(.+)$/);
      if (!match) {
        console.warn('Skipping invalid line:', line);
        continue;
      }

      const [, numberPart, title] = match;
      const [major, minor] = numberPart.split('.').map(Number);

      // Treat X.0 as section header (optional - you can include or skip)
      if (minor === 0) {
        currentMajorSection = title;
        // Optionally add the major section as a step (comment out if you don't want it)
        // newSteps.push({
        //   id: `${Date.now()}-${stepIndex++}`,
        //   title: title,
        //   category: 'reading',
        //   difficulty: 1,
        // });
        continue; // Skip adding X.0 as a separate step
      }

      // Regular step (X.Y where Y > 0)
      newSteps.push({
        id: `${Date.now()}-${stepIndex++}`,
        title: title.trim(),
        category: 'reading' as const, // Default; can be enhanced later
        difficulty: Math.min(Math.max(Math.ceil(major), 1), 5), // Rough difficulty based on section depth
        // estimatedTime: undefined,
      });
    }

    if (newSteps.length === 0) throw new Error('No valid steps found');

const newRoadmap: Roadmap = {
  id: Date.now().toString(),
  userId: 'pseudo-user-123', // ← Temporary user ID (replace later with auth)
  title: newTitle || 'Bee Societies Roadmap',
  steps: newSteps,
  lastUpdated: new Date().toISOString().split('T')[0],
};

    // Send to backend
const response = await axios.post('http://localhost:5000/api/roadmaps', newRoadmap);
const userId = localStorage.getItem('userId') || 'pseudo-user-123';
const refreshed = await axios.get(`http://localhost:5000/api/roadmaps?userId=${userId}`);
setRoadmaps(refreshed.data);

    // Reset form
    setViewMode('list');
    setLlmResponse('');
    setNewTitle('');
  } catch (error) {
    console.error('Parsing error:', error);
    alert('Failed to parse roadmap. Ensure the format follows the exact X.Y Title pattern.');
  }
};

  const handleEditStart = () => {
    if (selectedRoadmap) {
      setEditRoadmap({ ...selectedRoadmap, steps: [...selectedRoadmap.steps] });
      setViewMode('edit');
    }
  };

  const handleStepChange = (index: number, field: keyof Step, value: string | number) => {
    if (editRoadmap) {
      const newSteps = [...editRoadmap.steps];
      newSteps[index] = { ...newSteps[index], [field]: value };
      setEditRoadmap({ ...editRoadmap, steps: newSteps });
    }
  };

  const handleAddStep = () => {
    if (editRoadmap) {
      const newStep: Step = {
        id: `${Date.now()}`,
        title: 'New Step',
        category: 'reading',
        difficulty: 1,
      };
      setEditRoadmap({ ...editRoadmap, steps: [...editRoadmap.steps, newStep] });
    }
  };

  const handleDeleteStep = (index: number) => {
    if (editRoadmap) {
      const newSteps = editRoadmap.steps.filter((_, i) => i !== index);
      setEditRoadmap({ ...editRoadmap, steps: newSteps });
    }
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (editRoadmap) {
      const newSteps = [...editRoadmap.steps];
      if (direction === 'up' && index > 0) {
        [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
      } else if (direction === 'down' && index < newSteps.length - 1) {
        [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
      }
      setEditRoadmap({ ...editRoadmap, steps: newSteps });
    }
  };

  const handleSave = () => {
    if (editRoadmap) {
      const updatedRoadmaps = roadmaps.map((rm) =>
        rm.id === editRoadmap.id ? { ...editRoadmap, lastUpdated: new Date().toISOString().split('T')[0] } : rm
      );
      setRoadmaps(updatedRoadmaps);
      setViewMode('list');
      setEditRoadmap(null);
      setSelectedRoadmapId(null);
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditRoadmap(null);
    setSelectedRoadmapId(null);
  };

  // Create view
  if (viewMode === 'create') {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white p-6 overflow-y-auto">
    <button className="
    text-2xl
    opacity-95
    bg-gradient-to-b
    from-green-900
    via-green-600
    to-green-900
    hover:via-blue-700
    rounded-full
    w-10 h-10
    shadow-1xl
    border border-green-700
    flex items-center justify-center" onClick={() => setViewMode('list')}>
      ←
    </button>
        <h1 className="text-5xl font-bold mb-10">Create Roadmap</h1>

<div className="mb-2 text-center">
  <p className="mb-2">Copy this prompt to use with an AI:</p>
  
  <div className="flex items-center justify-center gap-8">
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/960px-OpenAI_Logo.svg.png?20230731013808" 
      alt="ChatGPT"
      className="h-5 w-auto"
    />
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Grok_2025.png/960px-Grok_2025.png" 
      alt="Grok"
      className="h-5 w-auto rounded-full"
    />
  </div>
</div>
<div className="bg-white/10 rounded-lg mb-6 overflow-hidden">
  {/* Top-right Copy button */}
  <div className="flex justify-end p-2 pr-4 border-b border-white/10">
    <button
      onClick={() => {
        const promptText = `You are generating a learning roadmap.

RULES:
1. Output ONLY the roadmap. No explanations, no questions, no commentary.
2. Use clear section headers for each level or category.
3. List steps in strict chronological learning order.
4. Use a numeric hierarchy for steps:
   - Major sections: X.0 <Title>
   - Steps within a section: X.Y <Step title>
5. Keep formatting consistent throughout the entire output.

GOAL:
Create a structured roadmap for learning the following subject in a gradual, logical progression.

SUBJECT:
[INSERT SUBJECT HERE]

BEGIN ROADMAP`;
        navigator.clipboard.writeText(promptText);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 3000);
      }}
      className="bg-green-600 hover:bg-green-500 text-white font-medium text-sm py-1.5 px-4 rounded-md shadow transition"
    >
      Copy Prompt
    </button>
  </div>

  {/* Prompt content */}
  <pre className="px-4 pb-4 pt-0 whitespace-pre-wrap text-sm overflow-x-auto">
{`You are generating a learning roadmap.

RULES:
1. Output ONLY the roadmap. No explanations, no questions, no commentary.
2. Use clear section headers for each level or category.
3. List steps in strict chronological learning order.
4. Use a numeric hierarchy for steps:
   - Major sections: X.0 <Title>
   - Steps within a section: X.Y <Step title>
5. Keep formatting consistent throughout the entire output.

GOAL:
Create a structured roadmap for learning the following subject in a gradual, logical progression.

SUBJECT:
[INSERT SUBJECT HERE]

BEGIN ROADMAP`}
  </pre>

  {/* Bottom-left Copy button */}
  <div className="flex justify-start p-2 pl-4 border-t border-white/10">
    <button
      onClick={() => {
        const promptText = `You are generating a learning roadmap.

RULES:
1. Output ONLY the roadmap. No explanations, no questions, no commentary.
2. Use clear section headers for each level or category.
3. List steps in strict chronological learning order.
4. Use a numeric hierarchy for steps:
   - Major sections: X.0 <Title>
   - Steps within a section: X.Y <Step title>
5. Keep formatting consistent throughout the entire output.

GOAL:
Create a structured roadmap for learning the following subject in a gradual, logical progression.

SUBJECT:
[INSERT SUBJECT HERE]

BEGIN ROADMAP`;
        navigator.clipboard.writeText(promptText);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 3000);
      }}
      className="bg-green-600 hover:bg-green-500 text-white font-medium text-sm py-1.5 px-4 rounded-md shadow transition"
    >
      Copy Prompt
    </button>
  </div>
</div>

{showCopied && (
  <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
    {/* Blurred background of the current UI (no black overlay) */}
    <div className="absolute inset-0 backdrop-blur-sm"></div>
    
    {/* Modal content - pointer-events-auto so it's clickable */}
    <div className="relative pointer-events-auto bg-gray-800/90 backdrop-blur-md text-white p-8 rounded-2xl shadow-2xl max-w-lg mx-4 text-center border border-green-500/30">
      <p className="text-xl font-semibold mb-3">Copied to clipboard!</p>
      <p className="text-base opacity-90 leading-relaxed">
        Remember to replace <span className="font-mono bg-gray-700/70 px-2 py-1 rounded">[INSERT SUBJECT HERE]</span> with your actual subject.
      </p>
      <button
        onClick={() => setShowCopied(false)}
        className="mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 py-3 rounded-xl font-medium shadow-lg transition"
      >
        Got it
      </button>
    </div>
  </div>
)}
                <p className="mb-2 text-left font-bold">Roadmap Title:</p>
        <input
          type="text"
          placeholder="Bee Societies"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full mb-4 p-3 bg-white/10 rounded-lg border border-green-500 text-white"
        />

        <textarea
          placeholder="1.0 Foundations of Bee Societies
1.1 What Is a Bee Society
1.2 Solitary Bees vs Social Bees
1.3 Major Bee Groups (Honeybees, Bumblebees, Stingless Bees)
1.4 Basic Bee Anatomy Relevant to Social Life
1.5 Evolutionary Origins of Sociality in Bees

2.0 Structure and Roles Within the Colony
2.1 The Queen: Reproduction and Leadership
2.2 Workers: Division of Labor by Age and Task
2.3 Drones: Role in Reproduction
2.4 Caste Systems and Physical Differences
2.5 Seasonal Changes in Colony Structure

3.0 Communication and Coordination
3.1 Chemical Communication (Pheromones)
3.2 Physical Signals and Tactile Interaction
3.3 The Waggle Dance and Information Sharing
3.4 Coordination of Foraging Activities
3.5 Collective Decision-Making (Nest Sites, Swarming)

4.0 Daily Life and Survival Strategies
4.1 Nest Construction and Maintenance
4.2 Foraging Strategies and Resource Allocation
4.3 Defense Mechanisms and Colony Protection
4.4 Temperature Regulation and Homeostasis
4.5 Disease, Parasites, and Social Immunity

5.0 Reproduction, Swarming, and Colony Life Cycle
5.1 Queen Rearing and Succession
5.2 Swarming Behavior and Triggers
5.3 Establishment of New Colonies
5.4 Colony Growth and Decline Phases
5.5 Lifespan of Individuals vs Colony

6.0 Ecology and Environmental Interactions
6.1 Role of Bee Societies in Pollination
6.2 Interaction With Plants and Ecosystems
6.3 Competition With Other Pollinators
6.4 Impact of Climate and Habitat on Colonies
6.5 Human Influence on Bee Societies

7.0 Comparative and Advanced Perspectives
7.1 Comparing Bee Societies to Ant and Wasp Societies
7.2 Levels of Social Complexity in Bees
7.3 Genetic and Evolutionary Explanations of Cooperation
7.4 Current Research Questions in Bee Social Behavior
7.5 Conservation and the Future of Bee Societies"
          value={llmResponse}
          onChange={(e) => setLlmResponse(e.target.value)}
          className="w-full h-40 mb-6 p-4 bg-white/10 rounded-lg border border-green-500 text-white"
        />
                <p className="mb-4 font-bold">Next:</p>
<p className="mb-4 text-sm text-white/80">
  <strong className="text-white">Create</strong> a project folder with your AI and paste the roadmap into the project instructions as well.
  <br />
  <strong className="text-white">When</strong> you complete a step, manually update it (e.g. <span className="italic">– completed 2025-12-12</span>).
  <br />
  <strong className="text-white">This</strong> makes it easier to ask the AI for your next step later.
</p>

        <button
          onClick={handleParseAndAdd}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-full"
        >
          Add New Roadmap
        </button>
      </div>
    );
  }

  // Edit view
  if (viewMode === 'edit' && editRoadmap) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900">
<div className="sticky top-0 z-10 pb-2 mb-4">
  <div className="absolute inset-x-0 top-0 h-full bg-black/20 backdrop-blur-sm shadow-md rounded-b-2xl"></div>
  
  <div className="relative flex items-center justify-between px-1 py-4">
    {/* Cancel button */}
    <button
      onClick={handleCancel}
      className="text-2xl hover:scale-110 hover:opacity-90 transition-all duration-200"
      aria-label="Cancel edit"
    >
      ❌
    </button>

    {/* Title */}
    <h1 className="text-2xl font-bold whitespace-nowrap">
      {editRoadmap.title}
    </h1>

    {/* Save button */}
    <button
      onClick={handleSave}
      className="text-2xl hover:scale-110 hover:opacity-90 transition-all duration-200"
      aria-label="Save changes"
    >
      ✅
    </button>
  </div>
</div>
      <div className="w-full h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white px-6 pb-6 pt-0 overflow-y-auto">
        <input
          type="text"
          value={editRoadmap.title}
          onChange={(e) => setEditRoadmap({ ...editRoadmap, title: e.target.value })}
          className="w-full mb-8 p-3 bg-white/10 rounded-lg border border-green-500 text-white text-2xl font-bold"
        />

        <ul className="space-y-6">
          {editRoadmap.steps.map((step, index) => (
            <li key={step.id} className="bg-white/10 p-6 rounded-2xl border border-green-500">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                    className="w-full mb-2 p-2 bg-transparent border-b border-green-300 text-xl"
                  />
                  <select
                    value={step.category}
                    onChange={(e) => handleStepChange(index, 'category', e.target.value as Step['category'])}
                    className="mb-2 p-2 bg-white/10 rounded border border-green-500"
                  >
                    <option value="reading">Reading</option>
                    <option value="watching">Watching</option>
                    <option value="coding">Coding</option>
                    <option value="thinking">Thinking</option>
                  </select>
                  <div className="mb-2">
                    Difficulty:
                    <select
                      value={step.difficulty}
                      onChange={(e) => handleStepChange(index, 'difficulty', Number(e.target.value))}
                      className="ml-2 p-2 bg-white/10 rounded border border-green-500"
                    >
                      {[1, 2, 3, 4, 5].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Estimated time (optional)"
                    value={step.estimatedTime || ''}
                    onChange={(e) => handleStepChange(index, 'estimatedTime', e.target.value)}
                    className="w-full p-2 bg-transparent border-b border-green-300"
                  />
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <button onClick={() => handleMoveStep(index, 'up')} disabled={index === 0} className="text-sm opacity-80">
                    ↑
                  </button>
                  <button onClick={() => handleMoveStep(index, 'down')} disabled={index === editRoadmap.steps.length - 1} className="text-sm opacity-80">
                    ↓
                  </button>
                  <button onClick={() => handleDeleteStep(index)} className="text-red-500 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={handleAddStep}
          className="mt-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-full"
        >
          Add Step
        </button>
              </div>
      </div>
    );
  }

  // View (read-only)
  if (viewMode === 'view' && selectedRoadmap) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-whiteoverflow-y-auto">
{/* New header row with back button, title, and edit on the same line */}
<div className="sticky top-0 z-10 pb-2">
  <div className="absolute inset-x-0 top-0 h-full bg-black/20 backdrop-blur-sm shadow-md rounded-b-2xl"></div>
  
  <div className="relative flex items-center justify-between px-1 py-4">
    {/* Back button (left) */}
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
      "
      onClick={() => setViewMode('list')}
    >
      ←
    </button>

    {/* Title (center) */}
    <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">
      {selectedRoadmap.title}
    </h1>

    {/* Edit button (right) */}
    <button
      onClick={handleEditStart}
      className="text-2xl hover:opacity-80 transition-opacity"
    >
      ✏️
    </button>
    </div>
  </div>
      <div className="w-full h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white p-6 overflow-y-auto">
        <ul className="space-y-4">
          {selectedRoadmap.steps.map((step) => (
            <li key={step.id} className="bg-white/10 p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-sm capitalize">Category: {step.category}</p>
              <p className="text-sm">Difficulty: {step.difficulty}</p>
              {step.estimatedTime && <p className="text-sm">Estimated Time: {step.estimatedTime}</p>}
            </li>
          ))}
        </ul>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="w-full h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white overflow-y-auto">
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
        
    <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">Roadmaps</h1>
      </div>
  </div>

      <button
        onClick={() => setViewMode('create')}
        className="mb-8 mt-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-full shadow-md"
      >
        Create / Import Roadmap
      </button>
    <div className="p-2">
{loading ? (
  <p className="text-xl opacity-80">Loading your roadmaps...</p>
) : roadmaps.length === 0 ? (
  <p className="text-xl opacity-80">
    No roadmaps yet. Click below to create your first one! 🐝
  </p>
) : (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {roadmaps.map((roadmap) => (
    <button
      key={roadmap.id}  // ← Always a string, always safe
      onClick={() => {
        setSelectedRoadmapId(roadmap.id);
        setViewMode('view');
      }}
      className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl text-left hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-green-700/30"
    >
      <h2 className="text-3xl font-bold mb-3">{roadmap.title}</h2>
      <p className="text-lg opacity-90">
        {roadmap.steps.length} steps · Last updated {roadmap.lastUpdated}
      </p>
    </button>
  ))}
</div>
)}
</div>
    </div>
  );
};

export default RoadmapPage;