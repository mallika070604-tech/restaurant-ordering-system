import mongoose from 'mongoose';

const waiterCallSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('WaiterCall', waiterCallSchema);