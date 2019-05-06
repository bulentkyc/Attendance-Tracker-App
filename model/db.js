const mongoose = require('mongoose');

mongoose.connect('', {
    useNewUrlParser: true
});

const connection = mongoose;
module.exports = connection;