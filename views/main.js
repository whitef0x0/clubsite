var getNews = function () {
	var func = $.getJSON( "news", function( data ) {
		  var items = [];
		  $.each( data, function( key, val ) {
		  	console.log("key:"+key+" val:"+val);
		  }
		});
	return func;
}

$(function() {


	$("#shownews").click(function(event){
		console.log("#shownews")
		getNews();

	});
	
	 
});