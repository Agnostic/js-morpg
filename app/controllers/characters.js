'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Character    = mongoose.model('Character'),
_            = require('underscore');


/**
 * Find character by id
 */
exports.character = function(req, res, next, id) {
    Character.load(id, function(err, character) {
        if (err) return next(err);
        if (!character) return next(new Error('Failed to load character ' + id));
        req.character = character;
        next();
    });
};

/**
 * Create an character
 */
exports.create = function(req, res) {
    var character = new Character(req.body);
    character.user = req.user;

    character.save(function(err) {
        if (err) {
            return res.json({
                errors: err.errors,
                character: character
            });
        } else {
            res.json(character);
        }
    });
};

/**
 * Update an character
 */
exports.update = function(req, res) {
    var character = req.character;

    character = _.extend(character, req.body);

    character.save(function(err) {
        if (err) {
            return res.json({
                errors: err.errors,
                character: character
            });
        } else {
            res.json(character);
        }
    });
};

/**
 * Delete an character
 */
exports.destroy = function(req, res) {
    var character = req.character;

    character.remove(function(err) {
        if (err) {
            return res.json({
                errors: err.errors,
                character: character
            });
        } else {
            res.json(character);
        }
    });
};

/**
 * Show an character
 */
exports.show = function(req, res) {
    res.json(req.character);
};

/**
 * List of Characters
 */
exports.all = function(req, res) {
    Character.find().sort('-created').populate('user', 'name username').exec(function(err, characters) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.json(characters);
        }
    });
};
