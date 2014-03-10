var Hackernews = require('./../hackernews'),
		index = require('./index'),
		_ = require("underscore");
var hn_bot = new Hackernews(); 


var Posts = function(){
	var posts =[];
	return {
		get: function (){
			return posts;
		},
		set: function(arr){
			posts = arr;
		},
		set_obj: function(obj, key){
			posts[key] = obj;
		}
	};
}();



/* UTILITY functions */
var sort_by = function(field1, field2, reverse, primer){
	//Set sorting property to return val of primer func or just to object prop field
	if(primer){
	    key = function(x){return primer(x[field1][field2]);};
	} 
  else{
	    key = function(x){return x[field1][field2];};                     
	}
	if(field2 === "date"){
		key = key.valueOf();
	}

  //make sure that you receive a 1 or a 0, by using double not operators
	reverse = [-1, 1][+!!reverse];

	//Return our callback function to sort
	return function (a, b) {
	   return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
	} 
};

var find_obj_by_id = function(ObjectsList, wanted_id){
	var obj_match;
	for(var i = 0, obj_match = null; i < ObjectsList.length; ++i) {
	    if(ObjectsList[i].id != wanted_id)
	        continue;
	    obj_match = ObjectsList[i];
	    break;
	}

	return [obj_match, obj_match.id];
};

var array_objs_equal = function (a,b) { 
	
	if(a.length == b.length){
		for(var i=0; i < a.length-1; i++){
			if(a[i].id == b[i].id){ 
				continue;
			}else {
				return 0;
			}
		}	
	}else {
		return 0;
	}
	return 1;
}

/* Scrape data from HN */
var scrapeNews = function(req, res, no_res){
	var date = new Date();
	no_update = {no_render: true};
	function scrapeResp (posts){
		if( !( array_objs_equal(Posts.get(), posts) ) ){
			Posts.set(posts);
			console.log("scrape"+posts[0].title+" stored"+Posts.get()[0].title);
			console.log("if statement");
			if(!no_res){
				res.send(posts);
			}
		}else{
			console.log("else statement");
			res.send(no_update);
		}
	}

	hn_bot.scrape('/', scrapeResp);

 	return Posts.get();
};

var sortNews = function (req, res) {
	if ( !Posts.get() ){
		getNews(req,res, 1);
	}
	res.send( Posts.get().sort(sort_by('info', req.params.option, false, parseInt)) );
};

var upvoteArticle = function (req,res) {
	var arr = Posts.get();
	//curr_obj = [object, index_of_object]
	console.log(req.query.id)
	var curr_obj = find_obj_by_id(arr, req.query.id);
	console.log(curr_obj[0]);

	var curr_points = parseInt(curr_obj[0].info.points, 10) + 1;
	//console.log(curr_points);
	curr_obj[0].info.points = curr_points+'';

	Posts.set_obj(curr_obj[0], curr_obj[1]);
	console.log(curr_obj[0]);

	res.send(curr_obj[0]);
};

var rankTrending = function(req,res) {};

exports.middleware = function(req,res){
	console.log(req.params.type);
	if(req.params.type === "all"){
		scrapeNews(req,res,0);
	}else if(req.params.type === "sort") {
		sortNews(req,res);
	}else if(req.params.type === "upvote") {
		upvoteArticle(req,res);
	}
	else{
	  res.render('error', {
	      message: "404: Page Does Not Exist",
	      error: '404'
	  });
	}
};
