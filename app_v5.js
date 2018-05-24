var 	express = require('express');  
var 	app = express();  
var 	server = require('http').createServer(app);  
var 	io = require('socket.io')(server);
var		pigpio = require('pigpio'),
  		Gpio = pigpio.Gpio;

		pigpio.configureClock(5, pigpio.CLOCK_PWM);

		in1 	= new Gpio(5, 	{mode: Gpio.OUTPUT}),
		in2 	= new Gpio(6, 	{mode: Gpio.OUTPUT}),
		in3 	= new Gpio(27, 	{mode: Gpio.OUTPUT}),
		in4 	= new Gpio(22, 	{mode: Gpio.OUTPUT}),
		in5 	= new Gpio(23, 	{mode: Gpio.INPUT}),
		led		= new Gpio(24, 	{mode: Gpio.OUTPUT}),
		pwm1	= new Gpio(13,	{mode: Gpio.OUTPUT}),
		pwm2	= new Gpio(17,	{mode: Gpio.OUTPUT});


		function stop(){
			in1.digitalWrite(1);
			in2.digitalWrite(1);
			in3.digitalWrite(1);
			in4.digitalWrite(1);
			console.log('Stop');
		}

		function front() {
			in1.digitalWrite(1);
			in2.digitalWrite(0);
			in3.digitalWrite(1);
			in4.digitalWrite(0);
			console.log('Front');
		}

		function back() {
			in1.digitalWrite(0);
			in2.digitalWrite(1);
			in3.digitalWrite(0);
			in4.digitalWrite(1);
			console.log('Back');
		}

		stop();
		
		duty_left = 0;
		duty_right = 0;

		total = 0;
		p = in5.digitalRead();
		p_last = 0;
		cont = 0;

		setInterval(function () {

			pwm1.pwmWrite(duty_right);
			pwm2.pwmWrite(duty_left);

			p = in5.digitalRead();
			//io.emit('valor',in5.digitalRead());
			total = total + 1;
			if(total != 100){
				if(p == p_last){

				}else{
					if(p == 1 && p_last == 0){
						cont = cont + 1;
					}
					
					p_last = p;

				}
			}else{
				
				io.emit('valor',cont);
				cont = 0;
				total = 0;
			}
			


		}, 10);



app.use(express.static(__dirname));  
server.listen(80);  

min = 0;
max = 255;

io.on('connection', function(socket){

	socket.on('joy', function(a,b,c){
		
		x = a;
		y = b;
		speed = c;

		if(x>0){
			duty_left = ((speed)*max).toFixed(0);
			duty_right = ((speed - (speed*x))*max).toFixed(0);
		}else if(x<0){
			duty_left = ((speed - (speed*(-x)))*max).toFixed(0);
			duty_right = ((speed)*max).toFixed(0);
		}

		if (y<0){
			front();
		}else if(y>0){
			back();
		} 


	});

	socket.on('unpress', function(a,b){
		stop();
	});

	socket.on('data', function(a){
		console.log(a);

		var trechos = a;

		while(trechos != 0){
			led.digitalWrite(1);
			setTimeout(function(){
				led.digitalWrite(0);
			},500);
			setTimeout(function(){
				trechos = trechos -1;
			},500);
			
		}


	});



});



