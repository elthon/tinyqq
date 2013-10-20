EventEmitter = require('events').EventEmitter

class Worker extends EventEmitter
	constructor: (connection) ->
		@conn = connection
		console.log 1

	run: ->
		@on 'd', (e)->
					console.log e
		@emit 'd', {"status": -1}

worker = new Worker(null)

worker.run
