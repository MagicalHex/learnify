import express from 'express';
import Roadmap from '../models/Roadmap';

const router = express.Router();

router.post('/', async (req, res) => {
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

export default router;
