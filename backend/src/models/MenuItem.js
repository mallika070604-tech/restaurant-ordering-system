import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['starters', 'mains', 'desserts', 'beverages', 'specials'],
    },
    image: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    prepTimeMinutes: { type: Number, default: 15 },
  },
  { timestamps: true }
);

export default mongoose.model('MenuItem', menuItemSchema);
