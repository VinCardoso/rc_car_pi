
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
	
		var 		size_wheel		= 45; 		// Tamanho do Pneu (em cm) (45 tamanho do carrinho PI e 22 Carrinho Mini)
		var 		wheel_div		= 2;		// Divisões da roda
		var 		distance 		= 0;		// Distância Inicial
		var 		initial_duty 	= 0;		// Valor Inicial Duty Cicle
		var 		min_duty		= 0;		// Valor Mínimo Duty Cicle
		var 		max_duty		= 254;		// Valor Máximo Duty Cicle
		var 		no_signal_time	= 2000;		// Tempo sem sinal para cortar velocidade (em milesegundos)
		


		var 		mini_car 		= false;     // Falar se estou usando o carro pequeno
		var 		mini_size_wheel	= 22; 		// Tamanho do Pneu (em cm) (45 tamanho do carrinho PI e 22 Carrinho Mini)
		var 		mini_wheel_div	= 20;
		

	// Configurar Pinos

		pigpio.configureClock(5, pigpio.CLOCK_PWM);				// Definir Clock do PWM dos motores

		var 	in1 	= new Gpio(5, 	{mode: Gpio.OUTPUT});	// Enable 1
		var 	in2 	= new Gpio(6, 	{mode: Gpio.OUTPUT});	// Enable 2
		var 	in3 	= new Gpio(27, 	{mode: Gpio.OUTPUT});	// Enable 3
		var 	in4 	= new Gpio(22, 	{mode: Gpio.OUTPUT});	// Enable 4

		if(mini_car){
			var 	in1_2 	= new Gpio(19, 	{mode: Gpio.OUTPUT});	// Enable 1-2
			var 	in2_2 	= new Gpio(26, 	{mode: Gpio.OUTPUT});	// Enable 2-2
			var 	in3_2 	= new Gpio(23, 	{mode: Gpio.OUTPUT});	// Enable 3-2
			var 	in4_2 	= new Gpio(24, 	{mode: Gpio.OUTPUT});	// Enable 4-2
		}
		

		var 	encoder = new Gpio(20, 	{mode: Gpio.INPUT, edge: Gpio.EITHER_EDGE});	// Sinal de Leitura de Velocidade do Encoder

		// Set PWM
		var 	pwm1	= new Gpio(13,	{mode: Gpio.OUTPUT});	// Saída do PWM Motor 1
		var 	pwm2	= new Gpio(17,	{mode: Gpio.OUTPUT});	// Saída do PWM Motor 2

		if(mini_car){
			var 	pwm1_2	= new Gpio(16,	{mode: Gpio.OUTPUT});	// Saída do PWM Motor 1
			var 	pwm2_2	= new Gpio(18,	{mode: Gpio.OUTPUT});	// Saída do PWM Motor 2
		}
		
	
