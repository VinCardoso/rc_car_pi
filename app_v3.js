// var http = require("http");
// var express = require("express");
// var app = express();
// var port = process.env.port || 80;

// var io = require('socket.io').listen(app.listen(port));

// app.use(express.static(__dirname + '/public'));

// app.get('/', function(req, res) {
//     res.sendFile(__dirname + '/client.html')
// });

// io.sockets.on('connection', function (socket) {
//     socket.on('pirstatus', function (data) { 
//         io.sockets.emit('pirstatus', data);
//     });
// });

// console.log("Listening on port " + port);



var 	express = require('express');  
var 	app = express();  
var 	server = require('http').createServer(app);  
var 	io = require('socket.io')(server);
var		Gpio = require('onoff').Gpio;

		in1 = new Gpio(4, 'out'),
		in2 = new Gpio(17, 'out'),
		in3 = new Gpio(27, 'out'),
		in4 = new Gpio(22, 'out');

		function go(lado){

			switch(lado) {
			    case 'front':
			        in1.writeSync(1);
					in2.writeSync(0);
					in3.writeSync(1);
					in4.writeSync(0);
					console.log('Frente');
			        break;
			    case 'left':
			        in1.writeSync(1);
					in2.writeSync(0);
					in3.writeSync(0);
					in4.writeSync(1);
					console.log('Esquerda');
			        break;
			    case 'right':
			        in1.writeSync(0);
					in2.writeSync(1);
					in3.writeSync(1);
					in4.writeSync(0);
					console.log('Direita');
			        break;
			    case 'back':
			        in1.writeSync(0);
					in2.writeSync(1);
					in3.writeSync(0);
					in4.writeSync(1);
					console.log('Ré');
			        break;
			    default:
			        console.log('Erro');
			}

		}
		function forward() {
			in1.writeSync(1);
			in2.writeSync(0);
			in3.writeSync(1);
			in4.writeSync(0);
			console.log('Frente');
		}

		function backward() {
			in1.writeSync(0);
			in2.writeSync(1);
			in3.writeSync(0);
			in4.writeSync(1);
			console.log('Ré');
		}

		function right() {
			in1.writeSync(0);
			in2.writeSync(1);
			in3.writeSync(1);
			in4.writeSync(0);
			console.log('Direita');
		}

		function left() {
			in1.writeSync(1);
			in2.writeSync(0);
			in3.writeSync(0);
			in4.writeSync(1);
			console.log('Esquerda');
		}

		function stop(){
			in1.writeSync(1);
			in2.writeSync(1);
			in3.writeSync(1);
			in4.writeSync(1);
			console.log('Parar');
		}

		stop();


app.use(express.static(__dirname));
// app.use(express.static(__dirname + '/node_modules'));  
// app.get('/', function(req, res,next) {  
//     res.sendFile(__dirname + '/index.html');
// });

// app.get('/styles.css', function(req, res,next) {  
//     res.sendFile(__dirname + '/styles.css');
// });

// app.get('/github-light.css', function(req, res,next) {  
//     res.sendFile(__dirname + '/github-light.css');
// });

server.listen(80);  


io.on('connection', function(socket){

      socket.on('car-control', function(direction){

        console.log(direction);

        switch(direction) {
			    case 'dir:up':
			        in1.writeSync(1);
					in2.writeSync(0);
					in3.writeSync(1);
					in4.writeSync(0);
					console.log('Frente');
			        break;
			    case 'dir:left':
			        in1.writeSync(1);
					in2.writeSync(0);
					in3.writeSync(0);
					in4.writeSync(1);
					console.log('Esquerda');
			        break;
			    case 'dir:right':
			        in1.writeSync(0);
					in2.writeSync(1);
					in3.writeSync(1);
					in4.writeSync(0);
					console.log('Direita');
			        break;
			    case 'dir:down':
			        in1.writeSync(0);
					in2.writeSync(1);
					in3.writeSync(0);
					in4.writeSync(1);
					console.log('Ré');
			        break;
			    case 'end':
			        in1.writeSync(1);
					in2.writeSync(1);
					in3.writeSync(1);
					in4.writeSync(1);
					console.log('Parar');
			        break;
			}

      });

    });








// var http = require("http");
// var express = require("express");
// var app = express();
// var port = process.env.port || 3700;

// var io = require('socket.io').listen(app.listen(port));

// app.use(express.static(__dirname + '/public'));

// app.get('/', function(req, res) {
//     res.sendFile(__dirname + '/client.html')
// });

// io.sockets.on('connection', function (socket) {
//     socket.on('pirstatus', function (data) { 
//         io.sockets.emit('pirstatus', data);
//     });
// });

// console.log("Listening on port " + port);





//   led = new gpio(4, {mode: Gpio.OUTPUT}),
//   dutyCycle = 0;
 
// setInterval(function () {
//   led.pwmWrite(dutyCycle);
 
//   dutyCycle += 5;
//   if (dutyCycle > 255) {
//     dutyCycle = 0;
//   }
// }, 20);