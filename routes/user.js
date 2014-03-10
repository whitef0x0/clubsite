var Hackernews = require('./../hackernews'),
		index = require('./index');
var arr = [];
var hn_bot = new Hackernews(); 

/* UTILITY functions */
var sort_by = function(field1, field2, reverse, primer){
	//Set sorting property to return val of primer func or just to object prop field
	console.log("in sort_by");
	if(primer){
	    key = function(x){return primer(x[field1][field2]);};
	} 
  else{
	    key = function(x){return x[field1][field2];};                     
	}
  //make sure that you receive a 1 or a 0, by using double not operators
	reverse = [-1, 1][+!!reverse];

	//Return our callback function to sort
	return function (a, b) {
	   return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
	} 
};

var find_obj_by_id = function(arr, wanted_id){
	for(var i = 0, m = null; i < ObjectsList.length; ++i) {
	    if(ObjectsList[i].itemId != wanted_id)
	        continue;
	    m = a[i];
	    break;
	}
	return m;
};


var Posts = function(){
	posts = [];
	return {
		get: function (){
			return posts;
		},
		set: function(arr){
			posts = arr;
		}
	};
}();

/* GET data from HN */
var allNews = function(req, res, no_res){
	
	var posts = [];

	function scrapeResp (posts){
		Posts.set(posts);
		console.log(posts);
		if(!no_res){
			res.send(posts);
		}
	}

	//Scrape base page
	hn_bot.scrape('/', scrapeResp);
 	return Posts.get();
};

var sortNews = function (req, res) {
	if ( !Posts.get() ){
		Posts.set(getNews(req,res, 1));
	}

	res.send( Posts.get().sort(sort_by('info', 'points', false, parseInt)) );
};

var upvoteArticle = function (req,res) {
	arr = Posts.get();
	curr_obj = find_obj_by_id(arr, req.query.id);

	curr_points = curr_obj.info.points;
	curr_points = curr_points + 1;
	curr_obj.info.points = curr_points+'';

	Posts.set(arr);
	console.log("upvoted");
	res.send(posts);
};

exports.middleware = function(req,res){
	console.log(req.params.type);
	if(req.params.type === "all"){
		allNews(req,res,0);
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
