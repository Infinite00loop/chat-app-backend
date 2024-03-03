const express = require('express');

const router = express.Router();

const messagesController = require('../controllers/messages');
const userAuthentication = require('../middleware/auth');

router.get('/get-messages',userAuthentication.authenticate, messagesController.getmessages);
router.post('/insert-message',userAuthentication.authenticate, messagesController.insertmessage);


module.exports = router;