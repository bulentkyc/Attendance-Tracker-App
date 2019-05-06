const db = require('./db');
const bcrypt = require('bcrypt');

var contactSchema = new db.Schema({
    firstName: String,
    lastName: String,
    role: String,
    classCode: String,
    email: String,
    pass: String,
    avatar: String
});

var attendees = db.model('attendees', contactSchema);
//console.log(attendees);
module.exports = attendees;

module.exports.createUser = (newUser, callback) => {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.pass, salt, function (err, hash) {
            newUser.pass = hash;
            newUser.save(callback);
        });
    });
}

module.exports.getUserByEmail = function (email, callback) {
    const query = {
        email: email
    };
    attendees.findOne(query, callback);
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    console.log(password, candidatePassword, isMatch);
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
}

module.exports.getUserById = function (id, callback) {
    attendees.findById(id, callback);
}