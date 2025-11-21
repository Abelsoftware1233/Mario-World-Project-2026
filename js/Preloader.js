
function Preloader() {
  var view = View.getInstance();

  var loadingPercentage;

  var imageSources;
  var soundSources; 

  var that = this;

  this.init = function() {
    loadingPercentage = view.create('div');

    view.addClass(loadingPercentage, 'loading-percentage');
    view.setHTML(loadingPercentage, '0%');
    view.appendToBody(loadingPercentage);

    imageSources = {
      1: 'images/back-btn.png',
      2: 'images/bg.png',
      3: 'images/bowser.png', 
      4: 'images/bullet.png',
      5: 'images/clear-map-btn.png',
      6: 'images/coin.png',
      7: 'images/delete-all-btn.png',
      8: 'images/editor-btn.png',
      9: 'images/elements.png',
      10: 'images/enemies.png',
      11: 'images/flag-pole.png',
      12: 'images/flag.png',
      13: 'images/start-screen.png',
      14: 'images/grid-large-btn.png',
      15: 'images/grid-medium-btn.png',
      16: 'images/grid-small-btn.png',
      17: 'images/grid.png',
      18: 'images/lvl-size.png',
      19: 'images/mario-head.png',
      20: 'images/mario-sprites.png',
      21: 'images/powerups.png',
      22: 'images/save-map-btn.png',
      23: 'images/saved-btn.png',
      24: 'images/slider-left.png',
      25: 'images/slider-right.png',
      26: 'images/start-btn.png',
   };

    that.loadImages(imageSources);
  };

  this.loadImages = function(imageSources) {
    var images = {};
    var loadedImages = 0;
    var totalImages = 0;

    for (var key in imageSources) {
      totalImages++;
    }

    for (var key in imageSources) {
      images[key] = new Image();
      images[key].src = imageSources[key];

      images[key].onload = function() {
        loadedImages++;
        percentage = Math.floor(loadedImages * 100 / totalImages); 

        view.setHTML(loadingPercentage, percentage + '%'); //displaying percentage

        if (loadedImages >= totalImages) {
          view.removeFromBody(loadingPercentage);
          that.initMainApp();
        }
      };
      
      images[key].onerror = function() {
          console.error('Fout bij het laden van afbeelding:', this.src);
      }
    }
  };

  this.initMainApp = function() {
    var marioMakerInstance = MarioMaker.getInstance();
    marioMakerInstance.init();
  };
}

window.onload = function() {
  var preloader = new Preloader();
  preloader.init();
};
