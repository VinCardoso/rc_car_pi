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





// Adicionar mais trechos para serem digitados

// Configurações de Trecho
n_trechos_iniciais = 3;

n_trechos = 0;
for (i = 0; i < n_trechos_iniciais; i++) {
    n_trechos++;
    html_trecho = "<div class='form-row row-data'><div class='col'><label for='d1'>Trecho "+n_trechos+"</label><input pattern='[0-9]*' type='number' class='form-control form-control-sm' name='d"+n_trechos+"'class='form-control' placeholder='Distância "+n_trechos+" (m)'></div><div class='col'><label for='v"+n_trechos+"'>&nbsp;</label><input pattern='[0-9]*' type='number' class='form-control form-control-sm' name='v"+n_trechos+"'class='form-control' placeholder='Velocidade "+n_trechos+" (m/s)'></div></div>";
    $(".insert-after").before(html_trecho);
}

// Botão Adicionar Trecho
$("button.add").click(function(){
    n_trechos++;
    html_trecho = "<div class='form-row'><div class='col'><label for='d1'>Trecho "+n_trechos+"</label><input pattern='[0-9]*' type='number' class='form-control form-control-sm' name='d"+n_trechos+"'class='form-control' placeholder='Distância "+n_trechos+" (m)'></div><div class='col'><label for='v"+n_trechos+"'>&nbsp;</label><input pattern='[0-9]*' type='number' class='form-control form-control-sm' name='v"+n_trechos+"'class='form-control' placeholder='Velocidade "+n_trechos+" (m/s)'></div></div>";
    $(".insert-after").before(html_trecho);
    return false;
});

// Botão Mostrar Form Trechos
$("button.show-form").click(function(){
    $(".insert-data").toggle();
    });

// 
$("button.send-data").click(function(){

    num_data = $('.row-data').length;

    var trechos = {
        'info'

    }
    var 
    send('data',num_data);
    $(".insert-data").toggle();
    return false;
});


