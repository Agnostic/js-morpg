// Overwriting socket.io#connect for cocoonJS
io.connect = function (host, details) {
  var uri = io.util.parseUri(host)
    , uuri
    , socket;

  uuri = io.util.uniqueUri(uri);

  var options = {
      host: uri.host
    , secure: 'https' == uri.protocol
    , port: uri.port || ('https' == uri.protocol ? 443 : 80)
    , query: uri.query || ''
  };

  io.util.merge(options, details);

  if (options['force new connection'] || !io.sockets[uuri]) {
    socket = new io.Socket(options);
  }

  if (!options['force new connection'] && socket) {
    io.sockets[uuri] = socket;
  }

  socket = socket || io.sockets[uuri];

  // if path is different from '' or /
  return socket.of(uri.path.length > 1 ? uri.path : '');
};