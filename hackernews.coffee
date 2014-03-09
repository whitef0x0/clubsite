events = require 'events'
jsdom = require 'jsdom'
request = require 'request'
_ = require 'underscore'
fs = require 'fs'

class Hackernews extends events.EventEmitter
	constructor: ->
		@base = 'http://news.ycombinator.com'
		@news = @base+'/news'
		@newest = @base+'/newest'
		@ask = @base+'/ask'
		
	scrape: (url, callback) ->
		self = @
		jsdom.env url, [ 'http://code.jquery.com/jquery-1.5.min.js' ], (err, win) ->
			$ = win.$
			docs = []
			i = 0
			$('td.title:not(:last) > a').each ->
				title = $(@).text()
				url = $(@).attr 'href'
				docs[i] = { title: title, url: url, info: {} }
				$('td.subtext:eq('+i+') > *').each ->
					raw = $(@).text()
					data = raw.split(' ')[0]
					if raw.indexOf('points') isnt -1	
						docs[i].info.points = data
					else if raw.indexOf('comments') isnt -1
						docs[i].itemId = $(@).attr('href').split('=')[1]
						docs[i].info.comments = data
					else if raw.indexOf('discuss') is -1
						docs[i].info.postedBy = data
						
				tmp = $('td.subtext:eq('+i+')').text()
				if docs[i].info.postedBy?
					docs[i].info.postedAgo = tmp.split(docs[i].info.postedBy+' ')[1].split('ago')[0]+'ago'
				docs[i].info.postedAgo = tmp
				self.emit 'doc', docs[i]
				i++
				
			if callback?
				callback docs
		
	scrapeItem: (itemId, callback) ->
		self = @
		url = @base+'/item?id='+itemId
		request uri: url, (err, res, body) ->
			jsdom.env body, [ 'jquery-1.5.min.js' ], (err, win) ->
				$ = win.$
				comments = []
				i = 0
				$('td.default').each ->
					comment = {}
					comment.replies = []
					
					pos = parseInt $(@).parent().get(0).childNodes[0].childNodes[0].attributes.getNamedItem('width').nodeValue
					pos = pos / 40
									
					comment.pos = pos 
				
					b = i+1
					$('span.comhead:eq('+b+') > a').each ->
						text = $(@).text()
						if text.indexOf('link') is -1
							comment.postedBy = text
						else
							comment.itemId = $(@).attr('href').split('=')[1]
				
					tmp = $('span.comhead:eq('+b+')').text()
					comment.postedAgo = tmp.split(comment.postedBy+' ')[1].split('ago')[0]+'ago'
				
					$('span.comment:eq('+i+') > *').each ->
						comment.text = $(@).text()
				
					t = '_.last(comments)'
					if pos > 0
						for n in [1..pos]
							if n is pos
								t = t+'.replies'
							else
								t = '_.last('+t+'.replies)'
						eval t+'.push(comment)'
						self.emit 'reply', comment
					else 
						comments.push comment
						self.emit 'comment', comment
					i++
			
				if callback?
					callback comments
			
module.exports = Hackernews