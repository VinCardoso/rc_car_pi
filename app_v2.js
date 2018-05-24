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


app.use(express.static(__dirname + '/node_modules'));  
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});

server.listen(100);  


io.on('connection', function(socket){

      socket.on('car-control', function(direction, value){

        if(value == 'able'){
          go(direction);
        }else{
          stop();
        }

      });

    });