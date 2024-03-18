const express = require('express');

const router = express.Router();

const inviteController = require('../controllers/invite');
const authentication = require('../middleware/auth');

router.get('/joingroup/:uuid', inviteController.joingroup);
router.post('/invitemember',authentication.authenticate,authentication.authenticategroup,authentication.authenticategroupadmin, inviteController.invitemember);router.post('/be-a-member',authentication.authenticate,inviteController.beAmember);
router.post('/add-member',authentication.authenticate,authentication.authenticategroup,authentication.authenticategroupadmin,inviteController.addmember);
router.post('/be-a-member',authentication.authenticate,inviteController.beAmember);



module.exports = router;