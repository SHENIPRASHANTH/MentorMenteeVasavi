const socketIo = require('socket.io');

let io;

const init = (httpServer) => {
    io = socketIo(httpServer);
    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io is not initialized');
    }
    return io;
};

module.exports = { init, getIo };
