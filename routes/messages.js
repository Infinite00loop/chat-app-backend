const express = require('express');

const router = express.Router();
const multer = require('multer');

const messagesController = require('../controllers/messages');
const Authentication = require('../middleware/auth');
const upload = multer({ dest: 'uploads/' });

router.get('/get-messages',Authentication.authenticate, Authentication.authenticategroup, messagesController.getmessages);
router.post('/insert-message',Authentication.authenticate, Authentication.authenticategroup,upload.single('file'), messagesController.insertmessage);

module.exports = router;