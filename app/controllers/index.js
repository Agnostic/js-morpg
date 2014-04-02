// Index controller
exports.home = function(req, res){
    req.session = req.session || {};

    if(!req.session.user){
      return res.redirect('/signin');
    } else {
        res.redirect('/play');
    }

};

exports.play = function(req, res){
    if(!req.session.user){
        res.redirect('/login');
    }
    res.render('play', {
        user: JSON.stringify(req.session.user)
    });
};