var client_Posts = function(){
  var posts = [];
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

var renderAllPosts = function (Posts) {
  var time_options = {month:"short", day:"numeric", hour: "2-digit", minute: "2-digit"}
  var source = $("#post-template").html();
  var template = Handlebars.compile(source);
  var tmp;
  console.log(Posts);
  for(var i=0; i < Posts.length-1; i++) {
    tmp = new Date(Posts[i].info.date);
    Posts[i].info.date = tmp.toLocaleTimeString("en-US",time_options);
    console.log(Posts[i].info.date);
  }
  var wrapper = {posts: Posts};
  var output = template(wrapper);
; $("#posts_output").html(output);

}

var updatePost = function (post) {
  id = "li#"+post.id;
  console.log(post.info);
  $(id+" > a").html(post.title).attr("href", post.url);
  $(id+" > .info div.points").html(post.info.points+" points");
}


$(function() {
  $(".ui.progress.striped").hide();
  $(".ui.sub.menu").hide();
  $(document).on('click', ".ajax", function(event){
    ajax_path = "ajax/"
    event_type = ($(event.target).hasClass("upvote") || $(event.target).hasClass("sort") ) ? $(event.target).attr("class").split(" ")[2]: event.target.id;
    ajax_path += event_type;

    if(event_type === "upvote") {
      post_id = $(event.target).attr('id');
      ajax_path = "ajax/upvote?id="+post_id;
    }
    else {
      $(".ui.progress.striped").show();
      if($(event.target).hasClass("sort")){
        ajax_path += "/" + event.target.id;
      }
    }

    console.log(ajax_path);

    $.get( ajax_path, function( data ) {
      
      $(".ui.progress.striped").hide();
      $(".ui.sub.menu").show();
      
      //Render new view only if we need to
      if(!data.no_render){
        client_Posts.set(data);
        if(event_type !== "upvote"){  
          renderAllPosts(data);
        }else {
          updatePost(data);
        }
      }
    });
  });
  
   
})