var _ = require('underscore');

// Index controller
exports.home = function(req, res) {
    req.session = req.session || {};

    if (!req.session.user) {
        return res.redirect('/play');
    } else {
        res.redirect('/play');
    }

};

exports.play = function(req, res) {
    // if(!req.session.user){
    //     return res.redirect('/signin');
    // }

    var userData = {};
    if (req.session.user) {
        userData = _.clone(req.session.user);
        delete userData.hashed_password;
        delete userData.salt;
    }

    res.render('play', {
        user: JSON.stringify(userData)
    });
};