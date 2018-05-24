var 	express = require('express');  
var 	app = express();  
var 	server = require('http').createServer(app);  
var 	io = require('socket.io')(server);
var		Gpio = require('pigpio').Gpio;

		in1 	= new Gpio(5, 	{mode: Gpio.OUTPUT}),
		in2 	= new Gpio(6, 	{mode: Gpio.OUTPUT}),
		in3 	= new Gpio(27, 	{mode: Gpio.OUTPUT}),
		in4 	= new Gpio(22, 	{mode: Gpio.OUTPUT}),
		pwm1	= new Gpio(13,	{mode: Gpio.OUTPUT}),
		pwm2	= new Gpio(17,	{mode: Gpio.OUTPUT});


		function forward() {
			in1.digitalWrite(1);
			in2.digitalWrite(0);
			in3.digitalWrite(1);
			in4.digitalWrite(0);
			console.log('Frente');
		}

		function backward() {
			in1.digitalWrite(0);
			in2.digitalWrite(1);
			in3.digitalWrite(0);
			in4.digitalWrite(1);
			console.log('Tras');
		}

		function right() {
			in1.digitalWrite(0);
			in2.digitalWrite(1);
			in3.digitalWrite(1);
			in4.digitalWrite(0);
			console.log('Direita');
		}

		function left() {
			in1.digitalWrite(1);
			in2.digitalWrite(0);
			in3.digitalWrite(0);
			in4.digitalWrite(1);
			console.log('Esquerda');
		}

		function stop(){
			in1.digitalWrite(1);
			in2.digitalWrite(1);
			in3.digitalWrite(1);
			in4.digitalWrite(1);
			console.log('Parar');
		}

		stop();

		duty1 = 255;
		duty2 = 255;

		setInterval(function () {
			pwm1.pwmWrite(duty1);
			pwm2.pwmWrite(duty2);
		}, 20);


app.use(express.static(__dirname));  
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

      socket.on('direction', function(direction){

        switch(direction) {
			    case 'dir:up':
			        forward();
			        break;
			    case 'dir:left':
			        left();
			        break;
			    case 'dir:right':
			        right();
			        break;
			    case 'dir:down':
			        backward();
			        break;
			    case 'end':
			        stop();
			        break;
			}

      });

      socket.on('pwm', function(direction){
      	duty1 = Math.floor(direction*2);
      	duty2 = Math.floor(direction*2);
      });

    });