// Index controller
exports.home = function(req, res){
    req.session = req.session || {};

    res.render('index', {
        user: req.session.user
    });

};

exports.play = function(req, res){
    res.render('play', {
        user: req.session.user
    });
};