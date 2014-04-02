// Socket.io events

var players = {};
var nextId  = 0;

module.exports = function(io, socket){
    var player;

    socket.on('logon', function(data) {
        // console.log('Session from socket.io', socket.handshake.session);
        var player_id = data._id || nextId++;

        // Create the player
        player = {
            _id       : player_id,
            x         : data.x,
            y         : data.y,
            direction : data.direction || 'down'
        };

        // Send existing players to client
        socket.emit('players', players);

        // Send the new player to other clients
        socket.broadcast.emit('connected', player);

        // Add client to list of players
        players[player_id] = player;
    });

    socket.on('move', function(data) {
        if (player) {
            player.x         = data.x;
            player.y         = data.y;
            player.direction = data.direction;

            // Broadcast position change to all other clients
            socket.broadcast.emit('moved', player);
        }
    });

    socket.on('disconnect', function() {
        if(player){
            delete players[player._id];
        }
        io.sockets.emit('disconnected', player);
    });
};