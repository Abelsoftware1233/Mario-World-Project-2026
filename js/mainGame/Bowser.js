function Bowser() {
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
  
  this.width = 32; 
  this.height = 32;

  this.frame = 0;

  var that = this;

  this.init = function() { 
    this.type = 21; // Uniek type voor Bowser
    that.sX = 0;
  };

  this.draw = function() {
    that.sX = that.width * that.frame;
    gameUI.draw(element, that.sX, that.sY, that.width, that.height, that.x, that.y, that.width, that.height);
  };

  this.update = function() {
    var gravity = 0.2;

    if (that.grounded) {
      that.velY = 0;
    }

    if (that.state == 'dead') {
      that.frame = 2; 

      tickCounter++;
      if (tickCounter >= 60) {
        that.frame = 4;
      }
    } else if (that.state == 'deadFromBullet') {
      that.frame = 3; 
      that.velY += gravity;
      that.y += that.velY;
    } else {
      that.velY += gravity;
      that.x += that.velX;
      that.y += that.velY;

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
