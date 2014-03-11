/* PARSE + SEND Graph Data */

var Hackernews = require('./../hackernews'),
		posts = require('./posts'),
		natural = require('natural'),
		_ = require("underscore");


var parseData = function(req,res){
	var data = [];
	var dict = {};
	var tmp_arr;
	var tokenizer = new natural.WordTokenizer();
	var Posts = posts.Model.get("top");
	for(var i = 0; i < Posts.length-1; i++) {
		tmp_arr = tokenizer.tokenize(Posts[i].title);
		data[i] = {
			keywords: {}
		};

		_.each(tmp_arr, function (word) {
			dict[word] = 1 + ( dict[word] || 0);
			
			if( data[i].keywords[word]) {
				data[i].keywords[''+word] ++;
			}else {
				data[i].keywords[word] = 1;
			}
		});
	}


	console.log(dict);
	res.send(dict);
}

exports.middleware = function(req,res){
	//console.log(posts.Model.get());
	if(req.params.type === "all"){
		parseData(req,res);
	}
	/*
	else{
	  res.render('error', {
	      message: "404: Page Does Not Exist",
	      error: '404'
	  });
*/
}