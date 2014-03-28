// Socket.io events

var players = {};
var nextId  = 0;

module.exports = function(io, socket){
	var player;

    socket.on('logon', function(pos) {
        console.log('Session from socket.io', socket.handshake);

        // Create the player
        player = { id: nextId++, x: pos.x, y: pos.y };

        // Send existing players to client
        socket.emit('players', players);

        // Send the new player to other clients
        socket.broadcast.emit('connected', player);

        // Add client to list of players
        players[nextId] = player;
    });

    socket.on('move', function(data) {
        if (player) {
            player.x = data.x;
            player.y = data.y;

            // Broadcast position change to all other clients
            socket.broadcast.emit('moved', player);
        }
    });

    socket.on('disconnect', function() {
        delete players[player.id];
        io.sockets.emit('disconnected', player);
    });
};