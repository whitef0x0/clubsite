Hackernews = require './hackernews'

hn = new Hackernews()
hn.scrapeItem '2772718', (comments) ->
	console.log comments[7]

