const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema({
  ph: {
    type: Number,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  turbidity: {
    type: Number,
    required: true
  },
  waterLevel: {
    type: Number,
    required: true
  },
  flowRate: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['NORMAL', 'WARNING', 'ALERT'],
    default: 'NORMAL'
  },
  abnormalParameters: [{
    type: String
  }],
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('SensorReading', sensorReadingSchema);
