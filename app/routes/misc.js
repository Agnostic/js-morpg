// Misc/Utils
module.exports = function(app) {

	app.get('/session_test', function(req, res){
		console.log('Session', req.session);
		req.session.test = 'Hello session';
		res.end();
	});

};