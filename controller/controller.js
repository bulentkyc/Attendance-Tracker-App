const multer = require('multer');
const path = require('path');
const jimp = require('jimp');
const attendees = require('../model/attendees');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const express = require('express');
const exp = express();
let jwt = require('jsonwebtoken');
const config = require('../model/config');

exp.use(express.static(__dirname + '/public'));

let fileName = '';
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




let checkToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Token is not valid'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.json({
            success: false,
            message: 'Auth token is not supplied'
        });
    }
};

module.exports = {
    checkToken: checkToken
}


/////////////


class HandlerGenerator {
    login(req, res) {
        let username = req.body.username;
        let password = req.body.password;
        // For the given username fetch user from DB
        let mockedUsername = 'admin';
        let mockedPassword = 'password';

        if (username && password) {
            if (username === mockedUsername && password === mockedPassword) {
                let token = jwt.sign({
                        username: username
                    },
                    config.secret, {
                        expiresIn: '24h' // expires in 24 hours
                    }
                );
                // return the JWT token for the future API calls
                res.json({
                    success: true,
                    message: 'Authentication successful!',
                    token: token
                });
            } else {
                res.send(403).json({
                    success: false,
                    message: 'Incorrect username or password'
                });
            }
        } else {
            res.send(400).json({
                success: false,
                message: 'Authentication failed! Please check the request'
            });
        }
    }
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

    let username = req.body.email;
    let password = req.body.password;
    // For the given username fetch user from DB
    let mockedUsername = 'admin';
    let mockedPassword = 'password';

    if (username && password) {
        if (passport.authenticate(
                'local',
                function (err, user, info) {
                    if (err) {
                        return err;
                    }
                    if (!user) {
                        return false;
                    }
                    req.logIn(user, function (err) {
                        if (err) {
                            return err;
                        }
                        return true;
                    });
                })) {
            let token = jwt.sign({
                    username: username
                },
                config.secret, {
                    expiresIn: '24h' // expires in 24 hours
                }
            );
            // return the JWT token for the future API calls
            res.json({
                success: true,
                message: 'Authentication successful!',
                token: token
            });
        } else {
            res.send(403).json({
                success: false,
                message: 'Incorrect username or password'
            });
        }
    } else {
        res.send(400).json({
            success: false,
            message: 'Authentication failed! Please check the request'
        });
    }


    /* passport.authenticate(
        'local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        });
    res.redirect('/'); */
};