const express = require('express');

const router = express.Router();

const inviteController = require('../controllers/invite');
const authentication = require('../middleware/auth');

router.get('/joingroup/:uuid', inviteController.joingroup);
router.post('/invitemember',authentication.authenticate,authentication.authenticategroup, inviteController.invitemember);
router.post('/be-a-member',authentication.authenticate,inviteController.beAmember);




module.exports = router;