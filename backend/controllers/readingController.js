const SensorReading = require('../models/SensorReading');

// @route   GET /api/readings
// @desc    Get recent sensor readings
exports.getReadings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const readings = await SensorReading.find().sort({ timestamp: -1 }).limit(limit);
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/readings/latest
// @desc    Get the latest reading
exports.getLatestReading = async (req, res) => {
  try {
    const reading = await SensorReading.findOne().sort({ timestamp: -1 });
    res.json(reading);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/readings/history
// @desc    Get historical readings with filters
exports.getReadingHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const readings = await SensorReading.find(query).sort({ timestamp: -1 });
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/readings/stats
// @desc    Get basic statistics
exports.getStats = async (req, res) => {
  try {
    // Simple stats aggregation
    const stats = await SensorReading.aggregate([
      {
        $group: {
          _id: null,
          avgPh: { $avg: "$ph" },
          minPh: { $min: "$ph" },
          maxPh: { $max: "$ph" },
          avgTemp: { $avg: "$temperature" },
          minTemp: { $min: "$temperature" },
          maxTemp: { $max: "$temperature" },
          avgTurb: { $avg: "$turbidity" },
          minTurb: { $min: "$turbidity" },
          maxTurb: { $max: "$turbidity" }
        }
      }
    ]);
    res.json(stats[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/readings
// @desc    Manually submit a reading
exports.createReading = async (req, res) => {
  try {
    const { processReading } = require('../services/readingProcessor');
    const io = req.app.get('io');
    
    // We expect the request body to have ph, temperature, turbidity, waterLevel, flowRate
    // We will pass this to the processor to validate and save
    await processReading(req.body, io);
    
    res.status(201).json({ message: 'Reading processed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
