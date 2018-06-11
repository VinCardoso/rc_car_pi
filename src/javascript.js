// Convigurações
        
        var     initial_parts   =   1;              // Quantidade Inicial de Trechos              

// Variáveis Globais
        
        var     socket          =   io.connect();
        var     position_c      =   null;             // Posição do centro do elemento
        var     position_b      =   {};
        var     size            =   null;           // Distancia do centro para as bordas
        var     mult            =   null;
        var     joystic         =   null;
        var     joy_x           =   null;
        var     joy_y           =   null;
        var     joy_distance    =   null;
        var     x               =   null;
        var     y               =   null;
        var     distance        =   null;
        var     error           =   0;
        var     error_calc      =   0;




// Objeto Carro

    var car = new function(){

        _self = this;

        // Criar Joystick

            _self.create_joy = function(){

                joystic = nipplejs.create({
                zone: document.getElementById('zone'),
                mode: 'static',
                size: 300,
                threshold: 1,
                position: {left: '50%', top: '50%'},
                color: 'red'
                });

            }

        // Checar posição do Joystic

            _self.check_joy_position = function(){

                position_c  = $('.nipple .front').offset();            // Posição do centro do elemento
                position_b  = {};
                size        = $('.nipple .front').height();           // Distancia do centro para as bordas
                mult        = 1/size;      
                 
                jQuery.each(position_c,function(key,value){
                    position_b[key]=value-(size/2);                   // Posição da borda do elemento
                });

            }

        // Calcular Movimentação do Joystick

            _self.calc_joy_move = function(){

                x_default = (joy_x - position_b.left - size)*mult;
                y_default = (joy_y - position_b.top - size)*mult;
             
                x = x_default.toFixed(3);
                y = y_default.toFixed(3);
             
                distance = joy_distance * mult;

                _self.send_joy();
             
            }

        // Enviar informações do Joystic

            _self.send_joy = function(){
                socket.emit('joy',x,y,distance.toFixed(3));
                console.log("X = "+x+" Y = "+y+" Distance = "+distance.toFixed(3));                                    // ------->> Debug 
            }

        // Enviar informação que soltou Joystic

            _self.send_stop = function(){
                socket.emit('stop-car');
            }

        // Colocar Trechos Inicais

            _self.init = function(){
                for (i = 0; i < initial_parts; i++) {
                    _self.add_part_form();
                }
            }

        // Adicionar novo campo para trecho na interface

            _self.n_trechos = 0;

            _self.add_part_form = function(){
            
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

        // Enviar Trechos

            _self.send_parts = function(){

                var     dist            =   [];
                var     speed           =   [];
                var     ind             =   0;

                $(".form-row").each(function(){
                    dist[ind]   = Number($(this).find(".input-distancia").val());
                    speed[ind]  = Number($(this).find(".input-velocidade").val());
                    ind++;
                });

                socket.emit('parts',dist,speed);

                console.log(dist);
                console.log(speed);
            
            }

        // Ações Iniciais

            _self.create_joy();
            _self.check_joy_position();
            _self.init();

        // Validar Cor Erro
            _self.color_erro = function(){
                
                    error_div = $("#error-div");

                    if(error_calc < 0.25 && error_calc > -0.25){
                        error_div.css('background-color','#d4edda');
                    }else if(error_calc > 0.25){
                        error_div.css('background-color','#fff3cd');
                    }else if(error_calc < -0.25){
                        error_div.css('background-color','#f8d7da');
                    }

            }

    }

 
// Ação Quando Joystick se Movimentar

    joystic.on('move',function (evt, data) {
        
        joy_x           = data.position.x;
        joy_y           = data.position.y;
        joy_distance    = data.distance;

        car.calc_joy_move();


// Ação Quando Joystick for Solto

    }).on('end',function(evt,data){
        car.send_stop();
    });    

 
// Botão Adicionar Trecho

    $("button.add").click(function(evt){
        evt.preventDefault();
        car.add_part_form();
        return false;
    });
 

// Botão Mostrar ou Esconder Form

    $("button.show-form").click(function(){
        $(".insert-data").toggle();
        $(".control").toggle();
        // car.check_joy_position();
    });
 

// Botão Enviar Trechos

    $("button.send-data").click(function(){
        car.send_parts();
        $(".insert-data").toggle();
        $(".control").toggle();
        // car.check_joy_position();
        return false;
    });


// Botão Começar Rally

    $("button.start-rally").click(function(){
        socket.emit('start','1');
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
      // car.check_joy_position();

    });


// Servidor disse que rally acaboy

    socket.on('rally-ended',function(){
      $('.on-part').hide();
      $('.off-part').show();
      // setTimeout(car.check_joy_position(), 200);
    });


// Mostrar velocidade
    
    socket.on('run_info', function(speed,distance,actual_part,total_part,error){
        $('span.result-speed').html(speed);
        $('span.result-distance').html(distance);
        $('#trecho').html(actual_part);
        $('#total-part').html(total_part);
        $("#distance-erro").html(error);
        error_calc = error;
        car.color_erro();
    });
