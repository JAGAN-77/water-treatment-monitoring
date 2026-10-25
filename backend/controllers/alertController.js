const Alert = require('../models/Alert');

// @route   GET /api/alerts
// @desc    Get all alerts
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/alerts/active
// @desc    Get active/unresolved alerts
exports.getActiveAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ resolved: false }).sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   PATCH /api/alerts/:id/resolve
// @desc    Resolve an alert
exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    const io = req.app.get('io');
    io.emit('alertResolved', alert);
    
    // Also check if this was the last active alert, if so emit plant status normal
    const activeAlertsCount = await Alert.countDocuments({ resolved: false });
    if (activeAlertsCount === 0) {
       io.emit('plantStatusUpdate', { status: 'NORMAL' });
    }

    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
