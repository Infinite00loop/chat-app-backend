const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin');
const authentication = require('../middleware/auth');

router.get('/get-user/:email', adminController.getUser);
router.post('/insert-user', adminController.insertUser);
router.post('/login-user', adminController.loginUser);
router.get('/getallusers/',authentication.authenticate,authentication.authenticategroup, adminController.getallusers);

module.exports = router;