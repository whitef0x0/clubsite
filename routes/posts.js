var Hackernews = require('./../hackernews'),
		index = require('./index'),
		_ = require("underscore");
var hn_bot = new Hackernews(); 

var Post_Model = exports.Model = function(){
	var model = {};
	model.top = [], model.newest = [];
	return {
		get: function (type){
			return model[type];
		},
		set: function(arr,type){
			model[type] = arr;
		},
		set_obj: function(obj, key, type){
			model[type][key] = obj;
		},
		push_obj: function(obj, type){
			model[type].push(obj);
			return model[type].length-1;
		}
	};
}();

/* UTILITY functions */
var sort_by = function(field1, field2, reverse, primer){
	//Set sorting property to return val of primer func or just to object prop field
	if(primer){
			if(field2){
		    key = (field2 === "date" ? 
		    	function(x){return primer(x[field1][field2].valueOf());} : 
		    	function(x){return primer(x[field1][field2]);} );
		  }else {
		  	key = (field2 === "date" ? 
		    	function(x){return primer(x[field1].valueOf());} : 
		    	function(x){return primer(x[field1]);} );
		  }
	} 
  else{
  		if(field2){
		    key = (field2 === "date" ? 
		    	function(x){return x[field1][field2].valueOf();} : 
		    	function(x){return x[field1][field2];} );      
	    }else {
		  	key = (field2 === "date" ? 
		    	function(x){return primer(x[field1].valueOf());} : 
		    	function(x){return primer(x[field1]);} );
		  }            
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
var scrapeNews = function(req, res, no_res, type){
	var date = new Date();
	no_update = {no_render: true};
	function scrapeResp (posts){
		if( !( array_objs_equal(Post_Model.get(type), posts) ) ){
			Post_Model.set(posts, type);
			if(!no_res){
				res.send(posts);
			}
		}else if(!no_res){
			res.send(Post_Model.get(type));
		}
	}
	path = "/";
	if(type === "newest") {
		path += "newest";
	}
	hn_bot.scrape_int(path, scrapeResp);

 	return;
};

var sortNews = function (req, res) {
	if ( !Post_Model.get("top") ){
		getNews(req,res, 1);
	}
	if(req.params.option === "normal"){
		res.send( Post_Model.get("top").sort(sort_by('id', false, false, parseInt)) );
	} else{
		res.send(Post_Model.get("top").sort( sort_by("info", req.params.option, false, parseInt) ));
	}
};

var upvotePost = function (req,res) {
	var arr = Post_Model.get("top");
	//curr_obj = [object, index_of_object]
	var curr_obj = find_obj_by_id(arr, req.query.id);

	var curr_points = parseInt(curr_obj[0].info.points, 10) + 1;
	curr_obj[0].info.points = curr_points+'';

	Post_Model.set_obj(curr_obj[0], curr_obj[1], "top");

	res.send(curr_obj[0]);
};

var upvoteArticle = function (req,res) {
	var arr = Post_Model.get("top");
	//curr_obj = [object, index_of_object]
	var curr_obj = find_obj_by_id(arr, req.query.id);

	var curr_points = parseInt(curr_obj[0].info.points, 10) + 1;
	curr_obj[0].info.points = curr_points+'';

	Post_Model.set_obj(curr_obj[0], curr_obj[1], "top");

	res.send(curr_obj[0]);
};

var getTrending = function(req,res) {
	scrapeNews(req,res,1,"newest");

	Post_Model.set( Post_Model.get("newest").sort( sort_by("info", "points", false, parseInt) ), "newest");
	res.send(Post_Model.get("newest").sort( sort_by("info", "points", false, parseInt) ));
};

var scrapeComments = function(req,res) {
	hn_bot.scrapeItem(req.query.itemId, function(comments) {
		res.send(comments);
		return;
	});
};

exports.middleware = function(req,res){
	if(req.params.type === "all"){
		scrapeNews(req,res,0,"top");
	}else if(req.params.type === "sort") {
		sortNews(req,res);
	}else if(req.params.type === "upvote") {
		upvotePost(req,res);
	}else if(req.params.type === "comments") {
		scrapeComments(req,res);
	}else if(req.params.type === "trend") {
		getTrending(req,res);
	}else if(req.params.type === "create") {
		createPost(req,res);
	}
	else{
	  res.render('error', {
	      message: "404: Page Does Not Exist",
	      error: '404'
	  });
	}
};
