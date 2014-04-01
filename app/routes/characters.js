var characters = require('../controllers/characters');

var hasAuthorization = function(req, res, next) {
	if (req.character.user.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

module.exports = function(app) {

	app.get('/characters', characters.all);
    app.post('/characters', characters.create);
    app.get('/characters/:characterId', characters.show);
    app.put('/characters/:characterId', hasAuthorization, characters.update);
    app.del('/characters/:characterId', hasAuthorization, characters.destroy);

    // Finish with setting up the characterId param
    app.param('characterId', characters.character);

};