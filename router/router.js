const express = require('express');
const router = express.Router();
const controller = require('../controller/controller');

router.use(express.static(__dirname + '/public'));

router.get('/', controller.home);

//router.post('/new-attendee', controller.newAttendee );

router.get('/delete-attendee/:id', controller.deleteAttendee);

router.get('/profile/:id', controller.getAttendee)

router.get('/different', function(req, res){
    res.send('<h1>Here is different!</h1>');
});

router.post('/edit-attendee/:id', controller.editAttendee);

router.get('/register', controller.register);

router.post('/registration', controller.registration);

router.post('/login', controller.login);

router.get('/login', controller.loginPage);

router.get('*', function(req, res){
    res.send('<h1>There is no page!</h1>');
});

module.exports = router;