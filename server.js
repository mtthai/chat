var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
   res.sendFile(__dirname + '/index.html');
});

var users = {};

io.on('connection', function(socket){

	socket.on('add user', function(user){
		users[socket.id] = user;
	
		socket.broadcast.emit('new user joins', users[socket.id] + ' has connected');
		io.emit('number of users online', Object.keys(users).length + " users online");
	});

	socket.on('disconnect', function(){
		io.emit('chat message', users[socket.id] + ' has disconnected');
		delete users[socket.id];
	});

	socket.on('chat message', function(msg){
		socket.broadcast.emit('chat message', users[socket.id] + ": " + msg);
	});

	socket.on('whos online', function(){
		socket.emit('chat message', usersOnline());
	})

	socket.on('typing', function(isTyping){
		if(isTyping == true){
			socket.broadcast.emit('is typing', users[socket.id] + " is typing...");
		} else {
			socket.broadcast.emit('is not typing');
		}
	});

	function usersOnline(){
		var str = "";
		for(var user in users){
			let value = users[user];
			str += value + ", ";
		}
		str = str.slice(0, -2);
		str = str + " is online";
		return str;
	}

});

http.listen(process.env.PORT || 3000, function(){
	console.log('listening on *:3000');
});
