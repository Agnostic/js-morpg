// Socket.io events
module.exports = function(socket){
	var player;

    socket.on('logon', function(pos) {
        // Create the player
        player = { id: nextId++, x: pos.x, y: pos.y };

        // Send existing players to client
        socket.emit('players', players);

        // Send the new player to other clients
        socket.broadcast.emit('connected', player);

        // Add client to list of players
        players.push(player);
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
        players.splice(players.indexOf(player), 1);
        io.sockets.emit('disconnected', player);
    });
};