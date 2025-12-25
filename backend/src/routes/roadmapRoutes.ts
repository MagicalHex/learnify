import express from 'express';
import Roadmap from '../models/Roadmap';

const router = express.Router();

// GET all roadmaps for a user (use query param or header later; for now, pseudo)
router.get('/', async (req, res) => {
  try {
    // Temporary: accept userId from query (e.g., ?userId=pseudo-user-123)
    const userId = req.query.userId as string || 'pseudo-user-123';

    const roadmaps = await Roadmap.find({ userId }).sort({ updatedAt: -1 });
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roadmaps' });
  }
});

// POST new roadmap
router.post('/', async (req, res) => {
  try {
    // Optionally enforce userId from body or auth later
    const roadmapData = req.body;

    // Ensure userId is present
    if (!roadmapData.userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const newRoadmap = new Roadmap(roadmapData);
    await newRoadmap.save();
    res.status(201).json(newRoadmap);
  } catch (error: any) {
    console.error('Save error:', error);
    res.status(400).json({ message: error.message || 'Failed to save roadmap' });
  }
});

export default router;