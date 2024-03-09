const express = require('express');

const router = express.Router();

const messagesController = require('../controllers/messages');
const Authentication = require('../middleware/auth');

router.get('/get-messages',Authentication.authenticate, Authentication.authenticategroup, messagesController.getmessages);
router.post('/insert-message',Authentication.authenticate, Authentication.authenticategroup, messagesController.insertmessage);

module.exports = router;