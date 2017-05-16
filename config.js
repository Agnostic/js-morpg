module.exports = {
	gameTitle: 'js-morpg',
	port: 3000,
	db: 'mongodb://localhost/jsmorpg',

	sessionKey: 'jsmorpg.id',

	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: '9sdfh9dfs98*(&)*&^tysd',

	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions'
};
