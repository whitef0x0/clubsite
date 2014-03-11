var Hackernews = require('./../hackernews'),
	posts = require('./posts'),
	natural = require('natural'),
	index = require('./index'),
	_ = require("underscore");

var createPost = function(req,res) {
	obj = {
		title: req.body.title,

		url: req.body.url,
		info: {
			points: 0+'',
			postedBy: "my.Hackernews",
			comments: "0",
			date: new Date()
		},
		id: posts.Model.get().length+'',
		itemId: Math.random*80000+''
	};
	console.log(obj);
	console.log(req.body);
	posts.Model.push_obj(obj,"newest");
	res.send(req.body);
}
var deletePost = function(req,res) {

}
var editPost = function(req,res) {

}
var viewPost = function(req,res) {

}


exports.middleware = function(req,res) {
	if(req.params.type === "create"){
		createPost(req,res);
	}
	else{
		res.render('error', {
				message: "404: Page Does Not Exist",
				error: '404'
		});
	}
}