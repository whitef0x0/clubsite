/*
  SCRAPER BOT for HN
*/

//modules
var events = require('events'),
    jsdom = require('jsdom'),
    request = require('request'),
    _ = require('underscore'),
    fs = require('fs');

var jquery = fs.readFileSync("./public/javascripts/jquery-2.1.0.js", "utf-8");
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};


var Hackernews = (function() {
  

  __extends(Hackernews, events.EventEmitter);
  function Hackernews() {
    this.base = 'http://news.ycombinator.com';
    this.news = this.base + '/news';
    this.newest = this.base + '/newest';
    this.ask = this.base + '/ask';
  }
  Hackernews.prototype.scrape_int = function(Url, callback) {
    var self;
    self = this;
    return jsdom.env({url: self.base+Url, src:[jquery], done: function(err, win) {
        var $, posts, i;
        $ = win.$;
        posts = [];
        i = 0;
        $('td.title:not(:last) > a').each(function() {
          var title, tmp;
          title = $(this).text();
          url = $(this).attr('href');
          posts[i] = {
            title: title,
            url: url,
            info: {},
            id: i
          };
          $('td.subtext:eq(' + i + ') > *').each(function() {
            var data, raw;
            raw = $(this).text();
            data = raw.split(' ')[0];
            if (raw.indexOf('points') !== -1) {
              return posts[i].info.points = data;
            } else if (raw.indexOf('comments') !== -1) {
              posts[i].itemId = $(this).attr('href').split('=')[1];
              return posts[i].info.comments = data;
            } else if (raw.indexOf('discuss') === -1) {
              return posts[i].info.postedBy = data;
            }
          });
          tmp = $('td.subtext:eq(' + i + ')').text();
          if (posts[i].info.postedBy != null) {
            posts[i].info.date = tmp.split(posts[i].info.postedBy + ' ')[1].split('ago')[0];
          }
          var date_tmp = tmp.split(" ").splice(4,2);
          date_obj = new Date();

          if(date_tmp[1] == "minutes"){
            date_obj.setMinutes(date_obj.getMinutes() - parseInt(date_tmp));
          }else if(date_tmp[1] == "hours"){
            date_obj.setHours(date_obj.getHours() - parseInt(date_tmp));
          }else if(date_tmp[1] == "days"){
            date_obj.setDate(date_obj.getDate - parseInt(date_tmp));
          }


          if(!posts[i].info.points) posts[i].info.points = 0;
          posts[i].info.date = date_obj;
          self.emit('doc', posts[i]);
          return i++;
        });
        if (callback != null) {
          return callback(posts);
        }
      }
    });
  }
  Hackernews.prototype.scrape_paragraph = function(Url, callback) {
    var self;
    self = this;
    return jsdom.env({url: Url, src: [jquery],
      done: function(err, win) {
        var $, article = [], i, count;
        $ = win.$;
        i = 0;
        count = 0;
        /*
        if ( $('article > * > p').html() != undefined ) {
          target = $('article > * > p');
        }else if( $('article > * > p').html() != undefined)*/
        $("article p+p, div[class^='article'] p+p,div[class*=' article'] p+p").each(function() {
          if($(this).text() !== ""){
            article[i] = $(this).text();
            i++;
          }else if(count < 2){
            count++;
          }else {
            return false;
          }
        });
        if (callback != null) {
          return callback(article);
        }
      }
    });
  };
  
  
  Hackernews.prototype.scrapeItem = function(itemId, callback) {
    var self, url;
    self = this;
    url = this.base + '/item?id=' + itemId;
    return request({
      uri: url
    }, function(err, res, body) {
      return jsdom.env({html: body, src: [jquery], done: function(err, win) {
        var $, comments, i;
        $ = win.$;
        comments = [];
        i = 0;
        $('td.default').each(function() {
          var b, comment, n, pos, t, tmp;
          comment = {};
          comment.replies = [];
          pos = parseInt($(this).parent().get(0).childNodes[0].childNodes[0].attributes.getNamedItem('width').nodeValue);
          pos = pos / 40;
          comment.pos = pos;
          b = i + 1;
          $('span.comhead:eq(' + b + ') > a').each(function() {
            var text;
            text = $(this).text();
            if (text.indexOf('link') === -1) {
              return comment.postedBy = text;
            } else {
              return comment.itemId = $(this).attr('href').split('=')[1];
            }
          });
          tmp = $('span.comhead:eq(' + b + ')').text();
          comment.date = tmp.split(comment.postedBy + ' ')[1].split('ago')[0] + 'ago';
          $('span.comment:eq(' + i + ') > *').each(function() {
            return comment.text = $(this).text();
          });
          t = '_.last(comments)';
          if (pos > 0) {
            for (n = 1; 1 <= pos ? n <= pos : n >= pos; 1 <= pos ? n++ : n--) {
              if (n === pos) {
                t = t + '.replies';
              } else {
                t = '_.last(' + t + '.replies)';
              }
            }
            eval(t + '.push(comment)');
            self.emit('reply', comment);
          } else {
            comments.push(comment);
            self.emit('comment', comment);
          }
          return i++;
        });
        if (callback != null) {
          return callback(comments);
        }
        }
      });
    });
  };
  return Hackernews;
})();


module.exports = Hackernews;
