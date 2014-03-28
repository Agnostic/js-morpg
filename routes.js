// Routes
module.exports = function(app) {

	// Controllers
	var users  = require('./controllers/users'),
	characters = require('./controllers/characters');

	// Users
	app.get('/signin', users.signin);
	app.get('/signup', users.signup);
	app.get('/signout', users.signout);
	app.get('/users/me', users.me);

	// Setting up the users api
	app.post('/users', users.create);

	// Setting up the userId param
	app.param('userId', users.user);

};