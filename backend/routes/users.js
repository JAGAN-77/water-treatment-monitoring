const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// All user management routes require Admin authorization
router.use(authenticate, authorize('Admin'));

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.patch('/:id/status', userController.toggleUserStatus);
router.patch('/:id/role', userController.updateUserRole);
router.post('/:id/reset-password', userController.resetPassword);

module.exports = router;
