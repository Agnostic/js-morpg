// Index controller
exports.render = function(req, res){
    req.session = req.session || {};

    res.render('index', {
        user: req.session.user
    });

};