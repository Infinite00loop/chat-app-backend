const express = require('express');

const router = express.Router();

const groupController = require('../controllers/group');
const userAuthentication = require('../middleware/auth');

router.get('/get-groups',userAuthentication.authenticate, groupController.getgroups);
router.post('/create-group',userAuthentication.authenticate, groupController.creategroup);
router.get('/isgroupadmin',userAuthentication.authenticate,userAuthentication.authenticategroup,userAuthentication.authenticategroupadmin, groupController.isgroupadmin);
router.get('/members',userAuthentication.authenticate,userAuthentication.authenticategroup, groupController.getmembers);
router.post('/removemember',userAuthentication.authenticate,userAuthentication.authenticategroup,userAuthentication.authenticategroupadmin, groupController.removemember);
router.post('/makeadmin',userAuthentication.authenticate,userAuthentication.authenticategroup,userAuthentication.authenticategroupadmin, groupController.makeadmin);
router.post('/exit',userAuthentication.authenticate,userAuthentication.authenticategroup,groupController.exitgroup);

module.exports = router;