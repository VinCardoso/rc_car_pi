// Importar Bibliotecas
var 	express = require('express');  
var 	app = express();  
var 	server = require('http').createServer(app);  
var 	io = require('socket.io')(server);
var		pigpio = require('pigpio'),
  		Gpio = pigpio.Gpio;

		
		pigpio.configureClock(5, pigpio.CLOCK_PWM);		// Definir Clock do PWM dos motores

		// Configurar Pinos
		in1 	= new Gpio(5, 	{mode: Gpio.OUTPUT}),	// Enable 1
		in2 	= new Gpio(6, 	{mode: Gpio.OUTPUT}),	// Enable 2
		in3 	= new Gpio(27, 	{mode: Gpio.OUTPUT}),	// Enable 3
		in4 	= new Gpio(22, 	{mode: Gpio.OUTPUT}),	// Enable 4

		encoder = new Gpio(26, 	{mode: Gpio.INPUT, edge: Gpio.EITHER_EDGE}),	// Sinal de Leitura de Velocidade do Encoder

		// Set PWM
		pwm1	= new Gpio(13,	{mode: Gpio.OUTPUT}),	// Saída do PWM Motor 1
		pwm2	= new Gpio(17,	{mode: Gpio.OUTPUT});	// Saída do PWM Motor 2




		// Funções de Alterar Enable's de acordo com posicionamento
		function stop(){
			in1.digitalWrite(1);
			in2.digitalWrite(1);
			in3.digitalWrite(1);
			in4.digitalWrite(1);
			console.log('Stop');
		}

		stop(); // Para carrinho antes de qualquer coisa!

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
			    total++;
				io.emit('valor',total);
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
			front();
		}else if(y>0){
			back();
		} 


	});

	// Receber Soltou Joystick
	socket.on('unpress', function(a,b){
		stop();
	});

	// Receber Trechos
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



