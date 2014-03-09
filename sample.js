(function() {
  var Hackernews, hn;
  Hackernews = require('./hackernews');
  hn = new Hackernews();
  hn.scrapeItem('2772718', function(comments) {
    return console.log(comments[7]);
  });
}).call(this);
