const SensorReading = require('../models/SensorReading');
const Alert = require('../models/Alert');
const Settings = require('../models/Settings');

const processReading = async (readingData, io) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const abnormalParameters = [];
    let status = 'NORMAL';

    const checkThreshold = (param, value, config) => {
      if (value < config.min || value > config.max) {
        abnormalParameters.push(param);
        status = 'ALERT';
        return true;
      }
      return false;
    };

    const isPhAbnormal = checkThreshold('pH', readingData.ph, settings.ph);
    const isTempAbnormal = checkThreshold('Temperature', readingData.temperature, settings.temperature);
    const isTurbAbnormal = checkThreshold('Turbidity', readingData.turbidity, settings.turbidity);
    const isWLAbnormal = checkThreshold('Water Level', readingData.waterLevel, settings.waterLevel);
    const isFRAbnormal = checkThreshold('Flow Rate', readingData.flowRate, settings.flowRate);

    const newReading = new SensorReading({
      ...readingData,
      status,
      abnormalParameters
    });

    const savedReading = await newReading.save();
    io.emit('sensorUpdate', savedReading);
    io.emit('plantStatusUpdate', { status });

    if (status === 'ALERT') {
      const createAlert = async (param, value, config) => {
        const severity = (value > config.max * 1.2 || value < config.min * 0.8) ? 'CRITICAL' : 'HIGH';
        const message = value > config.max ? `${param} level is too high` : `${param} level is too low`;
        
        const newAlert = new Alert({
          parameter: param,
          message,
          value,
          threshold: `${config.min} - ${config.max}`,
          severity
        });
        const savedAlert = await newAlert.save();
        io.emit('newAlert', savedAlert);
      };

      if (isPhAbnormal) await createAlert('pH', readingData.ph, settings.ph);
      if (isTempAbnormal) await createAlert('Temperature', readingData.temperature, settings.temperature);
      if (isTurbAbnormal) await createAlert('Turbidity', readingData.turbidity, settings.turbidity);
      if (isWLAbnormal) await createAlert('Water Level', readingData.waterLevel, settings.waterLevel);
      if (isFRAbnormal) await createAlert('Flow Rate', readingData.flowRate, settings.flowRate);
    }
  } catch (error) {
    console.error('Error processing reading:', error);
  }
};

module.exports = {
  processReading
};
