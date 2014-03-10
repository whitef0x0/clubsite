var renderPosts = function (Posts) {
  var source = $("#post-template").html();
  var template = Handlebars.compile(source);
  var wrapper = {posts: Posts};
  var output = template(wrapper);
; $("#posts_output").html(output);

}

var updatePosts = function (posts) {


}


$(function() {
  var post_temp = $("#post-template").html();

  $(document).on('click', ".ajax", function(event){
    console.log(event.target.id);
    if(event.target.id === "upvote") {
      myparent= $(event.target).parent().attr('id');
      alert(myparent);
      query = "?id="+myparent;
    }
    else {query = "";}
    
    path = "news/"+event.target.id+query;
    console.log(path);
    $.get( "news/"+event.target.id, function( data ) {
      renderPosts(data);
    });
  });
  
   
})