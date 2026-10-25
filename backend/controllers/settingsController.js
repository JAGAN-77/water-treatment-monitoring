const Settings = require('../models/Settings');

// @route   GET /api/settings
// @desc    Get current threshold settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   PUT /api/settings
// @desc    Update threshold settings
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    const { ph, temperature, turbidity, waterLevel, flowRate, abnormalProbability } = req.body;
    
    if (ph) settings.ph = ph;
    if (temperature) settings.temperature = temperature;
    if (turbidity) settings.turbidity = turbidity;
    if (waterLevel) settings.waterLevel = waterLevel;
    if (flowRate) settings.flowRate = flowRate;
    if (abnormalProbability !== undefined) settings.abnormalProbability = abnormalProbability;
    
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
