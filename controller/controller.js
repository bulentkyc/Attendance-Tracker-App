const multer = require('multer');
const path = require('path');
const jimp = require('jimp');
const attendees = require('../model/attendees');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const express = require('express');
const exp = express();

exp.use(express.static(__dirname + '/public'));

var fileName = '';
//set stroge engine
const storager = multer.diskStorage({
    destination: 'public/uploads/',
    filename: function (req, file, cb) {
        fileName = 'a.' + Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    }
});

//init upload
const upload = multer({
    storage: storager
}).single('avatar');

let newAttendee = (req, res) => {

}


exports.home = function (req, res) {

    /* contacts.find({}, function(err,results){
    
            if(err){
                console.log(err);
            }else{
                res.render('index', {contactList:results});
                //console.log(results);
            }
        });*/
    res.render('index');
    //res.send('<h1>Hi there!</h1>'); 
}

exports.deleteAttendee = function (req, res) {

    const id = req.params.id;

    attendees.findOneAndRemove({
        _id: id
    }, function (err) {
        if (err) {
            console.log('The record could not deleted:' + err);
        } else {
            console.log('The record is deleted.' + id);
        }
    });

    res.redirect('/');

}

exports.getAttendee = function (req, res) {
    const id = req.params.id;

    attendees.find({
        _id: id
    }, function (err, attendeeDetails) {
        if (err) {
            console.log("You have some problems while fetching your contact's. Details: " +
                err);
        } else {
            res.render('profile', {
                attendeeDetails: attendeeDetails
            });
            console.log(attendeeDetails[0].avatar);
        }
    });
}

exports.editAttendee = function (req, res) {

    const id = req.params.id;

    //---

    //--
    upload(req, res, () => {
        var newAttendee = new contacts({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            role: req.body.role,
            classCode: req.body.classCode,
            email: req.body.email,
            pass: req.body.pass,
            avatar: fileName
        });
        attendees.updateOne({
            _id: id
        }, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            role: req.body.role,
            classCode: req.body.classCode,
            email: req.body.email,
            pass: req.body.pass,
            avatar: fileName
        }, function (err, data) {
            if (err) {
                console.log('Data is not updated. ' + err);
            } else {
                //res.redirect('/profile/' + id);
            }
        });
        //here is the last line of upload function
        jimp.read('public/uploads/' + fileName, (err, img) => {
            if (err) throw err;
            img
                .resize(250, 250) // resize
                .quality(60) // set JPEG quality
                //.greyscale() // set greyscale
                .write('public/uploads/' + fileName); // save
        });
        //till here
    });
    //here is the last line of the post method
    res.redirect('/');
    //till here
}

exports.register = (req, res) => {
    res.render('register');
}

exports.registration = (req, res) => {
    upload(req, res, () => {
        /*  var newAttendee = new contacts({
             firstName: req.body.firstName,
             lastName: req.body.lastName,
             classCode: req.body.classCode,
             email: req.body.email,
             pass: req.body.pass,
             avatar: fileName
         });
         attendees.create(newAttendee, function(err, attendees){
             if(err){
                 console.log(err);
             }else{
                 console.log('Inserted:' + newAttendee);
             }
         }); */
        //here is the last line of upload function
        jimp.read('public/uploads/' + fileName, (err, img) => {
            if (err) throw err;
            img
                .resize(250, 250) // resize
                .quality(60) // set JPEG quality
                //.greyscale() // set greyscale
                .write('public/uploads/' + fileName); // save
        });
        //..
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const role = req.body.role;
        const classCode = req.body.classCode;
        const email = req.body.email;
        const pass = req.body.pass;
        const avatar = fileName;

        req.checkBody('firstName', 'First name is required').notEmpty();
        req.checkBody('lastName', 'Last name is required').notEmpty();
        req.checkBody('classCode', 'Class code is required').notEmpty();
        req.checkBody('email', 'E-mail is not valid').isEmail();
        req.checkBody('pass', 'Password is required').notEmpty();

        const errors = req.validationErrors();

        if (errors) {
            res.render('register', {
                errors: errors
            });
        } else {
            const newUser = new attendees({
                firstName: firstName,
                lastName: lastName,
                role: role,
                classCode: classCode,
                email: email,
                pass: pass,
                avatar: avatar
            });
            console.log('No error! on new User', newUser)
            attendees.createUser(newUser, function (err, user) {
                if (err) {
                    throw err
                } else {
                    console.log('No error! on  User', user);
                }
            });

            req.flash('success_msg', 'Hi, ' + firstName + ' your account is ready!');

            res.redirect('register');


            /* res.render('register',{
                errors:[{msg:'Hi, ' + name + ' your account is ready!'}]        
            }); */
        }


        //res.send(name + '/' + email + '/' + password);
        //..
        //till here
    });
    //here is the last line of the post method
    //res.redirect('/');
    //till here

}

exports.loginPage = (req, res) => {
    res.render('login');
};

passport.use(new LocalStrategy(
    function (email, password, done) {
        attendees.getUserByEmail(email, function (err, user) {
            console.log(email);
            if (err) {
                throw err;
            }
            if (!user) {
                return done(null, false, {
                    message: 'User not registered'
                });
            }

            attendees.comparePassword(password, user.pass, function (err, isMatch) {
                console.log(password, user, user.pass, isMatch);
                if (err) {
                    throw err;
                }
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
            });
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.email);
});

passport.deserializeUser(function (id, done) {
    user.getUserById(id, function (err, user) {
        done(err, user);
    });
});

exports.login = (req, res) => {
    passport.authenticate(
        'local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        });
    res.redirect('/');
};