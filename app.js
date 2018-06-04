// Configurações Iniciais

	// Importando Bibliotecas
		var 	express 	= require('express');  
		var 	app 		= express();  
		var 	server 		= require('http').createServer(app);  
		var 	io 			= require('socket.io')(server);
		var		pigpio 		= require('pigpio'),
		  		Gpio 		= pigpio.Gpio;
		var 	date 		= new Date();

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
		var 	no_signal_time	= 2000;							// Tempo em millesegundos sem sinal ele corta velocidade

// Funções Gerais

	var car = new function(){

		var 	_self 			= this;

		// Configurações Inicias
			var 	size_wheel		= 45; 							// em centimetros
			var 	wheel_div		= 1;							// divisões na roda
			var 	distance 		= 0;							// Distancia Inicial
			var 	initial_duty 	= 0;							// Valor Inicial DutyCicle
			var 	min_duty		= 0;							// Valor Mínimo DutyCicle
			var 	max_duty		= 255;							// Valor Máximo DutyCicle
			

		// Definições de Variaveis Iniciais
			var 	dis_m			= (size_wheel/wheel_div)/100;	// Distancia em m
			var 	duty1			= initial_duty;					// DutyCicle da Direita
			var 	duty2			= initial_duty;					// DutyCicle da Esquerda
			var 	time 			= date.getTime();				// 0;
			var 	time_signal		= date.getTime();				// Time Signal

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
			}

		// Carro para Trás
			_self.back = function() {
				_self.pins(0,1,0,1);
			}

		// Determinar Direção e Velocidade do Carrinho

			_self.dir_speed = function(x,y,speed){

				// Definir Velocidade dos PWM
				if(x>0){
					duty1 = ((speed)*max_duty).toFixed(0);
					duty2 = ((speed - (speed*x))*max_duty).toFixed(0);
				}else if(x<0){
					duty1 = ((speed - (speed*(-x)))*max_duty).toFixed(0);
					duty2 = ((speed)*max_duty).toFixed(0);
				}

				// Enviar Velocidade PWM
				_self.set_speed(duty1,duty2);
				
				// Selecionar Direção Frente ou Trás
				if (y<0){
					_self.front();
				}else if(y>0){
					_self.back();
				}

				var date_signal 	= new Date();
				time_signal			= date_signal.getTime();
				_self.no_signal();
			}

		// Caso não receba sinal por X millisegundos ele para

			_self.no_signal = function(){

				var date_signal 	= new Date();
				check_time 			= date_signal.getTime() - time_signal;

				if(check_time > no_signal_time){
					console.log('Sem Sinal');
					_self.stop();
				}
			}

		// Setar Velocidade dos PWM

			_self.set_speed = function(esq,dir){

				if(dir>max_duty){
					pwm1.pwmWrite(max_duty);
				}else{
					pwm1.pwmWrite(dir);
				}

				if(esq>max_duty){
					pwm2.pwmWrite(max_duty);
				}else{
					pwm2.pwmWrite(esq);
				}

			}

		// Calcular Velocidade
			_self.speed_measure = function(){

				var date 	= new Date();
				result 		= date.getTime() - time;
				time =  date.getTime();

		        seg = result/(1000*60);
		       	speed = dis_m/seg;

		       	_self.distance(speed.toFixed(2));

		     	console.log(speed+'m/min');

			}

		// Mensurar distância
			_self.distance = function(speed){
				distance = distance + dis_m;
				_self.send_run_info(speed,distance.toFixed(2));
			}

		// Enivar velocidade e distancia para controle
			_self.send_run_info = function(speed,distance){
				io.emit('run_info', speed, distance);
			}

		// Tratar 

	}


// Duty Cycle Inicial
	
setInterval(function(){ car.no_signal();}, no_signal_time);

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
				car.dir_speed(a,b,c);
			});


		// Receber Soltou Joystick
			socket.on('unpress', function(a,b){
				car.stop();
			});


		// Receber Trechos
			socket.on('data', function(a){
				console.log(a);
			});

	});


