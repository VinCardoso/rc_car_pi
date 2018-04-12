var		Gpio = require('onoff').Gpio;
var 	keypress = require('keypress');

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

		stop();

		/*
		var frente = setTimeout(	forward, 	10);
		var parar = setTimeout(		stop,		2000);
		var tras = setTimeout(		backward, 	3000);
		var parar2 = setTimeout(	stop,		4000);
		var tras = setTimeout(		right, 		7000);
		var parar = setTimeout(		stop,		8000);
		var tras = setTimeout(		left, 		10000);
		var parar = setTimeout(		stop,		11000);
		*/



// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
var stopmotor;
process.stdin.on('keypress', function (ch, key) {
    //console.log('got "keypress"', key);

    if (key && key.name == 'up') {
        console.log("A");
        if (stopmotor)
            clearTimeout(stopmotor);
        forward();
    } else if (key && key.name == 'down') {
        console.log("V");
        if (stopmotor)
            clearTimeout(stopmotor);
        backward();
    } else if (key && key.name == 'left') {
        console.log("<");
        if (stopmotor)
            clearTimeout(stopmotor);
        left();
    } else if (key && key.name == 'right') {
        console.log(">");
        if (stopmotor)
            clearTimeout(stopmotor);
        right();
    } else if (key && key.ctrl && key.name == 'c') {
        process.stdin.stop();
    }

    stopmotor = setTimeout(function () {
        stop();
    }, 100);
});

process.stdin.setRawMode(true);
process.stdin.resume();

process.on('SIGINT', function () {
    console.log("Reversed all pin to 0");
    pin_reset();
    process.exit();
});





