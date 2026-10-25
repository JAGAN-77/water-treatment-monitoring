const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  ph: {
    min: { type: Number, default: 6.5 },
    max: { type: Number, default: 8.5 }
  },
  temperature: {
    min: { type: Number, default: 15 },
    max: { type: Number, default: 40 }
  },
  turbidity: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 5 }
  },
  waterLevel: {
    min: { type: Number, default: 20 },
    max: { type: Number, default: 90 }
  },
  flowRate: {
    min: { type: Number, default: 10 },
    max: { type: Number, default: 60 }
  },
  abnormalProbability: {
    type: Number, // Percentage 0-100
    default: 5 
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
