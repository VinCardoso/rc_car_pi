
// Início

	// Importando Bibliotecas
		var 	express 	= require('express');  
		var 	app 		= express();  
		var 	server 		= require('http').createServer(app);  
		var 	io 			= require('socket.io')(server);
		var 	$			= require('jquery');
		var		pigpio 		= require('pigpio'),
		  		Gpio 		= pigpio.Gpio;
		var 	date 		= new Date();

	// Variáveis de Configurações Iniciais
	
		var 	size_wheel		= 45; 		// Tamanho do Pneu (em cm)
		var 	wheel_div		= 2;		// Divisões da roda
		var 	distance 		= 0;		// Distância Inicial
		var 	initial_duty 	= 0;		// Valor Inicial Duty Cicle
		var 	min_duty		= 0;		// Valor Mínimo Duty Cicle
		var 	max_duty		= 254;		// Valor Máximo Duty Cicle
		var 	no_signal_time	= 2000;		// Tempo sem sinal para cortar velocidade (em milesegundos)

	// Configurar Pinos

		pigpio.configureClock(5, pigpio.CLOCK_PWM);				// Definir Clock do PWM dos motores

		var 	in1 	= new Gpio(5, 	{mode: Gpio.OUTPUT});	// Enable 1
		var 	in2 	= new Gpio(6, 	{mode: Gpio.OUTPUT});	// Enable 2
		var 	in3 	= new Gpio(27, 	{mode: Gpio.OUTPUT});	// Enable 3
		var 	in4 	= new Gpio(22, 	{mode: Gpio.OUTPUT});	// Enable 4

		var 	encoder = new Gpio(26, 	{mode: Gpio.INPUT, edge: Gpio.EITHER_EDGE});	// Sinal de Leitura de Velocidade do Encoder

		// Set PWM
		var 	pwm1	= new Gpio(13,	{mode: Gpio.OUTPUT});	// Saída do PWM Motor 1
		var 	pwm2	= new Gpio(17,	{mode: Gpio.OUTPUT});	// Saída do PWM Motor 2
		
	

