const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    required: true // e.g., 'Appetizers', 'Main Course', 'Desserts'
  },
  price: {
    type: Number,
    required: true
  },
  image: String,
  isVegetarian: Boolean,
  isSpicy: Boolean,
  allergens: [String], // e.g., ['peanuts', 'dairy']
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
