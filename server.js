'use strict';
const express = require('express');
const path = require('path');
const passport = require('passport');

const app = express();
const chatCat = require('./app');

app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));

//app.set('views', './views'); // to set any other folder than 'views'
app.set('view engine', 'ejs');

// needs to be USED before the router
app.use(chatCat.session);
app.use(passport.initialize());
app.use(passport.session());

app.use(require('morgan')('combined', {
    stream: {
        write: message => {
            // Write to logs
            chatCat.logger.log('info', message);
        }
    }
}))

app.use('/', chatCat.router);

chatCat.ioServer(app)
    .listen(app.get('port'), () => console.log('ChatCAT Running on Port: ', app.get('port')));