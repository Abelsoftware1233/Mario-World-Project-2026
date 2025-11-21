// Main Class of Mario Game

function MarioGame() {
  var gameUI = GameUI.getInstance();

  var maxWidth; //width of the game world
  var height;
  var viewPort; //width of canvas, viewPort that can be seen
  var tileSize;
  var map;
  var originalMaps;

  var translatedDist; //distance translated(side scrolled) as mario moves to the right
  var centerPos; //center position of the viewPort, viewable screen
  var marioInGround;

  //instances
  var mario;
  var element;
  var gameSound;
  var score;

  var keys = [];
  var goombas;
  var bowser; // Array is gedeclareerd
  var powerUps;
  var bullets;
  var bulletFlag = false;

  var currentLevel;

  var animationID;
  var timeOutId;

  var tickCounter = 0; //for animating mario
  var maxTick = 25; //max number for ticks to show mario sprite
  var instructionTick = 0; //showing instructions counter
  var that = this;

  this.init = function(levelMaps, level) {
    height = 480;
    maxWidth = 0;
    viewPort = 1280;
    tileSize = 32;
    translatedDist = 0;
    goombas = [];
    bowser = []; // Array wordt gereset
    powerUps = [];
    bullets = [];

    gameUI.setWidth(viewPort);
    gameUI.setHeight(height);
    gameUI.show();

    currentLevel = level;
    originalMaps = levelMaps;
    map = JSON.parse(levelMaps[currentLevel]);

    if (!score) {
      //so that when level changes, it uses the same instance
      score = new Score();
      score.init();
    }
    score.displayScore();
    score.updateLevelNum(currentLevel);

    if (!mario) {
      //so that when level changes, it uses the same instance
      mario = new Mario();
      mario.init();
    } else {
      mario.x = 10;
      mario.frame = 0;
    }
    element = new Element();
    gameSound = new GameSound();
    gameSound.init();

    that.calculateMaxWidth();
    that.bindKeyPress();
    that.startGame();
  };

  that.calculateMaxWidth = function() {
    //calculates the max width of the game according to map size
    for (var row = 0; row < map.length; row++) {
      for (var column = 0; column < map[row].length; column++) {
        if (maxWidth < map[row].length * 32) {
          maxWidth = map[column].length * 32;
        }
      }
    }
  };

  that.bindKeyPress = function() {
    var canvas = gameUI.getCanvas(); //for use with touch events

    //key binding
    document.body.addEventListener('keydown', function(e) {
      keys[e.keyCode] = true;
    });

    document.body.addEventListener('keyup', function(e) {
      keys[e.keyCode] = false;
    });

    //key binding for touch events
    canvas.addEventListener('touchstart', function(e) {
      var touches = e.changedTouches;
      e.preventDefault();

      for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX <= 200) {
          keys[37] = true; //left arrow
        }
        if (touches[i].pageX > 200 && touches[i].pageX < 400) {
          keys[39] = true; //right arrow
        }
        if (touches[i].pageX > 640 && touches[i].pageX <= 1080) {
          //in touch events, same area acts as sprint and bullet key
          keys[16] = true; //shift key
          keys[17] = true; //ctrl key
        }
        if (touches[i].pageX > 1080 && touches[i].pageX < 1280) {
          keys[32] = true; //space
        }
      }
    });

    canvas.addEventListener('touchend', function(e) {
      var touches = e.changedTouches;
      e.preventDefault();

      for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX <= 200) {
          keys[37] = false;
        }
        if (touches[i].pageX > 200 && touches[i].pageX <= 640) {
          keys[39] = false;
        }
        if (touches[i].pageX > 640 && touches[i].pageX <= 1080) {
          keys[16] = false;
          keys[17] = false;
        }
        if (touches[i].pageX > 1080 && touches[i].pageX < 1280) {
          keys[32] = false;
        }
      }
    });

    canvas.addEventListener('touchmove', function(e) {
      var touches = e.changedTouches;
      e.preventDefault();

      for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX <= 200) {
          keys[37] = true;
          keys[39] = false;
        }
        if (touches[i].pageX > 200 && touches[i].pageX < 400) {
          keys[39] = true;
          keys[37] = false;
        }
        if (touches[i].pageX > 640 && touches[i].pageX <= 1080) {
          keys[16] = true;
          keys[32] = false;
        }
        if (touches[i].pageX > 1080 && touches[i].pageX < 1280) {
          keys[32] = true;
          keys[16] = false;
          keys[17] = false;
        }
      }
    });
  };

  //Main Game Loop
  this.startGame = function() {
    animationID = window.requestAnimationFrame(that.startGame);

    gameUI.clear(0, 0, maxWidth, height);

    if (instructionTick < 1000) {
      that.showInstructions(); //showing control instructions
      instructionTick++;
    }

    that.renderMap();

    for (var i = 0; i < powerUps.length; i++) {
      powerUps[i].draw();
      powerUps[i].update();
    }

    for (var i = 0; i < bullets.length; i++) {
      bullets[i].draw();
      bullets[i].update();
    }

    for (var i = 0; i < goombas.length; i++) {
      goombas[i].draw();
      goombas[i].update();
    }
    
    // 💥 CORRECTIE 2: Bowser toevoegen aan de update- en tekenlus
    for (var i = 0; i < bowser.length; i++) {
      if (bowser[i]) {
        bowser[i].draw();
        bowser[i].update();
      }
    }

    that.checkPowerUpMarioCollision();
    that.checkBulletEnemyCollision();
    that.checkEnemyMarioCollision();

    mario.draw();
    that.updateMario();
    that.wallCollision();
    marioInGround = mario.grounded; //for use with flag sliding
  };

  this.showInstructions = function() {
    gameUI.writeText('Controls: Arrow keys for direction, shift to run, ctrl for bullets', 30, 30);
    gameUI.writeText('Tip: Jumping while running makes you jump higher', 30, 60);
  };

  this.renderMap = function() {
    //setting false each time the map renders so that elements fall off a platform and not hover around
    mario.grounded = false;

    for (var i = 0; i < powerUps.length; i++) {
      powerUps[i].grounded = false;
    }
    for (var i = 0; i < goombas.length; i++) {
      goombas[i].grounded = false;
    }
    // 💥 Reset grounded state voor Bowser
    for (var i = 0; i < bowser.length; i++) {
      bowser[i].grounded = false;
    }

    for (var row = 0; row < map.length; row++) {
      for (var column = 0; column < map[row].length; column++) {
        switch (map[row][column]) {
          case 1: //platform
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.platform();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 2: //coinBox
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.coinBox();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 3: //powerUp Box
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.powerUpBox();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 4: //uselessBox
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.uselessBox();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 5: //flagPole
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.flagPole();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            break;

          case 6: //flag
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.flag();
            element.draw();
            break;

          case 7: //pipeLeft
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeLeft();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 8: //pipeRight
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeRight();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 9: //pipeTopLeft
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeTopLeft();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 10: //pipeTopRight
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeTopRight();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 20: //goomba
            var enemy = new Enemy();
            enemy.x = column * tileSize;
            enemy.y = row * tileSize;
            enemy.init(); // Gebruik de correcte init functie indien beschikbaar in Enemy.js
            enemy.draw();

            goombas.push(enemy);
            map[row][column] = 0;
            break;
            
          // 💥 CORRECTIE 1: Voeg Bowser toe aan de map rendering
          case 21: //bowser (Type 21 zoals gedefinieerd in Bowser.js)
            var boss = new Bowser();
            boss.x = column * tileSize;
            boss.y = row * tileSize;
            boss.init(); // Roep de init functie aan
            boss.draw();

            bowser.push(boss);
            map[row][column] = 0; // Verwijder de tegel
            break;
        }
      }
    }
  };

  this.collisionCheck = function(objA, objB) {
    // get the vectors to check against
    var vX = objA.x + objA.width / 2 - (objB.x + objB.width / 2);
    var vY = objA.y + objA.height / 2 - (objB.y + objB.height / 2);

    // add the half widths and half heights of the objects
    var hWidths = objA.width / 2 + objB.width / 2;
    var hHeights = objA.height / 2 + objB.height / 2;
    var collisionDirection = null;

    // if the x and y vector are less than the half width or half height, then we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
      // figures out on which side we are colliding (top, bottom, left, or right)
      var offsetX = hWidths - Math.abs(vX);
      var offsetY = hHeights - Math.abs(vY);

      if (offsetX >= offsetY) {
        if (vY > 0 && vY < 37) {
          collisionDirection = 't';
          if (objB.type != 5) {
            //if flagpole then pass through it
            objA.y += offsetY;
          }
        } else if (vY < 0) {
          collisionDirection = 'b';
          if (objB.type != 5) {
            //if flagpole then pass through it
            objA.y -= offsetY;
          }
        }
      } else {
        if (vX > 0) {
          collisionDirection = 'l';
          objA.x += offsetX;
        } else {
          collisionDirection = 'r';
          objA.x -= offsetX;
        }
      }
    }
    return collisionDirection;
  };

  this.checkElementMarioCollision = function(element, row, column) {
    var collisionDirection = that.collisionCheck(mario, element);

    if (collisionDirection == 'l' || collisionDirection == 'r') {
      mario.velX = 0;
      mario.jumping = false;

      if (element.type == 5) {
        //flag pole
        that.levelFinish(collisionDirection);
      }
    } else if (collisionDirection == 'b') {
      if (element.type != 5) {
        //only if not flag pole
        mario.grounded = true;
        mario.jumping = false;
      }
    } else if (collisionDirection == 't') {
      if (element.type != 5) {
        mario.velY *= -1;
      }

      if (element.type == 3) {
        //PowerUp Box
        var powerUp = new PowerUp();

        //gives mushroom if mario is small, otherwise gives flower
        if (mario.type == 'small') {
          powerUp.mushroom(element.x, element.y);
          powerUps.push(powerUp);
        } else {
          powerUp.flower(element.x, element.y);
          powerUps.push(powerUp);
        }

        map[row][column] = 4; //sets to useless box after powerUp appears

        //sound when mushroom appears
        gameSound.play('powerUpAppear');
      }

      if (element.type == 11) {
        //Flower Box
        var powerUp = new PowerUp();
        powerUp.flower(element.x, element.y);
        powerUps.push(powerUp);

        map[row][column] = 4; //sets to useless box after powerUp appears

        //sound when flower appears
        gameSound.play('powerUpAppear');
      }

      if (element.type == 2) {
        //Coin Box
        score.coinScore++;
        score.totalScore += 100;

        score.updateCoinScore();
        score.updateTotalScore();
        map[row][column] = 4; //sets to useless box after coin appears

        //sound when coin block is hit
        gameSound.play('coin');
      }
    }
  };

  this.checkElementPowerUpCollision = function(element) {
    for (var i = 0; i < powerUps.length; i++) {
      var collisionDirection = that.collisionCheck(powerUps[i], element);

      if (collisionDirection == 'l' || collisionDirection == 'r') {
        powerUps[i].velX *= -1; //change direction if collision with any element from the sidr
      } else if (collisionDirection == 'b') {
        powerUps[i].grounded = true;
      }
    }
  };

  this.checkElementEnemyCollision = function(element) {
    // 💥 CORRECTIE 3.1: Controleer op botsingen met Bowser
    for (var i = 0; i < bowser.length; i++) {
      if (bowser[i].state != 'deadFromBullet') {
        var collisionDirection = that.collisionCheck(bowser[i], element);

        if (collisionDirection == 'l' || collisionDirection == 'r') {
          bowser[i].velX *= -1;
        } else if (collisionDirection == 'b') {
          bowser[i].grounded = true;
        }
      }
    }
    
    // Bestaande logica voor Goombas
    for (var i = 0; i < goombas.length; i++) {
      if (goombas[i].state != 'deadFromBullet') {
        //so that goombas fall from the map when dead from bullet
        var collisionDirection = that.collisionCheck(goombas[i], element);

        if (collisionDirection == 'l' || collisionDirection == 'r') {
          goombas[i].velX *= -1;
        } else if (collisionDirection == 'b') {
          goombas[i].grounded = true;
        }
      }
    }
  };

  this.checkElementBulletCollision = function(element) {
    for (var i = 0; i < bullets.length; i++) {
      var collisionDirection = that.collisionCheck(bullets[i], element);

      if (collisionDirection == 'b') {
        //if collision is from bottom of the bullet, it is grounded, so that it can be bounced
        bullets[i].grounded = true;
      } else if (collisionDirection == 't' || collisionDirection == 'l' || collisionDirection == 'r') {
        bullets.splice(i, 1);
      }
    }
  };

  this.checkPowerUpMarioCollision = function() {
    for (var i = 0; i < powerUps.length; i++) {
      var collWithMario = that.collisionCheck(powerUps[i], mario);
      if (collWithMario) {
        if (powerUps[i].type == 30 && mario.type == 'small') {
          //mushroom
          mario.type = 'big';
        } else if (powerUps[i].type == 31) {
          //flower
          mario.type = 'fire';
        }
        powerUps.splice(i, 1);

        score.totalScore += 1000;
        score.updateTotalScore();

        //sound when mushroom appears
        gameSound.play('powerUp');
      }
    }
  };

  this.checkEnemyMarioCollision = function() {
    // 💥 CORRECTIE 3.2: Controleer op botsingen met Bowser (logica gekopieerd van Goomba, pas dit aan voor unieke Bowser-gevechten!)
    for (var i = 0; i < bowser.length; i++) {
      // ⚠️ LET OP: Bowser mag niet sterven door simpelweg op hem te springen! 
      // Je moet hier unieke logica voor Bowser implementeren (bijv. meer hits nodig).
      if (!mario.invulnerable && bowser[i].state != 'dead' && bowser[i].state != 'deadFromBullet') {
        var collWithMario = that.collisionCheck(bowser[i], mario);

        if (collWithMario == 't') {
          // Tijdelijke Goomba-doodslogica, moet worden vervangen door unieke Bowser-logica
          bowser[i].state = 'dead'; 

          mario.velY = -mario.speed;

          score.totalScore += 1000;
          score.updateTotalScore();

          gameSound.play('killEnemy');
        } else if (collWithMario == 'r' || collWithMario == 'l' || collWithMario == 'b') {
          // De rest van de Goomba-logica (Mario raakt gewond/sterft) is hetzelfde
          bowser[i].velX *= -1; // Zodat Bowser omdraait bij contact

          if (mario.type == 'big') {
            // ... (Mario wordt kleiner)
          } else if (mario.type == 'fire') {
            // ... (Mario wordt big)
          } else if (mario.type == 'small') {
            // ... (Mario sterft)
          }
          // De complete Goomba-logica wordt hier gekopieerd om het te laten werken
          // (Zou beter zijn als dit in een aparte functie werd geplaatst)
           if (mario.type == 'big') {
            mario.type = 'small';
            mario.invulnerable = true;
            collWithMario = undefined;

            //sound when mario powerDowns
            gameSound.play('powerDown');

            setTimeout(function() {
              mario.invulnerable = false;
            }, 1000);
          } else if (mario.type == 'fire') {
            mario.type = 'big';
            mario.invulnerable = true;

            collWithMario = undefined;

            //sound when mario powerDowns
            gameSound.play('powerDown');

            setTimeout(function() {
              mario.invulnerable = false;
            }, 1000);
          } else if (mario.type == 'small') {
            //kill mario if collision occurs when he is small
            that.pauseGame();

            mario.frame = 13;
            collWithMario = undefined;

            score.lifeCount--;
            score.updateLifeCount();

            //sound when mario dies
            gameSound.play('marioDie');

            timeOutId = setTimeout(function() {
              if (score.lifeCount == 0) {
                that.gameOver();
              } else {
                that.resetGame();
              }
            }, 3000);
            return; // Stop de lus na Mario's dood
          }
        }
      }
    }


    // Bestaande logica voor 