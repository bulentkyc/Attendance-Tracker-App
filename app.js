const express = require('express');
const app = express();
const hbs = require('hbs');
const bodyParser = require('body-parser');
const router = require('./router/router');
const expressValidator = require('express-validator');

const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

app.use(express.static(__dirname + '/public'));

app.engine('html', require('hbs').__express);
app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/partials');
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', router);

const host = '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, host, () => console.log(`Server started on ${port}`));