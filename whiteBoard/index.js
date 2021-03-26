const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3001;
var list = []
app.use(express.static(__dirname + '/public'));

function onConnection(socket) {
    socket.on("message", (args) => {
        socket.emit("message", list);
        console.log("User Connected");
    });

    socket.on('drawing', function(data) {
        list.push(['pencil', data]);
        socket.broadcast.emit('drawing', data);
        console.log(data);
        //console.log(list[list.length]);
    });

    socket.on('rectangle', function(data) {
        list.push(['rect', data]);
        socket.broadcast.emit('rectangle', data);
        console.log(data);
    });

    socket.on('linedraw', function(data) {
        list.push(['line', data]);
        socket.broadcast.emit('linedraw', data);
        console.log(data);
    });

    socket.on('circledraw', function(data) {
        list.push(['circle', data]);
        socket.broadcast.emit('circledraw', data);
        console.log(data);
    });

    socket.on('ellipsedraw', function(data) {
        list.push(['ell', data]);
        socket.broadcast.emit('ellipsedraw', data);
        console.log(data);
    });

    socket.on('textdraw', function(data) {
        list.push(['text', data]);
        socket.broadcast.emit('textdraw', data);
        console.log(data);
    });

    socket.on('copyCanvas', function(data) {
        list.push(['cc', data]);
        socket.broadcast.emit('copyCanvas', data);
        console.log(data);
    });

    socket.on('Clearboard', function(data) {
        list = []
        socket.broadcast.emit('Clearboard', data);
        console.log(data);
    });

    socket.on('disconnect', () => {
        console.log("User disconnected");
    });
}
io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));