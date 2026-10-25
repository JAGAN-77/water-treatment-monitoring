const express = require('express');
const router = express.Router();
const { getAlerts, getActiveAlerts, resolveAlert } = require('../controllers/alertController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getAlerts);
router.get('/active', getActiveAlerts);
router.patch('/:id/resolve', authenticate, authorize('Admin', 'Plant Operator'), resolveAlert);

module.exports = router;
