window.heatmap;
var MAX_RADIUS = 40;


function setInitListener(){
  // image is ready, so we can make the heatmap
  $('.map').attr('src', 'images/map.png').load(function() {  
    // run code
      console.log("Initializing heatmap!");
      initHeatMap();
  });

}

    
/* Setup heatmap! */
function initHeatMap(){

    // init
    window.heatmap = h337.create({
        // only container is required, the rest will be defaults
        container: document.querySelector('.containerdiv'),
        radius: 25,
        blur: .8,
        _minOpacity: 0.2,
        _maxOpacity: 0.5
    });
    
    var p1 = {x: 100, y: 50, value: 3};
    var p2 = {x: 150, y: 20, value: 1};
    
    var max = 10;

    // EMPTY DATA
    var data = {
        min: 0,
        max: max,
        data: []
    };
    window.heatmap.setData(data);   
    // if you have a set of datapoints always use setData instead of addData
    // for data initialization
   
    //heatmap.setDataMax(10);
    
   /* for(var i =0; i<10; i++){
       // addPoint("colonial", 1);
    }*/
    //addPoint("ti", 2);
    addPoint("charter", 3);
    addPoint("colonial", 7);
    addPoint("ivy", 10);
    addPoint("ivy", 10);
    addPoint("ivy", 10);
    addPoint("ti", 3);
    addPoint("ti", 4);
    
    //addPoint("colonial", 3);
}
                  
function addPoint(club, val){
    
    var height = $(".containerdiv").innerHeight();
    var width = $(".containerdiv").innerWidth();
    
    var padX = $("#" + club + "_overlay").width() / 2;
    var padY = $("#" + club + "_overlay").height() / 2;
    var x, y;
    switch(club){
        case "terrace":
            x = width * .13;
            y = height * .67;
            break;
        case "tower":
            x = width * .18;
            y = height * .47;
            break;
         case "cannon":
            x = width * .28;
            y = height * .473;
            break;
        case "quadrangle":
            x = width * .39;
            y = height * .47;
            break;
         case "ivy":
            x = width * .48;
            y = height * .49;
            break;
        case "cottage":
            x = width * .57;
            y = height * .49;
            break;
         case "cap":
            x = width * .69;
            y = height * .50;
            break;
        case "cloister":
            x = width * .80;
            y = height * .51;
            break;
        case "colonial":
            x = width * .45;
            y = height * .13;
            break;
        case "ti":
            x = width * .55+3;
            y = height * .13;
            break;
        case "charter":
            x = width * .90;
            y = height * .52;
            break;
    }
    
    x += padX;
    y += padY;
    
    var tempX = Math.round(x);
    var tempY = Math.round(y);
    val = Math.round(val);
    
    var rad = val * 10;
    rad = Math.min(rad, MAX_RADIUS);
    
    var point = {
        x: tempX,
        y: tempY,
        value: val,
        radius: rad //TODO: DYNAMICALLY COMPUTE RADIUS
    }
    //console.log(point);
    
    window.heatmap.addData(point);
}