module.exports = {
	gameTitle: 'js-morpg',
	port: 3000,
	db: 'mongodb://localhost/jsmorpg',

	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: 'your-session-secret-123',
	
	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions'
};