import mongoose from 'mongoose';

const configSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model('Config', configSchema);
