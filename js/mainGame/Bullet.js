  this.init = function(x, y, direction) {
    that.velX = 8 * direction; //changing the direction of the bullet if mario faces another side
    that.velY = 0;
    
    // 💥 CORRECTIE: Horizontale startpositie aanpassen op basis van richting
    if (direction > 0) { // Mario kijkt naar rechts
        that.x = x + that.width; // Start rechts van Mario
    } else { // Mario kijkt naar links
        that.x = x - that.width; // Start links van Mario
    }

    that.y = y + 24; // Aangepaste verticale offset (zie punt 1)
    that.type = 30;
    that.sX = 0;
  };
