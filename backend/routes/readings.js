const express = require('express');
const router = express.Router();
const { getReadings, getLatestReading, getReadingHistory, getStats, createReading } = require('../controllers/readingController');

router.route('/')
  .get(getReadings)
  .post(createReading);

router.get('/latest', getLatestReading);
router.get('/history', getReadingHistory);
router.get('/stats', getStats);

module.exports = router;
