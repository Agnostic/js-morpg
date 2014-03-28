// Index controller
exports.home = function(req, res){
    req.session = req.session || {};

    if(!req.session.user){
      return res.redirect('/signin');
    }

    res.render('index', {
        user: req.session.user
    });

};

exports.play = function(req, res){
    res.render('play', {
        user: req.session.user
    });
};