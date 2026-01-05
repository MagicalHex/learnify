import express from 'express';  // Remove * as and .default()
import cors from 'cors';        // Same here
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import roadmapRoutes from './routes/roadmapRoutes';
import saveStepTimeRouter from './routes/saveStepTime';
import authRouter from './routes/auth';

// Compute
import insightsRoutes from './routes/insightsRoutes';

dotenv.config();

const app = express();  // No .default()

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

// ###############
// ROUTES
// #########

// ROADMAPS
app.use('/api/roadmaps', roadmapRoutes);
// Compute roadmap data
app.use('/api/insights', insightsRoutes);

// SAVE STEP ACTIONS
app.use('/api', saveStepTimeRouter); // this now handles:
// POST  /api/saveStepSummary
// POST  /api/saveStepTime
// GET   /api/getStepSummaries

// Login Register
app.use('/api', authRouter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });