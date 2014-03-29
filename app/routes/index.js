// Index
module.exports = function(app) {

    // Index controller
    var index = require('../controllers/index');

    // Home
    app.get('/', index.home);

    // Play
    app.get('/play', index.play);

};