// Funções Gerais do Carro

	var car = new function(){

		var 	_self 			= this;

		// Variaveis do Carro
			var 	dis_m					= (size_wheel/wheel_div)/100;	// Distancia em Metros entre interrupções do sensor "passadas"
			var 	duty_dir				= initial_duty;					// DutyCicle da Direita
			var 	duty_esq				= initial_duty;					// DutyCicle da Esquerda
			var 	time 					= date.getTime();				// Pegar Tempo inicial;
			var 	time_signal				= date.getTime();				// Pegar Tempo inicial para Sem Sinal

			var 	set_esq 				= initial_duty;
			var 	set_dir 				= initial_duty;

			var 	car_speed           	= 0;							// Velocidade do Carrinho			
			var 	car_distance        	= 0;							// Distancia que o Carrinho Percorreu para Mostrar no Controle
			
			var 	part_active 			= false;						// Está no modo trechos (setado após ser enviado e gravado os trecos)
			var 	start_time				= 0;							// Tempo que iniciou o modo Trechos

			var 	n_part					= 0;							// Número de Trechos
			var 	part_distance			= 0;							// Distancias dos Trechos
			var 	part_speed				= 0;							// Velocidades dos Trechos

			var 	actual_part				= 0;							// Trecho Atual
			var 	indice_part 			= 0;							// Indice do trecho atual
			var 	total_part_distance	 	= 0;							// Total em Metros do Trecho Atual
			var 	total_part_speed 		= 0;							// Tempo total que o Trecho atual deve ter
			var 	total_part_time			= 0;							// Tempo, em milisegundos, que o trecho atual deve ser feito

			var 	part_start_time			= 0;							// Quando começou o trecho atual
			var 	when_finish_part		= 0;							// Quando deve terminar o trecho atual
			var 	time_valid_pos			= date.getTime();

			var 	part_runed				= 0;							// Distância já percorrida no trecho atual
			var 	part_erro 				= 0;							// Erro de distancia do trecho atual em realção ao que ele deveria ter andado
			
			var 	esq 					= 0;
			var 	dir 					= 0;


		// Setar Pinos Enable

			_self.pins = function(a,b,c,d){
				in1.digitalWrite(a);
				in2.digitalWrite(b);
				in3.digitalWrite(c);
				in4.digitalWrite(d);

				if(mini_car){
					in1_2.digitalWrite(a);
					in2_2.digitalWrite(b);
					in3_2.digitalWrite(c);
					in4_2.digitalWrite(d);
				}
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
						
						duty_esq 	= (speed * max_duty);
						duty_dir 	= ((speed - (speed * x)) * max_duty);

					}else if(x<0){
						
						duty_esq 	= ((speed - (speed * (-x) )) * max_duty);
						dut_dir 	= (speed * max_duty);

					}

					_self.set_speed(duty_esq,duty_dir);

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

				if(!isNaN(esq) || !isNaN(esq)){

					if(esq > min_duty){
						set_esq	= (esq > max_duty) ? max_duty : esq.toFixed(0);
					}else{
						set_esq = 0;
					}

					if(dir > min_duty){
						set_dir = (dir > max_duty) ? max_duty : dir.toFixed(0);
					}else{
						set_dir = 0;
					}
					
				}
				
				console.log(set_dir + " " +set_esq);						// ------->> Debug

				pwm1.pwmWrite(set_dir);
				pwm2.pwmWrite(set_esq);

				if(mini_car){
					pwm1_2.pwmWrite(set_dir);
					pwm2_2.pwmWrite(set_esq);
				}

			}


		// Tratar interrupção do Senor

			_self.sensor_interrupt = function(){

				_self.speed_calc();			// Mandar calcular velocidade
				_self.distance_calc();		// Mandar calcular distância
				_self.count_run();			// Mandar contar caso esteja em modo Trehcos
				_self.send_run_info(); 		// Enviar informações para o carrinho

			}


		// Calcular Velocidade

			_self.speed_calc = function(){

				var date 		= new Date();
				// console.log("time: "+time)					// ------->> Debug	
				var result 		= date.getTime() - time;
				time 			= date.getTime(); 

				// console.log("Resultado: "+result)					// ------->> Debug	


		        seg 			= result/(1000*60);
		       	car_speed 		= dis_m/seg;

		     	// console.log(car_speed.toFixed(2)+' m/min');					// ------->> Debug			

			}


		// Calcular Distancia Percorrida

			_self.distance_calc = function(){

				car_distance 	= car_distance + dis_m;
				part_runed 		= (part_active) ? car_distance : 0;
				
			}

 
		// Enivar velocidade e distancia para controle

			_self.send_run_info = function(){
				a 		= car_speed.toFixed(2);
				b 		= car_distance.toFixed(2);
				c		= actual_part;
				d		= total_part_distance.toFixed(1);
				e		= part_erro.toFixed(2);

				// console.log("speed: "+a+"	distance: "+b+"	actual_part: "+c+"	total_part_distance: "+d+"	part_erro: "+e); // ------->> Debug	
				io.emit('run_info', a, b, c, d, e);
			}


		// Tratar Trechos

			_self.set_trechos = function(dist,speed){

				// console.log("Recebido"); 									// ------->> Debug

				if(dist.length < 30){// Condição apenas para tratar um erro que acontece no raspberry que está enviando dados de 38 dados de 1

					// for (i = 0; i < dist.length; i++) {
	    				
					// }

					n_part 			= dist.length;
					part_distance 	= dist;
					part_speed 		= speed;			

					io.emit('active-start-button');

				}


			}


		// Inicar Rally
			_self.start_rally = function(data){

				var data 			= new Date();
				start_time			= data.getTime();

				part_active			= true;
				actual_part 		= 1;
				
				_self.def_actual_part_variables();

				io.emit('rally-started');

				// console.log("Parte Atual:" + actual_part + " Total dessa Parte: " +total_part_distance);	// ------->> Debug

				_self.send_run_info();
			}
			

		// Contar quantidade andada na corrida
			_self.count_run = function(){

				if(part_active){
					_self.validate_position();

					if(car_distance >= total_part_distance){

					// Terminou um trecho e passar para próximo
						if(actual_part < n_part){

							actual_part++;
							_self.def_actual_part_variables();


					// Acabou último trecho 
						}else{

							car_distance 	= 0;
							part_active  	= false;
							actual_part 	= "No";
							error 			= "No";
							// total_part_distance = 0;

							console.log('Acabou');							// ------->> Debug
							io.emit('rally-ended')
																							
						}
						
					}

				}

			}

		
		// Tratar Erro do Carro no Rally
			_self.validate_position = function(){

				var data 				= new Date();
				time_valid_pos 			= data.getTime() - part_start_time;

				whould_ride 			= time_valid_pos*(total_part_speed/(60*1000));
				// console.log("whould_ride: 	"+whould_ride);												// ------->> Debug

				// whould_ride 			= (time/total_part_time)*car_distance;
				// speed_part 				= car_distance - whould_ride;
				// dif_car_distance 		= car_distance - whould_ride;

				// console.log("total_part_time 	"+total_part_time);												// ------->> Debug

				// part_erro 				= dif_car_distance.toFixed(2);
				part_erro					= car_distance - whould_ride;

				console.log("part_erro 	"+part_erro);												// ------->> Debug

			} 


		// Definir Informações do Trecho Atual
			_self.def_actual_part_variables = function(){

				var data 				= new Date();
			
				car_distance 			= 0;
				part_runed 				= car_distance;

				part_start_time			= data.getTime();
				indice_part 			= actual_part - 1;
				total_part_distance  	= part_distance[indice_part];
				total_part_speed		= part_speed[indice_part];



				total_part_time			= (total_part_distance/part_speed)*(1*60000);
				when_finish_part		= part_start_time+total_part_time;

				console.log("total_part_distance: "+total_part_distance+"	total_part_speed: "+part_speed);												// ------->> Debug

			}


		// Se for o carro pequeno

			_self.mini = function(){
				size_wheel		= mini_size_wheel; 		// Tamanho do Pneu (em cm) (45 tamanho do carrinho PI e 22 Carrinho Mini
				wheel_div		= mini_wheel_div;

			}


		// Verificar se está no carro pequeno

			if(mini_car){
				_self.mini();
			}



	}

// Verificar no Signal
	
	setInterval(function(){
		car.no_signal();
	}, no_signal_time/2);


// Contando borda de subida e enviadno para o controle
	
	encoder.on('interrupt', function (level) {
		  if(level === 1){
		    car.sensor_interrupt();
		  }
	});


// Conexão com o Controle
	
	// "Ligar" servidor
		app.use(express.static(__dirname));  
		server.listen(80);

	// Funções recebidas do carrinho
		io.on('connection', function(socket){

			// Chegou nova posição do Joystick
				socket.on('joy', function(x,y,distance){car.dir_speed(x,y,distance)});

			// Chegou Função soltou Joystick
				socket.on('stop-car', function(){car.stop()});

			// Chegou Dados dos Trechos
				socket.on('parts', function(dist,speed){car.set_trechos(dist,speed)});

			// Chegou botão iniciar rally precionado
				socket.on('start', function(data){car.start_rally(data)});

		});
