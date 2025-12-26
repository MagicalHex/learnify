import express from 'express';
import Roadmap from '../models/Roadmap';

const router = express.Router();

router.post('/saveStepTime', async (req, res) => {
  try {
    const { userId, stepId, roadmapId, timerEvents, manualFrom, manualTo, manualBreakFrom, manualBreakTo, pausedTime } = req.body;

    if (!userId || !stepId || !roadmapId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Option 1: store in the roadmap document itself
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

    const stepIndex = roadmap.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return res.status(404).json({ message: 'Step not found' });

    // Attach time data to step — create a `timeLogs` array if you want history
const step = roadmap.steps.find(s => s.id === stepId);
if (!step) return res.status(404).json({ message: 'Step not found' });

// @ts-ignore // optional if still complaining, but better is type the schema
(step as any).timeLogs = (step as any).timeLogs ?? [];
(step as any).timeLogs.push({
  timerEvents,
  manualFrom,
  manualTo,
  manualBreakFrom,
  manualBreakTo,
  pausedTime,
  savedAt: new Date()
});


    await roadmap.save();
    res.status(201).json({ message: 'Step time saved', step });
  } catch (err) {
    console.error('[saveStepTime]', err);
    res.status(500).json({ message: 'Failed to save step time' });
  }
});

// NEW route for summaries
router.post('/saveStepSummary', async (req, res) => {
  try {
    const { userId, stepId, summaryId, text, roadmapId } = req.body;

    if (!userId || !stepId || !summaryId || !text || !roadmapId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found or access denied' });

    const step = roadmap.steps.find(s => s.id === stepId);
    if (!step) return res.status(404).json({ message: 'Step not found' });

    const existingIndex = step.summaries?.findIndex(s => s.id === summaryId) ?? -1;

    if (existingIndex !== -1) {
      step.summaries[existingIndex].text = text.trim();
      step.summaries[existingIndex].savedAt = new Date();
    } else {
      step.summaries.push({
        id: summaryId,
        text: text.trim(),
        savedAt: new Date()
      });
    }

    step.markModified('summaries'); // ← Critical line

    await roadmap.save();

    res.status(200).json({ message: 'Summary saved successfully' });
  } catch (err) {
    console.error('[saveStepSummary]', err);
    res.status(500).json({ message: 'Failed to save summary' });
  }
});

export default router;
