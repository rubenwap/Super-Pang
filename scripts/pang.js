$(document).ready(function () {
    $("#difficulty").hide();

    $(":button").css("background-color", "#4CAF50");
    $(":button").css("border", "none");
    $(":button").css("color", "white");
    $(":button").css("padding", "15px 32px");
    $(":button").css("text-align", "center");
    $(":button").css("text-decoration", "none");
    $(":button").css("display", "inline-block");
    $(":button").css("font-size", "16px");


    //Se definen variables y los sonidos con loop cuando sea necesario 

    var colarray = new Array();
    var ball = new Array();
    var state = 0;
    var score = 0;
    var stage = 1;
    var dead = false;
    var hard;
    titlesound = new Audio('audio/intro.mp3');
    titlesound.volume = 0.5;
    titlesound.addEventListener('ended', function () {
        this.currentTime = 0;
        this.play();
    }, false);

    gameplay = new Audio('audio/gameplay.mp3');
    gameplay.volume = 0.5;
    gameplay.addEventListener('ended', function () {
        this.currentTime = 0;
        this.play();
    }, false);

    pass = new Audio('audio/passed.mp3');
    pass.volume = 0.5;
    pass.addEventListener('ended', function () {
        this.currentTime = 0;
        this.play();
    }, false);

    scream = new Audio('audio/scream.mp3');
    endsound = new Audio('audio/end.mp3');
    pistol = new Audio('audio/shoot.mp3');


    // El switch con los diferentes estados se ejecuta en un intervalo

    var t = setInterval(function () {
        switch (state) {

        case 0:
            //title screen
            title();
            break;
        case 1:
            //ready screen 
            ready();
            break;
        case 2:
            //game
            game();
            break;

        }

    }, 500);

    //función de título

    function title() {


        titlesound.play();
        document.body.style.backgroundImage = "url('img/introtitle.png')";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundPosition = "center";
        $("#messages").html("PRESS SPACE TO START");
        $("#messages").css("color", "red");
        $("#messages").css("font-family", "sans-serif");
        $("#messages").css("font-size", "1.5em");
        $("#messages").css("width", "30%");
        $("#messages").css("margin", "auto");
        $("#messages").css("text-align", "center");
        $('body').keyup(function (e) {

            if (e.keyCode == 32) {
                $("#messages").html();
                state = 1;
            }
        });


    }

    //Función ready/pantalla instrucciones. Esta función realmente no
    //hace falta en esta versión, pero la he añadido para usarla en una futura
    //versión mejorada del juego, donde se pueden dar instrucciones más completas
    //con otras imágenes. 
    //Actualmente, solo cambia una linea de texto

    function ready() {
        $("#difficulty").show();
        $("#difficulty").css("width", "50%");
        $("#difficulty").css("margin-left", "35%");
        $("#difficulty").css("margin-top", "1em");
        $("#difficulty").css("float", "center");
        $("#messages").css("width", "40%");
        $("#messages").css("color", "green");
        $("#messages").html("Left/Right to control, 'Enter' to shoot <br> Pick your difficulty level");

        $('#easy').click(function () {

            hard = 0;
            pistol.play();
            setTimeout(function () {
                state = 2
            }, 1000);
        });

        $('#hard').click(function () {

            hard = 0.3;
            pistol.play();
            setTimeout(function () {
                state = 2
            }, 1000);
        });

        $('#lud').click(function () {

            hard = 0.6;
            pistol.play();
            setTimeout(function () {
                state = 2
            }, 1000);
        });
    }


    //función principal del juego 

    function game() {

        //se preparan los div que se mostrarán y los sonidos
        $("#difficulty").hide();
        pass.pause();
        $("#stage").show();
        $("#score").show();
        titlesound.pause();
        gameplay.currentTime = 0;
        gameplay.play();

        //apagamos el intervalo del switch. Ya no hace falta

        clearInterval(t);

        //imagen de fondo
        document.body.style.backgroundImage = "";
        document.body.style.backgroundImage = "url('img/" + stage + ".png')";
        //audio que se ejecutará al romperse una bola
        var pop = new Audio('audio/pop.mp3');
        //variable para cambiar de nivel más tarde
        var haslevelchanged = false;


        //cambios en css. No he añadido archivo de css separado por ser solo esto 

        $("#messages").html("");
        $("#score").html("Score: " + score);
        $("#stage").html("Stage: " + stage);
        $("#score").css("color", "white");
        $("#score").css("background-color", "black");
        $("#score").css("font-size", "2em");
        $("#score").css("font-family", "sans-serif");
        $("#score").css("border-radius", "15px");
        $("#score").css("width", "25%");
        $("#score").css("padding", "0.5em");
        $("#score").css("float", "right");
        $("#score").css("border-style", "solid");
        $("#score").css("border-color", "red");
        $("#stage").css("color", "white");
        $("#stage").css("background-color", "black");
        $("#stage").css("font-size", "2em");
        $("#stage").css("font-family", "sans-serif");
        $("#stage").css("border-radius", "15px");
        $("#stage").css("width", "25%");
        $("#stage").css("padding", "0.5em");
        $("#stage").css("float", "left");
        $("#stage").css("border-style", "solid");
        $("#stage").css("border-color", "red");

        Physics(function (world) {

            var viewportBounds = Physics.aabb(0, 0, window.innerWidth, window.innerHeight),
                edgeBounce, renderer;
            //se crea el render
            renderer = Physics.renderer('canvas', {
                el: 'viewport'
            });


            world.add(renderer);
            world.on('step', function () {
                world.render();
            });

            // se configuran los bordes para los rebotes

            edgeBounce = Physics.behavior('edge-collision-detection', {
                aabb: viewportBounds,
                restitution: 0.99,
                cof: 0.8
            });

            //cambios de tamaño de la ventana
            window.addEventListener('resize', function () {

                viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);

                edgeBounce.setAABB(viewportBounds);

            }, true);

            //se añade el personaje principal

            var explorer = Physics.body('rectangle', {
                x: 250,
                y: renderer.height - 50,
                width: 50,
                height: 50,
                vx: 0,
                vy: 0,
                label: 'explorer'
            });
            explorer.view = new Image();
            explorer.view.src = 'img/up.png';


            //lo controlamos mediante el teclado

            $('body').keydown(function (e) {

                switch (e.keyCode) {

                case 37:
                    //izquierda
                    explorer.state.vel.set(-0.7, 0);
                    explorer.state.pos.x = explorer.state.pos.x - 7;

                    explorer.view.src = 'img/left.png';
                    break;
                case 39:
                    //derecha
                    explorer.state.vel.set(0.7, 0);
                    explorer.state.pos.x = explorer.state.pos.x + 7;

                    explorer.view.src = 'img/right.png';
                    break;

                case 13:
                    //disparo       
                    explorer.state.vel.set(0, 0);
                    explorer.view.src = 'img/up.png';
                    shoot();
                    break;

                case 38:
                    explorer.state.vel.set(0, 0);
                    //arriba    
                    explorer.view.src = 'img/up.png';

                }

            });

            world.add(explorer);

            //el número de bolas del nivel dependerá de en qué pantalla estamos

            var balls = 0;
            while (balls < stage) {
                //bola principal
                var b = Physics.body('circle', {
                    x: Math.random() * window.innerWwidth,
                    y: renderer.height * 0.3,
                    vx: 0.3,
                    vy: hard,
                    radius: 100,
                    mass: 7,
                    label: 'ball'

                    ,
                    styles: {
                        fillStyle: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6)

                    }

                });

                world.add(b);
                ball.push(b);
                balls++;
            }



            //colisiones entre las bolas y el explorador

            var query = Physics.query({
                $or: [
                    {
                        bodyA: {
                            label: 'ball'
                        },
                        bodyB: {
                            label: 'explorer'
                        }
                    }
        , {
                        bodyB: {
                            label: 'ball'
                        },
                        bodyA: {
                            label: 'explorer'
                        }
                    }
    ]
            });

            world.on('collisions:detected', function (data, e) {
                var found = Physics.util.find(data.collisions, query);
                if (found) {

                    //variable muerto, y se activan sonidos y mensajes
                    dead = true;
                    gameplay.pause();
                    scream.play();
                    endsound.play();
                    $("#messages").css("color", "red");
                    $("#messages").css("font-size", "5em");
                    $("#messages").css("width", "50%");
                    $("#messages").css("margin", "auto");
                    $("#messages").css("font-weight", "bold");
                    $("#stage").hide();
                    $("#score").hide();
                    $("#messages").html("GAME OVER");
                    world.remove(explorer);


                    //actualizamos la ventana. 
                    //Más rápido que borrar el canvas y empezar de nuevo!!

                    setTimeout(function () {

                        window.location.reload();
                    }, 3000);

                }
            });


            function shoot() {
                //se crean las balas
                var projectile = Physics.body('circle', {
                    x: explorer.state.pos.x,
                    y: explorer.state.pos.y - (explorer.height - 5),
                    vy: -0.3,
                    mass: 2,
                    radius: 3,
                    restitution: 0.99,
                    angularVelocity: 1,
                    label: "bullet",
                    styles: {
                        fillStyle: '0xd33682',
                        lineWidth: 1,
                        angleIndicator: '0x751b4b'
                    }
                });
                explorer.state.vel.set(0, 0);

                //solo puede disparar si está vivo
                if (dead == false) {
                    world.add(projectile);
                    pistol.play();
                }

                //vamos eliminando las balas para no sobrecargar. 

                var clearbullet = setInterval(function () {
                    if (projectile.state.pos.y < window.innerHeight - window.innerHeight + 20) {
                        world.remove(projectile);
                    }

                }, 100)

                //colisiones entre balas y pelotas
                var query = Physics.query({
                    $or: [
                        {
                            bodyA: {
                                label: 'ball'
                            },
                            bodyB: {
                                label: 'bullet'
                            }
                    }
        , {
                            bodyB: {
                                label: 'ball'
                            },
                            bodyA: {
                                label: 'bullet'
                            }
                    }
    ]
                });




                world.on('collisions:detected', function (data, e) {


                    var found = Physics.util.find(data.collisions, query);



                    if (found) {

                        score = score + 1;
                        $("#score").html("Score: " + score);
                        //eliminamos la bala
                        world.remove(found.bodyA);
                        pop.play();

                        //reducimos la bola principal
                        found.bodyB.geometry.radius = (found.bodyB.geometry.radius / 2);
                        //según el tamaño en el que queda, directamente la quitamos
                        if (found.bodyB.geometry.radius < 10) {
                            world.remove(found.bodyB);

                            //si no quedan pelotas, subimos de nivel!!
                            if (world.find({
                                    label: 'ball'
                                }) == false) {
                                if (haslevelchanged == false) {
                                    level();
                                }
                            }
                        }

                        //sin estas dos lineas, el tamaño no se actualiza
                        found.bodyB.view = null;
                        found.bodyB.recalc();


                        //creamos una nueva pelota "split" de la anterior
                        b = Physics.body('circle', {
                            x: found.bodyB.state.pos.x,
                            y: found.bodyB.state.pos.y,
                            vx: 0.3,
                            vy: hard,
                            radius: found.bodyB.geometry.radius,
                            label: 'ball'

                            ,
                            styles: {
                                fillStyle: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6)

                            }

                        });


                        //pero solo la añadimos si el tamaño resultante es > 10
                        if (b.geometry.radius > 10) {

                            ball.push(b);
                            world.add(b);

                        }

                    }
                });

            }


            world.add([
//comportamientos. Algunos aplicados solo a ciertos objetos
        Physics.behavior('constant-acceleration').applyTo(ball)
        , Physics.behavior('body-impulse-response').applyTo(ball)
        , Physics.behavior('body-collision-detection')
        , Physics.behavior('sweep-prune')
        , edgeBounce

    ]);


            Physics.util.ticker.on(function (time) {

                world.step(time);
            });
        });


        //variables del cambio de nivel

        function level() {

            haslevelchanged = true;
            stage = stage + 1;

            if (stage > 3) {
                //solo tenemos 3 niveles. Si se acaba, se ejecuta el final del juego
                endgame();
            } else {

                console.log("level up!");
                console.log(stage);
                $("#stage").html("Stage: " + stage);

                //si es nivel < 3, iniciamos otra partida con variables de nuevo nivel
                setTimeout(game, 2000);

            }

        }
    }



    scratch = Physics.scratchpad();
    scratch.done();

    //función de fin de juego (al acabar el nivel 3)

    function endgame() {
        gameplay.pause();
        pass.play();
        $("#stage").hide();
        $("#score").hide();
        document.body.style.backgroundImage = "url('img/end.png')";

        console.log("you made it!");
        $("#messages").css("width", "80%");
        $("#messages").html("Based on the videogame Super Pang <br> Author: Ruben Sanchez <br> Music: Sawsquarenoise (CC-BY)<br>Sound effects: Simon Rue (CC-BY)<br><br><em>Press Space to start again</em>");

        $('body').keyup(function (e) {

            if (e.keyCode == 32) {
                state = 2;
                stage = 1;
                score = 0;
                game();

            }
        });

    }

});