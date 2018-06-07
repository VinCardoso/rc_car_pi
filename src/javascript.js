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

// Enviar informação quando joystic movimentar
    var socket = io.connect();

    function send(type,a,b,c){
        socket.emit(type,a,b,c);
    }
 
// Mostrar velocidade
    socket.on('run_info', function(speed,distance,actual_part,total_part) {
            $('span.result-speed').html(speed);
            $('span.result-distance').html(distance);
            $('#trecho').html(actual_part);
            $('#total-part').html(total_part);
        });
 
// Manipular Form e Trechos
 
    var trechos = new function(){
      var _self = this;

      _self.n_trechos_iniciais = 1;
      _self.n_trechos = 0;
     
      // Adicionar campos de trechos iniciais
          _self.init = function(){
            for (i = 0; i < _self.n_trechos_iniciais; i++) {
                _self.addTrecho();
            }
          }
     
          _self.addTrecho = function(){
            
            _self.n_trechos++;
            var n = _self.n_trechos;

            html_trecho = "\
             <div class='form-row row-data'>\
               <div class='col'>\
                 <label for='d1'>Trecho "+n+"</label>\
                 <input pattern='[0-9]*' \
                        type='number'  \
                        class='form-control form-control-sm input-distancia' \
                        name='d"+n+"'\
                        placeholder='Distância "+n+" (m)'>\
               </div>\
               <div class='col'>\
                 <label for='v"+n+"'>&nbsp;</label>\
                 <input \
                   pattern='[0-9]*' \
                   type='number' \
                   class='form-control form-control-sm input-velocidade' \
                   name='v"+n+"' \
                   placeholder='Velocidade "+n+"\ (m/min)'> \
               </div> \
             </div>";

            $(".insert-input").before(html_trecho);
          }

     
      _self.getTrechos = function(){
        var dist    = [];
        var speed   = [];
        var ind     = 0;
        
        $(".form-row").each(function(){
          dist[ind]   = Number($(this).find(".input-distancia").val());
          speed[ind]  = Number($(this).find(".input-velocidade").val());
          ind++;
        });

        send('data',dist,speed);
        return trechos;
      }

      _self.init();
     
    };
 
// Botão Adicionar Trecho
    $("button.add").click(function(evt){
        evt.preventDefault();
        trechos.addTrecho();
        return false;
    });
 
// Botão Mostrar Form Trecho
    $("button.show-form").click(function(){
        $(".insert-data").toggle();
        $(".control").toggle();
    });
 
// Botão enviar dados
    $("button.send-data").click(function(){
        var data = trechos.getTrechos();
        console.log(data);
        send('data',JSON.stringify(data));
        $(".insert-data").toggle();
        $(".control").toggle();
        return false;
    });

// Botão enviar dados
    $("button.start-rally").click(function(){
        send('start','1');
        $("#row-start-button").hide();
        return false;
    });

// Server mandou mostrar botão de inicar corrida
    socket.on('active-start-button', function() {
            $("#row-start-button").show();
        });

// Servidor avisou que a corrida comecou
    socket.on('rally-started',function(){
      $('.off-part').hide();
      $('.on-part').show();

    });
    socket.on('rally-ended',function(){
      $('.on-part').hide();
      $('.off-part').show();
    });
