Function Bowser() {
  var gameUI = GameUI.getInstance();

  var tickCounter = 0; // for animating enemy
  var maxTick = 10; // max number for ticks to show enemy sprite

  var element = new Image();
  element.src = 'images/bowser.png';

  this.x;
  this.y;
  this.velX = 1;
  this.velY = 0;
  this.grounded = false;
  this.type;
  this.state;

  this.sX;
  this.sY = 0;
  
  // 💥 CORRECTIE: De afmetingen zijn aangepast naar de waarden van de CSS (40x34)
  this.width = 40; 
  this.height = 34;

  this.frame = 0;

  var that = this;

  // 💥 CORRECTIE: De 'goomba'-functie is hernoemd naar 'init' en krijgt 
  // een uniek 'type' (21) toegewezen voor Bowser.
  this.init = function() { 
    this.type = 21; // Uniek type voor Bowser
    that.sX = 0;
  };

  this.draw = function() {
    that.sX = that.width * that.frame;
    // Gebruikt de gecorrigeerde afmetingen van 40x34 voor tekenen
    gameUI.draw(element, that.sX, that.sY, that.width, that.height, that.x, that.y, that.width, that.height);
  };

  this.update = function() {
    var gravity = 0.2;

    if (that.grounded) {
      that.velY = 0;
    }

    if (that.state == 'dead') {
      // ⚠️ LET OP: Dit is nog steeds Goomba's doodslogica.
      // Als Bowser een specifieke doodsanimatie heeft (bijv. vlammen of exploderen),
      // moet de logica hier worden aangepast (bijv. andere frame-indices).
      that.frame = 2; // (Dit kan een 'squashed' frame zijn als je het zo wilt)

      tickCounter++;
      if (tickCounter >= 60) {
        that.frame = 4;
      }
    } else if (that.state == 'deadFromBullet') {
      // ⚠️ LET OP: Dit is nog steeds Goomba's vallende logica.
      that.frame = 3; // (Dit kan een 'vallend' frame zijn)
      that.velY += gravity;
      that.y += that.velY;
    } else {
      // Normale loop- en zwaartekrachtlogica
      that.velY += gravity;
      that.x += that.velX;
      that.y += that.velY;

      // for animating (tussen frame 0 en 1)
      tickCounter += 1;

      if (tickCounter > maxTick) {
        tickCounter = 0;
        if (that.frame == 0) {
          that.frame = 1;
        } else {
          that.frame = 0;
        }
      }
    }
  };
}
