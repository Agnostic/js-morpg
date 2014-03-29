'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
User         = mongoose.model('User');

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
    res.redirect('/');
};

/**
 * Login form
 */
 exports.signin = function(req, res) {
    res.render('signin');
 };

/**
 * Login
 */
exports.login = function(req, res) {

    if(!req.body.username){
        return res.render('signin', {
            error: 'Invalid username'
        });
    }

    User.findOne({ username: req.body.username }, function(err, doc){

        if(doc){

            if( doc.authenticate(req.body.password) ){
                console.log('Authenticated!', doc);
            } else {
                res.render('signin', {
                    error: 'Incorrect password'
                });
            }

        } else {
            res.render('signin', {
                error: 'User not found'
            });
        }

    });
};

/**
 * Sign up
 */
exports.signup = function(req, res) {
    res.render('signup');
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res, next) {
    var user = new User(req.body);
    var message = null;

    user.provider = 'local';
    user.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                case 11001:
                    message = 'Username already exists';
                    break;
                default:
                    message = 'Please fill all the required fields';
            }

            return res.render('signup', {
                error: message
            });
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/');
        });
    });
};

/**
 * Send User
 */
exports.me = function(req, res) {
    res.json(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};