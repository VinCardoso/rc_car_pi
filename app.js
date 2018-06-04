// Configurações Iniciais

	// Importando Bibliotecas
		var 	express 	= require('express');  
		var 	app 		= express();  
		var 	server 		= require('http').createServer(app);  
		var 	io 			= require('socket.io')(server);
		var		pigpio 		= require('pigpio'),
		  		Gpio 		= pigpio.Gpio;

	// Configurar Pinos
		pigpio.configureClock(5, pigpio.CLOCK_PWM);		// Definir Clock do PWM dos motores

		var 	in1 	= new Gpio(5, 	{mode: Gpio.OUTPUT});	// Enable 1
		var 	in2 	= new Gpio(6, 	{mode: Gpio.OUTPUT});	// Enable 2
		var 	in3 	= new Gpio(27, 	{mode: Gpio.OUTPUT});	// Enable 3
		var 	in4 	= new Gpio(22, 	{mode: Gpio.OUTPUT});	// Enable 4

		var 	encoder = new Gpio(26, 	{mode: Gpio.INPUT, edge: Gpio.EITHER_EDGE});	// Sinal de Leitura de Velocidade do Encoder

		// Set PWM
		var 	pwm1	= new Gpio(13,	{mode: Gpio.OUTPUT});	// Saída do PWM Motor 1
		var 	pwm2	= new Gpio(17,	{mode: Gpio.OUTPUT});	// Saída do PWM Motor 2

// Funções Gerais

	var car = new function(){

		var 	_self 		= this;
		var 	date 		= new Date();
		var 	time 		= date.getTime();
		var 	size_wheel	= 30; 					// em centimetros
		var 	wheel_div	= 4;					// divisões na roda
		var 	dis_mar		= (size_wheel/wheel_div)/100;

		// Setar Pinos Enable

			_self.pins = function(a,b,c,d){
				in1.digitalWrite(a);
				in2.digitalWrite(b);
				in3.digitalWrite(c);
				in4.digitalWrite(d);
			}

		// Parar Carrinho
			_self.stop = function(){
				_self.pins(1,1,1,1);
				console.log('Stop');
			}

		// Carrinho Frente
			_self.front = function() {
				_self.pins(1,0,1,0);
				console.log('Front');
			}

		// Carro para Trás
			_self.back = function() {
				_self.pins(0,1,0,1);
				console.log('Back');
			}

		// Calcular Velocidade
			_self.speed_measure = function(){
				var date 	= new Date();
				result 		= date.getTime() - time;
				time =  date.getTime();
				
				// var days_diff= Math.floor(result/1000/60/60/24);
		  		// result -= days_diff*1000*60*60*24;

		  		// var hours_diff = Math.floor(result/1000/60/60);
		  		// result -= hours_diff*1000*60*60;

		        // var minutes_diff = Math.floor(result/1000/60);
		        // result -= minutes_diff*1000*60;

		        // var seconds_diff = Math.floor(result/1000);
		        // result -= seconds_diff*1000;

		        // var mili_diff = Math.floor(result);

		        seg = result/(1000*60);
		       	speed = dis_mar/seg;

		     	// console.log(minutes_diff + ':' + seconds_diff + '.' + mili_diff);

		     	console.log(speed+'m/min');



			}

		// Enivar velocidade para controle
			_self.send_speed = function(){

			}

		// Tratar 

	}


	// Duty Cycle Inicial
		duty_left = 0;
		duty_right = 0;

		setInterval(function () {

			pwm1.pwmWrite(duty_right);
			pwm2.pwmWrite(duty_left);

		}, 10);

	// Contando borda de subida e enviadno para o controle
	
		total = 0;
		encoder.on('interrupt', function (level) {
			  if (level === 1) {
			    car.speed_measure();
			  }
		});

// Ativar servidor
	app.use(express.static(__dirname));  
	server.listen(80);  

// Variáveis para poder setar o mínimo e máximo do PWM
	min = 0;
	max = 255;

// Conexão com o Controle
	io.on('connection', function(socket){

		// Receber e tratar Joystick para mover carrinho

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
					car.front();
				}else if(y>0){
					car.back();
				} 

			});


		// Receber Soltou Joystick

			socket.on('unpress', function(a,b){
				car.stop();
			});


		// Receber Trechos

			socket.on('data', function(a){
				console.log(a);

				// var trechos = a;

				// while(trechos != 0){
				// 	led.digitalWrite(1);
				// 	setTimeout(function(){
				// 		led.digitalWrite(0);
				// 	},500);
				// 	setTimeout(function(){
				// 		trechos = trechos -1;
				// 	},500);
			
				// }
			});

	});



