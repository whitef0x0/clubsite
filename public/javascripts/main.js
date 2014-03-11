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
    },
    get_obj: function(key){
      return posts[key];
    }
  };
}();

var unique_client = function() {
  var _ip = null;
  var _vote_count = 0;
  return {
    ip: function() {
      return _ip;
    }
  }
}

var renderAllPosts = function (Posts) {
  var time_options = {month:"short", day:"numeric", hour: "2-digit", minute: "2-digit"}
  var source = $("#post-template").html();
  var template = Handlebars.compile(source);
  
  var format_time = function () {
    var tmp;
    for(var i=0; i < Posts.length-1; i++) {
      tmp = Posts[i].info.date ? new Date(Posts[i].info.date) : null;
      if(tmp) { Posts[i].info.date = tmp.toLocaleTimeString("en-US",time_options); }
    }
  }();
  var wrapper = {posts: Posts};
  var output = template(wrapper);
  $("#output").html(output);
}

var renderForm = function (Form) {
  var source = $("#form-template").html();
  var template = Handlebars.compile(source);
  var wrapper = {isCreate: Form.create, isLogin: Form.login};
  var output = template(wrapper);
  $("#output").html(output);
}


var updatePost = function (post) {
  id = "#"+post.id;
  console.log(post);
  $(id+"> .content > .header > a").html(post.title);
  $(id+"> .content > .details > .points").html(post.info.points+" points ");
}

var renderGraphs = function (data) {
  $.plot("#output", [{
    data: data,
    lines: {show: true}
  }]);
}

var showPostArticle = function (obj) {
  //var paragraphs = obj.Paragraphs;
  var post = obj.Post;
  console.log(post);
  console.log(obj.Paragraphs);
  var selector = "div#"+post.id+".list.article";
  console.log(selector);
  for(var i=0; i<(obj.Paragraphs.length-1 && 4); i++){
    $(selector).append("<p>"+obj.Paragraphs[i]+"</p>");
  }
}

var eventHandler = function (event) {
  var event_class = $(event.target).attr("class").split(" ")[$(event.target).attr("class").split(" ").length-1], 
      ajax_path = "",
      event_id = $(event.target).attr("class").split(" ")[2] || event.target.id,
      post_id = $(event.target).parent().attr("id") || $(event.target).parent().parent().attr("id");
  if(event_id === "graph"){
    ajax_path = "graph/";
  }else {
    ajax_path = "post/"
  }

  //@TODO: Clean up client side event handling (maybe with BackboneJS or Angular?)
  /* CLIENT-SIDE route handling */
  console.log("class:"+event_class);
  if(event_class === "article"){

    ajax_path += "article?id="+post_id;
    var target_post = client_Posts.get_obj(parseInt(post_id));
    var selector1 = "div#"+post_id+".list.article";
    var selector2 = "div#"+post_id+".item > a ";
    $.get(ajax_path, function (data) {
      $(selector2+"> i.icon").toggleClass("down").toggleClass("up");
      if( $(selector1+"> p").html() !== data.Paragraphs[0] ){
        
        if( data.Paragraphs[0] === undefined){
          data.Paragraphs = ["Could not grab text from page. Please click link above to view", "", "", ""];
        }
        showPostArticle(data);
      } else {
        $(selector1).toggle();
      }
    });
  }else if(event_id === "graph"){
    ajax_path = "graph/all";
    $.get(ajax_path, function (data) {
      renderGraphs(data);
    });
  }

  else if(event_class === "upvote" && client[ip][parseInt(post_id)].vote !== 0) { return;}

  /* POST AJAX for CRUD */
  else if(event_class === "crud"){
    
    if($(event.target).prop("tagName") === "BUTTON"){
      
      $.post("crud/"+event.target.id,
        {title: $(".title").html(), url: $(".link").html()})
        .done(function(data){
          console.log(".crud");
          console.log(data); 
          return;
        });
    }else {
      var Form = {};
      Form.create = false;
      Form.login = false;
      if(event.target.id === "create"){
        Form.create = true;
      }else if(event.target.id === "login") {
        Form.login = true;
      }
      renderForm(Form);
      return;
    }
  }
  else {

    if(event_class === "upvote") {
      client[ip][parseInt(post_id)].vote++;
      ajax_path += "upvote?id="+post_id;
    }
    else {
      $(".ui.progress.striped").show();
      if( $(event.target).hasClass("sort") ){
        ajax_path += "sort/" + event.target.id;
      }
      else{
        ajax_path += event_id;
      }
    }
    console.log(ajax_path);
    $.get( ajax_path, function (data) {
      $(".ui.progress.striped").hide();

      if(event.target.id !== "trend"){
        $(".ui.sub.menu").show();
      }else {
        $(".ui.sub.menu").hide();
      }
      //Render new view only if we need to
      if(!data.no_render){
        if(event_class !== "upvote"){  
          client_Posts.set(data);
          renderAllPosts(data);
        } else if(event_class == "article"){
          console.log("Article Event");
        }else{
          client_Posts.set_obj(data, parseInt(data.id));
          updatePost(data);
        }
      }
    });
    return;
  }
}
getIP = function() {
    if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
    else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xmlhttp.open("GET","http://api.hostip.info/get_html.php",false);
    xmlhttp.send();

    hostipInfo = xmlhttp.responseText.split("\n");

    for (i=0; hostipInfo.length >= i; i++) {
        ipAddress = hostipInfo[i].split(":");
        if ( ipAddress[0] == "IP" ) return ipAddress[1];
    }

    return false;
}
var client = {};
$(function() {
  $(".ui.progress.striped").hide();
  $(".ui.sub.menu").hide();
  
  ip = getIP();

  if(!client[ip]) {
    client[ip] = [];
    for(var i=0; i<30; i++){
      client[ip][i] = {vote: 0};
    }
  }

  $(document).on('click', ".ajax", eventHandler);
})  
function getip (json){
   return json.ip;
  }