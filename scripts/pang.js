$(document).ready(function () {

    // This function defines music tracks playing in loop

    function soundLoop(path) {
        action = new Audio(path);
        action.volume = 0.5;
        action.addEventListener('ended', function () {
            this.currentTime = 0;
            this.play();
        }, false);
        return action;
    };

    // Variables

    let ball = new Array();
    let state = 0;
    let score = 0;
    let stage = 1;
    let dead = false;
    let hard = 0;
    const titlesound = soundLoop('audio/intro.mp3')
    const gameplay = soundLoop('audio/gameplay.mp3')
    const pass = soundLoop('audio/passed.mp3')
    const scream = new Audio('audio/scream.mp3');
    const endsound = new Audio('audio/end.mp3');
    const pistol = new Audio('audio/shoot.mp3');
    const pop = new Audio('audio/pop.mp3');


    // This controls the states before gameplay

    const t = setInterval(function () {
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

    // Title screen function

    function title() {

        document.body.classList.add("titleScreen")
        $("#messages").html("PRESS SPACE TO START");

        // Space key event
        $('body').keyup(function (e) {
            if (e.keyCode == 32) {
                titlesound.play();
                $("#messages").html("");
                state = 1;
            }
        });
    }

    // Functions to pick difficulty level
    // In the ready function, other options could be added

    function difficultySelector(level) {
        hard = level;
        pistol.play();
        setTimeout(function () {
            state = 2
        }, 1000);
    }

    function ready() {

        $("#difficulty").show();
        $("#messages").html("Left/Right to control, 'Enter' to shoot <br> Pick your difficulty level");

        $('#easy').click(function () {
            difficultySelector(0);
        });

        $('#hard').click(function () {
            difficultySelector(0.3);
        });

        $('#lud').click(function () {
            difficultySelector(0.6);
        });
    }


    // Main gameplay function

    function game() {

        $("#difficulty").hide();
        $("#stage").show();
        $("#score").show();
        pass.pause();
        titlesound.pause();
        gameplay.currentTime = 0;
        gameplay.play();
        let haslevelchanged = false;


        // Interval to change state not needed anymore, since gameplay is the last stage

        clearInterval(t);

        // Background image changes according to the stage

        document.body.style.backgroundImage = "";
        document.body.style.backgroundImage = "url('img/" + stage + ".png')";

        $("#messages").html("");
        $("#score").html("Score: " + score);
        $("#stage").html("Stage: " + stage);

        Physics(function (world) {

            var viewportBounds = Physics.aabb(0, 0, window.innerWidth, window.innerHeight),
                edgeBounce, renderer;
            renderer = Physics.renderer('canvas', {
                el: 'viewport'
            });

            world.add(renderer);
            world.on('step', function () {
                world.render();
            });

            // This is the viewport edges for ball bouncing
            edgeBounce = Physics.behavior('edge-collision-detection', {
                aabb: viewportBounds,
                restitution: 0.99,
                cof: 0.8
            });

            // Viewport will always be adjusted to the window size
            window.addEventListener('resize', function () {
                viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
                edgeBounce.setAABB(viewportBounds);

            }, true);

            // Main character

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
            explorer.view.src = 'img/left.png';


            $('body').keydown(function (e) {

                switch (e.keyCode) {

                    case 37:
                        //left
                        explorer.state.vel.set(-0.7, 0);
                        explorer.state.pos.x = explorer.state.pos.x - 7;
                        explorer.view.src = 'img/left.png';
                        break;
                    case 39:
                        //right
                        explorer.state.vel.set(0.7, 0);
                        explorer.state.pos.x = explorer.state.pos.x + 7;
                        explorer.view.src = 'img/right.png';
                        break;

                    case 13:
                        //shoot      
                        explorer.state.vel.set(0, 0);
                        explorer.view.src = 'img/up.png';
                        shoot();
                        break;

                    case 38:
                        explorer.state.vel.set(0, 0);
                        //up with no shooting   
                        explorer.view.src = 'img/up.png';

                }

            });

            world.add(explorer);

            // Amount of balls depend on the stage where we are

            var balls = 0;
            while (balls < stage) {
                // Main ball
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

            // Collision between ball and explorer

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

                    // You are now dead 

                    dead = true;
                    gameplay.pause();
                    scream.play();
                    endsound.play();
                    $("#stage").hide();
                    $("#score").hide();
                    $("#messages").html("GAME OVER");
                    world.remove(explorer);

                    setTimeout(function () {
                        window.location.reload();
                    }, 3000);
                }
            });

            function shoot() {
                // Bullets are created

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

                // Can only shoot if you are alive

                if (dead == false) {
                    world.add(projectile);
                    pistol.play();
                }

                // We remove extra bullets outside the viewport to don't overload

                var clearbullet = setInterval(function () {
                    if (projectile.state.pos.y < window.innerHeight - window.innerHeight + 20) {
                        world.remove(projectile);
                    }

                }, 100)

                // Collision between bullet and ball
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

                        score++;
                        $("#score").html("Score: " + score);
                        // Remove bullet from world
                        world.remove(found.bodyA);
                        pop.play();

                        // Split main ball
                        found.bodyB.geometry.radius = (found.bodyB.geometry.radius / 2);
                        // If ball is too small, we remove it
                        if (found.bodyB.geometry.radius < 10) {
                            world.remove(found.bodyB);

                            // If no balls are left, we level up!
                            if (world.find({
                                label: 'ball'
                            }) == false) {
                                if (haslevelchanged == false) {
                                    level();
                                }
                            }
                        }

                        // Update ball to new size
                        found.bodyB.view = null;
                        found.bodyB.recalc();


                        // Creation of split ball
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


                        // We just want to split balls if size is above 10
                        if (b.geometry.radius > 10) {

                            ball.push(b);
                            world.add(b);

                        }

                    }
                });

            }


            world.add([
                // Some physics behaviors

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


        // Level up function

        function level() {

            haslevelchanged = true;
            stage = stage + 1;

            if (stage > 3) {
                endgame();
            } else {
                console.log("level up!");
                console.log(stage);
                $("#stage").html("Stage: " + stage);
                setTimeout(game, 2000);

            }

        }
    }

    scratch = Physics.scratchpad();
    scratch.done();

    // Endgame (when you finish level 3)

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