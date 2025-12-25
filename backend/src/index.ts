import express from 'express';  // Remove * as and .default()
import cors from 'cors';        // Same here
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import roadmapRoutes from './routes/roadmapRoutes';
import saveStepTimeRouter from './routes/saveStepTime';

dotenv.config();

const app = express();  // No .default()

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

// Routes
app.use('/api/roadmaps', roadmapRoutes);

app.use('/api/saveStepTime', saveStepTimeRouter);

app.get('/', (req, res) => {
  res.send('Learn App Backend Running 🐝');
});

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