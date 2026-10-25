const Settings = require('../models/Settings');

// Default initial values
let currentData = {
  ph: 7.0,
  temperature: 25.0,
  turbidity: 2.0,
  waterLevel: 50.0,
  flowRate: 35.0
};

// Helper to introduce random walk drift
const getRandomDrift = (current, min, max, step) => {
  const drift = (Math.random() * step * 2) - step;
  let newValue = current + drift;
  // keep within normal range most of the time
  if (newValue < min) newValue = min + Math.random() * step;
  if (newValue > max) newValue = max - Math.random() * step;
  return Number(newValue.toFixed(2));
};

const generateSimulatedData = async () => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    const { ph, temperature, turbidity, waterLevel, flowRate, abnormalProbability } = settings;

    // Normal drift
    currentData.ph = getRandomDrift(currentData.ph, ph.min, ph.max, 0.2);
    currentData.temperature = getRandomDrift(currentData.temperature, temperature.min, temperature.max, 0.5);
    currentData.turbidity = getRandomDrift(currentData.turbidity, turbidity.min, turbidity.max, 0.5);
    currentData.waterLevel = getRandomDrift(currentData.waterLevel, waterLevel.min, waterLevel.max, 2.0);
    currentData.flowRate = getRandomDrift(currentData.flowRate, flowRate.min, flowRate.max, 1.5);

    // Occasionally generate an abnormal reading
    const isAbnormal = (Math.random() * 100) < abnormalProbability;
    
    let simulatedReading = { ...currentData };

    if (isAbnormal) {
      // Pick a random parameter to spike
      const params = ['ph', 'temperature', 'turbidity', 'waterLevel', 'flowRate'];
      const paramToSpike = params[Math.floor(Math.random() * params.length)];
      
      switch(paramToSpike) {
        case 'ph':
          simulatedReading.ph = (Math.random() > 0.5) ? ph.max + 1 + Math.random() : ph.min - 1 - Math.random();
          break;
        case 'temperature':
          simulatedReading.temperature = temperature.max + 5 + Math.random() * 5;
          break;
        case 'turbidity':
          simulatedReading.turbidity = turbidity.max + 2 + Math.random() * 5;
          break;
        case 'waterLevel':
          simulatedReading.waterLevel = (Math.random() > 0.5) ? waterLevel.max + 5 + Math.random()*10 : waterLevel.min - 5 - Math.random()*10;
          break;
        case 'flowRate':
          simulatedReading.flowRate = flowRate.min - 5 - Math.random() * 5;
          break;
      }
      // Formatting
      simulatedReading[paramToSpike] = Number(simulatedReading[paramToSpike].toFixed(2));
    }

    return simulatedReading;
  } catch (error) {
    console.error('Simulator error:', error);
    return null;
  }
};

module.exports = {
  generateSimulatedData
};
