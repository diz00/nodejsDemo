'use strict';
const path = require('path');
const passport = require('passport');

const config = require('../config');
const h = require('../helpers');

module.exports = () => {
    let routes = {
        'get': {
            '/': (req, res, next) => {
                res.render('login');
            },
            '/rooms': [h.isAuthenticated, (req, res, next) => {
                res.render('rooms', {
                    user: req.user,
                    host: config.host
                });
            }],
            '/chat/:id': [h.isAuthenticated, (req, res, next) => {
                // Find a chatroom with the given id
                // Render it if the id is found
                let getRoom = h.findRoomById(req.app.locals.chatrooms, req.params.id);
                if(getRoom === undefined) {
                    return next();
                } else {
                    res.render('chatroom', {
                        user: req.user,
                        host: config.host,
                        room: getRoom.room,
                        roomID: getRoom.roomID
                    });
                }

            }],
            '/getsession': (req, res, next) => {
                res.send("My favorite color: " + req.session.favColor);
            },
            '/setsession': (req, res, next) => {
                req.session.favColor = "red";
                res.send('Session sent');
            },
            '/auth/facebook': passport.authenticate('facebook'),
            '/auth/facebook/callback': passport.authenticate('facebook', {
                successRedirect: '/rooms',
                failureRedirect: '/'
            }),
            '/auth/twitter': passport.authenticate('twitter'),
            '/auth/twitter/callback': passport.authenticate('twitter', {
                successRedirect: '/rooms',
                failureRedirect: '/'
            }),
            '/logout': (req, res, next) => {
                req.logout();
                res.redirect('/');
            }
        },
        'post': {

        },
        'NA': (req, res, next) => {
            res.status(404).sendFile(path.join(process.cwd(), '/views/404.htm'));
        }
    }


    return h.route(routes);
};