// Funções Gerais do Carro

	var car = new function(){

		var 	_self 			= this;

		// Variaveis do Carro
			var 	dis_m					= (size_wheel/wheel_div)/100;	// Distancia em Metros entre interrupções do sensor "passadas"
			var 	duty1					= initial_duty;					// DutyCicle da Direita
			var 	duty2					= initial_duty;					// DutyCicle da Esquerda
			var 	time 					= date.getTime();				// Pegar Tempo inicial;
			var 	time_signal				= date.getTime();				// Pegar Tempo inicial para Sem Sinal
			var 	part_active 			= false;						// Está no modo trechos (setado após ser enviado e gravado os trecos)
			var 	car_speed           	= 0;							// Velocidade do Carrinho			
			var 	car_distance        	= 0;							// Distancia que o Carrinho Percorreu para Mostrar no Controle
			var 	n_part					= null;							// Número de Trechos
			var 	part_distance			= null;							// Distancias dos Trechos
			var 	part_speed				= null;							// Velocidades dos Trechos
			var 	start_time				= null;							// Tempo que iniciou o modo Trechos
			var 	part_runed				= null;							// Distância já percorrida no trecho atual
			var 	actual_part				= null;							// Trecho Atual
			var 	total_part				= null;							// Total em Metros do Trecho Atual


		// Setar Pinos Enable
			_self.pins = function(a,b,c,d){
				in1.digitalWrite(a);
				in2.digitalWrite(b);
				in3.digitalWrite(c);
				in4.digitalWrite(d);
			}


		// PARAR Carrinho
			_self.stop = function(){
				_self.pins(1,1,1,1);
				// console.log('Stop');										// ------->> Debug
			}


		// Setar Carro para ir para FRENTE
			_self.front = function() {
				_self.pins(1,0,1,0);
			}


		// Setar Carro para ir  para TRÁS
			_self.back = function() {
				_self.pins(0,1,0,1);
			}


		// Determinar Direção e Velocidade do Carrinho
			_self.dir_speed = function(x,y,speed){

				// Definir Velocidade dos PWM

					if(x>0){
						duty1 = ((speed)*max_duty);
						duty2 = ((speed - (speed*x))*max_duty);
					}else if(x<0){
						duty1 = ((speed - (speed*(-x)))*max_duty);
						duty2 = ((speed)*max_duty);
					}

				// Determinar Velocidade para Carrinho
					
					_self.set_speed(duty1,duty2);
				
				// Selecionar Direção Frente ou Trás

					if (y<0){
						_self.front();
					}else if(y>0){
						_self.back();
					}

				// Gravar último tempo do sinal recebido e manipulado
					var date_signal 	= new Date();
					time_signal			= date_signal.getTime();
					_self.no_signal();

			}


		// Tratar perda de Sinal
			_self.no_signal = function(){

				var date_signal 		= new Date();
				var check_time 			= date_signal.getTime() - time_signal;

				if(check_time > no_signal_time){
					// console.log('Sem Sinal');							// ------->> Debug
					_self.stop();
				}
			}


		// Setar Velocidade dos PWM

			_self.set_speed = function(esq,dir){

				var set_dir = (dir > max_duty && dir < min_duty) ? max_duty : dir.toFixed(0);
				var set_esq	= (esq > max_duty && esq < min_duty) ? max_duty : esq.toFixed(0);

				// console.log(set_dir + " " +set_esq);						// ------->> Debug

				pwm1.pwmWrite(set_dir);
				pwm2.pwmWrite(set_esq);

			}


		// Calcular Velocidade

			_self.speed_measure = function(){

				var date 	= new Date();
				result 		= date.getTime() - time;
				time =  date.getTime();

		        seg = result/(1000*60);
		       	car_speed = dis_m/seg;

		       	_self.distance();

		     	// console.log(speed.toFixed(2)+' m/min');					// ------->> Debug			

			}


		// Mensurar distância

			_self.distance = function(){
				
				car_distance = car_distance + dis_m;
				_self.count_run();

			}


		// Enivar velocidade e distancia para controle

			_self.send_run_info = function(){
				speed = car_speed.toFixed(2);
				distance = car_distance.toFixed(2);
				// console.log("Velocidade: "+speed+" Distancia: "+distance+" Trecho Atual: "+actual_part+" Total do Trecho: "+total_part); // ------->> Debug	
				io.emit('run_info', speed, distance,actual_part,total_part);
			}


		// Tratar Trechos

			_self.set_trechos = function(dist,speed){

				if(dist.length < 30){// Condição apenas para tratar um erro que acontece no raspberry que está enviando dados de 38 dados de 1

					// console.log(dist);									// ------->> Debug
					// console.log(speed);									// ------->> Debug

					for (i = 0; i < dist.length; i++) {
	    				// console.log(dist[i] + " " + speed[i]); 			// ------->> Debug
					}

					part_distance 	= dist;
					part_speed 		= speed;
					n_part 			= dist.length;

					// console.log("Qunatidade de Trechos: " + dist.length);// ------->> Debug

					for (i = 0; i < dist.length; i++) {
	    				// console.log(dist[i] + " " + speed[i]); 			// ------->> Debug
					}

					io.emit('active-start-button');

				}


			}


		// Inicar Rally
			_self.start_rally = function(data){

				var data 			= new Date();
				start_time			= data.getTime();

				part_active			= true;
				actual_part 		= 1;
				indice 				= actual_part - 1;
				total_part  		= part_distance[indice];
				car_distance		= 0;

				io.emit('rally-started');

				// console.log("Parte Atual:" + actual_part + " Total dessa Parte: " +total_part);	// ------->> Debug

				_self.send_run_info(car_speed, car_distance,actual_part,total_part);
			}


		// Contar quantidade andada na corrida
			_self.count_run = function(){

				if(part_active){
					if(car_distance >= total_part){
						if(actual_part < n_part){
							actual_part++;
							indice = actual_part - 1;
							total_part = part_distance[indice];
							car_distance = 0;
						}else{
							console.log('Acabou');							// ------->> Debug
							car_distance = 0;
							part_active  = false;
							io.emit('rally-ended')
																							
						}
						
					}

				}

				_self.send_run_info();

			}

		
		// Verificar se carro está no ponto correto do rally
			_self.validate_position = function(){
				
			} 

	}

// Verificar no Signal
	
	setInterval(function(){
		car.no_signal();
	}, no_signal_time/2);

// Contando borda de subida e enviadno para o controle
	
	encoder.on('interrupt', function (level) {
		  if(level === 1){
		    car.speed_measure();
		  }
	});

// Conexão com o Controle
	
	// "Ligar" servidor
		app.use(express.static(__dirname));  
		server.listen(80);

	// Funções recebidas do carrinho
		io.on('connection', function(socket){

			// Chegou nova posição do Joystick
				socket.on('joy', function(a,b,c){car.dir_speed(a,b,c)});

			// Chegou Função soltou Joystick
				socket.on('unpress', function(a,b){car.stop()});

			// Chegou Dados dos Trechos
				socket.on('data', function(dist,speed){car.set_trechos(dist,speed)});

			// Chegou botão iniciar rally precionado
				socket.on('start', function(data){car.start_rally(data)});

		});
