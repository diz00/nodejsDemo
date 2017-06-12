'use strict';
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const db = require('../db');

const config = require('../config');

if (process.env.NODE_ENV === 'production') {
    // Initialize session with settings for production
    module.exports = session({
        secret: config.sessionSecret,
        resave: false,
        saveUnitialized: false,
        store: new MongoStore({
            mongooseConnection: db.Mongoose.connection
        })
    });
} else {
    // Initialize session with settings for development
    module.exports = session({
        secret: config.sessionSecret,
        resave: false,
        saveUnitialized: true
    })
}