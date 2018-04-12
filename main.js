var		Gpio = require('onoff').Gpio,

		in1 = new Gpio(4, 'out'),
		in2 = new Gpio(17, 'out'),
		in3 = new Gpio(27, 'out'),
		in4 = new Gpio(22, 'out');


		function forward() {
			in1.writeSync(1);
			in2.writeSync(0);
			in3.writeSync(1);
			in4.writeSync(0);
		}

		function backward() {
			in1.writeSync(0);
			in2.writeSync(1);
			in3.writeSync(0);
			in4.writeSync(1);
		}

		function right() {
			in1.writeSync(0);
			in2.writeSync(1);
			in3.writeSync(1);
			in4.writeSync(0);
		}

		function left() {
			in1.writeSync(1);
			in2.writeSync(0);
			in3.writeSync(0);
			in4.writeSync(1);
		}

		function stop(){
			in1.writeSync(1);
			in2.writeSync(1);
			in3.writeSync(1);
			in4.writeSync(1);
		}


		var frente = setTimeout(	forward, 	10);
		var parar = setTimeout(		stop,		2000);
		var tras = setTimeout(		backward, 	3000);
		var parar2 = setTimeout(	stop,		4000);
		var tras = setTimeout(		right, 		7000);
		var parar = setTimeout(		stop,		8000);
		var tras = setTimeout(		left, 		10000);
		var parar = setTimeout(		stop,		11000);







