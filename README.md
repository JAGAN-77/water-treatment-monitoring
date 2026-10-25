# Water Treatment Plant Monitoring System

A complete full-stack MERN application for monitoring a water treatment plant in real-time.

## Features

- **Real-Time Sensor Dashboard**: Live view of critical water parameters (pH, Temperature, Turbidity, Water Level, Flow Rate).
- **Sensor Data Simulator**: A backend simulator generating realistic sensor readings and occasionally spiking parameters to simulate anomalies.
- **Alert Management**: Real-time alerts based on configurable thresholds. Alerts can be resolved by operators.
- **Historical Data**: View past sensor readings in a tabular format.
- **Analytics & Trends**: Visual charts (using Recharts) to analyze trends over time.
- **Dynamic Configuration**: Change threshold settings on the fly from the Settings page.

## Technology Stack

- **Frontend**: React.js, Vite, React Router, Recharts, Axios, Socket.IO Client
- **Backend**: Node.js, Express.js, Mongoose, Socket.IO
- **Database**: MongoDB (Local Instance)
- **Styling**: Vanilla CSS3 (Professional Industrial Dashboard Theme)

## Architecture

1. **Sensor Simulator**: Generates data every 5 seconds.
2. **Backend**: Express validates data against current settings thresholds.
3. **Database**: Saves readings and alerts to MongoDB.
4. **Real-time Engine**: Emits Socket.IO events (`sensorUpdate`, `newAlert`, `plantStatusUpdate`, `alertResolved`).
5. **Frontend**: React hooks into Socket.IO for live updates without page refreshes.

## Folder Structure

```
water-treatment-monitoring/
├── backend/
│   ├── config/          # DB config
│   ├── controllers/     # Route logic
│   ├── models/          # Mongoose schemas (SensorReading, Alert, Settings)
│   ├── routes/          # Express routes
│   ├── services/        # Reading processing logic
│   ├── simulator/       # Sensor data generator
│   ├── server.js        # Entry point
│   ├── package.json
│   └── .env             # Backend environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Dashboard, Alerts, Settings, etc.
│   │   ├── services/    # Axios & Socket instances
│   │   ├── App.jsx      # Router setup
│   │   ├── main.jsx     
│   │   └── index.css    # Custom CSS variables and styles
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Start MongoDB
Ensure your local MongoDB instance is running. By default, it runs on port 27017. The backend will automatically create the `water_treatment` database.

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*The backend server will start on port 5000 and the simulator will begin generating data immediately.*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The Vite frontend will start on port 5173 (typically `http://localhost:5173`).*

## Environment Variables

**Backend (`backend/.env`)**:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/water_treatment
FRONTEND_URL=http://localhost:5173
```

## How the Simulator & Alerts Work

1. **Simulation Loop**: Every 5 seconds, the `sensorSimulator.js` adds a small random drift to the current values to simulate realistic sensor fluctuation.
2. **Abnormal Spikes**: There is a configurable probability (default 5%) that a reading will suddenly spike above or below the configured normal thresholds.
3. **Threshold Checking**: The `readingProcessor.js` checks each reading against the ranges defined in the Settings model.
4. **Alerts**: If a value is out of bounds, an Alert is generated with severity `HIGH` or `CRITICAL`.
5. **Real-time Feedback**: The backend emits Socket events, immediately updating the React UI to show the alert and change the overall plant status.

## Future Enhancements
- Integration with real IoT hardware (e.g., ESP32 publishing to an MQTT broker).
- Advanced export capabilities for analytics (CSV/PDF).
- Machine learning anomaly detection instead of static thresholds.
