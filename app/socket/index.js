'use strict';
const h = require('../helpers');

module.exports = (io, app) => {
    let allrooms = app.locals.chatrooms;

    io.of('/roomslist').on('connection', socket => {
        console.log('Socket.io connected to client');
        socket.on('getChatrooms', () => {
            socket.emit('chatRoomsList', JSON.stringify(allrooms))
        });

        socket.on('createNewRoom', newRoomInput => {
            // check to see if a room with the same title exists or not
            // if not, create one and broadcast it to everyone
            if(!h.findRoomByName(allrooms, newRoomInput)) {
                allrooms.push({
                    room: newRoomInput,
                    roomID: h.randomHex(),
                    users: []
                });

                // Emit an updated list to the creator
                socket.emit('chatRoomsList', JSON.stringify(allrooms));
                // Emit an updated list to everyone connected to the rooms page
                socket.broadcast.emit('chatRoomList', JSON.stringify(allrooms));
            }
        });

    });

    io.of('/chatter').on('connection', socket => {
        socket.on('join', data => {
            let usersList = h.addUserToRoom(allrooms, data, socket);
            if(!usersList) return; // something to stop app from crashing

            // Update the list of active users as shown on the chatroom page
            socket.broadcast.to(data.roomID).emit('updateUsersList', JSON.stringify(usersList.users)); // emits an event to all sockets except the one which created
            socket.emit('updateUsersList', JSON.stringify(usersList.users)); // dispatches to the connected socket (user who joined in)

        });

        // When a socket exits
        socket.on('disconnect', () => {
            // Find the room, to which the socket is connected to and purge the user
            let room = h.removeUserFromRoom(allrooms, socket);
            if(!room) return;
            socket.broadcast.to(room.roomID).emit('updateUsersList', JSON.stringify(room.users));
        });

        // When a new message arrives
        socket.on('newMessage', data => {
            // socket.to is the same as socket.broadcast.to
            socket.to(data.roomID).emit('inMessage', JSON.stringify(data));
        });

    });

}