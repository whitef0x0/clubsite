/* GET home page. */
var posts = require('./posts');
exports.index = function(req, res){
	res.render('index', { title: 'my.HackerNews' });
};
