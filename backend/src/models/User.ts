import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String }, // hashed, nullable for future oauth
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);