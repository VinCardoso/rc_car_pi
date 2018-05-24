// Criar Joystick
var joystic = nipplejs.create({
    zone: document.getElementById('zone'),
    mode: 'static',
    size: 300,
    threshold: 1,
    position: {left: '50%', top: '50%'},
    color: 'red'
});


// Ver qual o ponto central do Joystick na página
var position_c  = $('.nipple .front').offset();             // Posição do centro do elemento
var position_b  = {};
var size        = ($('.nipple .front').height());           // Distancia do centro para as bordas
var mult        = 1/size;       

jQuery.each(position_c,function(key,value){
    position_b[key]=value-(size/2);                         // Posição da borda do elemento
});


// Enviar informação quando joystic movimentar
joystic.on('move',function (evt, data) {

    x_default = (data.position.x - position_b.left - size)*mult;
    y_default = (data.position.y - position_b.top - size)*mult;

    x = x_default.toFixed(3);
    y = y_default.toFixed(3);

    distance = (data.distance*mult).toFixed(3);

	send('joy',x,y,distance);
    console.log("X = "+x+" Y = "+y+" Distance = "+distance);

}).on('end',function(evt,data){
	send('unpress',1);
});


// console.log("l."+position_b.left+" t."+position_b.top+" size."+size+" mult."+mult);


var socket = io.connect();

function send(type,a,b,c){
	socket.emit(type,a,b,c);
}

socket.on('valor', function(data) {
        $('span.result').html(data);
    });

$("button.add").click(function(){
    $(".insert-after").after("<div class='row space-down row-data'><div class='col'><input type='number' class='form-control form-control-sm' name='d2'class='form-control' placeholder='Distância (m)'></div><div class='col'><input type='number' class='form-control form-control-sm' name='v2' class='form-control' placeholder='Velocidade (m/s)'></div></div>");
    return false;
});

$("button.show-form").click(function(){
    $(".insert-data").toggle();
    });

$("button.send-data").click(function(){
    var num_data = $('.row-data').length;
    send('data',num_data);
    $(".insert-data").toggle();
    return false;
});


