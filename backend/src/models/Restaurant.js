import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'The Golden Fork',
  },

  logo: {
    type: String,
    default: '',
  },

  phone: {
    type: String,
    default: '',
  },

  address: {
    type: String,
    default: '',
  },
});

export default mongoose.model(
  'Restaurant',
  restaurantSchema
);