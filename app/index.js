'use strict';

const config = require('./config');
const redis = require('redis').createClient;
const adapter = require('socket.io-redis');

// Social Authentication Logic
require('./auth')();


// Create an IO Server instance
let ioServer = app => {
    app.locals.chatrooms = [];
    const server = require('http').Server(app);
    const io = require('socket.io')(server);

    // forcing socket.io to use only websockets (no long ajax requests)
    io.serveClient('transports', ['websocket']);

    // used strictly for publishing data buffers to redis
    let pubClient = redis(config.redis.port, config.redis.host, {
        auth_pass: config.redis.password
    });
    // used to get data back from redis 
    // (return_buffers is absolutely needed, as redis would return data as a string and we need data in original buffered state)
    let subClient = redis(config.redis.port, config.redis.host, {
        return_buffers: true,
        auth_pass: config.redis.password
    });
    io.adapter(adapter({
        pubClient,
        subClient
    }));

    // need these lines for sockets to read from sessions
    io.use((socket, next) => {
        require('./session')(socket.request, {}, next);
    });
    require('./socket')(io, app);
    return server;
}

module.exports = {
    router: require('./routes')(),
    session: require('./session'),
    ioServer,
    logger: require('./logger')
};