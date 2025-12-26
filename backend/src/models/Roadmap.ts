import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['reading', 'watching', 'coding', 'thinking'],
    default: 'reading'
  },
  difficulty: { type: Number, min: 1, max: 5, default: 1 },
  estimatedTime: { type: String },
  completed: { type: Boolean, default: false }, 
  timeLogs: [
    {
      timerEvents: [{ type: { type: String }, at: Number }],
      manualFrom: String,
      manualTo: String,
      manualBreakFrom: String,
      manualBreakTo: String,
      pausedTime: Number,
      savedAt: Date
    }
  ],
  summaries: [  // ← ADD THIS
    {
      id: { type: String, required: true },  // your frontend summary.id
      text: { type: String, required: true },
      savedAt: { type: Date, default: Date.now }
    }
  ]
});

const roadmapSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  steps: [stepSchema],
  lastUpdated: { type: String, required: true }
}, { 
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: any) => {  // ← This single "any" fixes everything
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export default mongoose.model('Roadmap', roadmapSchema);