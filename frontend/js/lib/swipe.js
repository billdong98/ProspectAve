// TOUCH-EVENTS SINGLE-FINGER SWIPE-SENSING JAVASCRIPT
// Courtesy of PADILICIOUS.COM and MACOSXAUTOMATION.COM

// this script can be used with one or more page elements to perform actions based on them being swiped with a single finger

var triggerElementID = null; // this variable is used to identity the triggering element
var fingerCount = 0;
var startX = 0;
var startY = 0;
var curX = 0;
var curY = 0;
var deltaX = 0;
var deltaY = 0;
var horzDiff = 0;
var vertDiff = 0;
var minLength = 72; // the shortest distance the user may swipe
var swipeLength = 0;
var swipeAngle = null;
var swipeDirection = null;

// The 4 Touch Event Handlers

// NOTE: the touchStart handler should also receive the ID of the triggering element
// make sure its ID is passed in the event call placed in the element declaration, like:
// <div id="picture-frame" ontouchstart="touchStart(event,'picture-frame');"  ontouchend="touchEnd(event);" ontouchmove="touchMove(event);" ontouchcancel="touchCancel(event);">

function touchStart(event,passedName) {
    // disable the standard ability to select the touched object
    event.preventDefault();
    // get the total number of fingers touching the screen
    fingerCount = event.touches.length;
    // since we're looking for a swipe (single finger) and not a gesture (multiple fingers),
    // check that only one finger was used
    if ( fingerCount == 1 ) {
        // get the coordinates of the touch
        startX = event.touches[0].pageX;
        startY = event.touches[0].pageY;
        // store the triggering element ID
        triggerElementID = passedName;
    } else {
        // more than one finger touched so cancel
        touchCancel(event, 1);
    }
}

function touchMove(event) {
    event.preventDefault();
    if ( event.touches.length == 1 ) {
        curX = event.touches[0].pageX;
        curY = event.touches[0].pageY;
        deltaX = curX - startX;
        if (deltaX < 0 && -1 * deltaX < minLength) {
            var infobar_mobile = document.getElementById("infobar_mobile");
            infobar_mobile.style.left= deltaX*0.2 + "vw";   
        }
    } else {
        touchCancel(event, 1);
    }
}

function touchMoveDate(event) {
    event.preventDefault();
    if ( event.touches.length == 1 ) {
        curX = event.touches[0].pageX;
        curY = event.touches[0].pageY;
        deltaX = curX - startX;
        var date_disp = document.getElementById("date_display");
        date_disp.style.marginLeft = deltaX*0.25 + "vw";   
        // DO NOTHING?
    } else {
        touchCancel(event, 1);
    }
}	

function touchEnd(event) {
    event.preventDefault();
    // check to see if more than one finger was used and that there is an ending coordinate
    if ( fingerCount == 1 && curX != 0 ) {
        // use the Distance Formula to determine the length of the swipe
        swipeLength = Math.round(Math.sqrt(Math.pow(curX - startX,2) + Math.pow(curY - startY,2)));
        // if the user swiped more than the minimum length, perform the appropriate action
        if ( swipeLength >= minLength ) {
            caluculateAngle();
            determineSwipeDirection();
            processingRoutine();
            touchCancel(event, 0); // reset the variables
        } else {
            if (triggerElementID=='infobar_mobile') {
                var infobar_mobile = document.getElementById("infobar_mobile");
                infobar_mobile.style.left="0vw"; 
            }
            touchCancel(event, 1);
        }	
    } else {
        touchCancel(event,1 );
    }
}

// event, 1 means that we should reset the position of the date display 
function touchCancel(event, resetPos) {
    // reset the variables back to default values
    fingerCount = 0;
    startX = 0;
    startY = 0;
    curX = 0;
    curY = 0;
    deltaX = 0;
    deltaY = 0;
    horzDiff = 0;
    vertDiff = 0;
    swipeLength = 0;
    swipeAngle = null;
    swipeDirection = null;
    triggerElementID = null;
    var mobile_bar = document.getElementById("mobile_bar");
    mobile_bar.style.backgroundColor = "#9AB7E4";
    var date_disp = document.getElementById("date_display");
    if(resetPos == 1){
        date_disp.style.marginLeft = 0;
    }
}

function caluculateAngle() {
    var X = startX-curX;
    var Y = curY-startY;
    var Z = Math.round(Math.sqrt(Math.pow(X,2)+Math.pow(Y,2))); //the distance - rounded - in pixels
    var r = Math.atan2(Y,X); //angle in radians (Cartesian system)
    swipeAngle = Math.round(r*180/Math.PI); //angle in degrees
    if ( swipeAngle < 0 ) { swipeAngle =  360 - Math.abs(swipeAngle); }
}

function determineSwipeDirection() {
    if ( (swipeAngle <= 45) && (swipeAngle >= 0) ) {
        swipeDirection = 'left';
    } else if ( (swipeAngle <= 360) && (swipeAngle >= 315) ) {
        swipeDirection = 'left';
    } else if ( (swipeAngle >= 135) && (swipeAngle <= 225) ) {
        swipeDirection = 'right';
    } else if ( (swipeAngle > 45) && (swipeAngle < 135) ) {
        swipeDirection = 'down';
    } else {
        swipeDirection = 'up';
    }
}



// swipe left to hide sidebar
function processingRoutine() {
    var swipedElement = document.getElementById(triggerElementID);
    if (swipeDirection == 'left') {
        if (triggerElementID=='infobar_mobile') {
            hideInfo();
        }
        else if (triggerElementID=='mobile_bar') 
            trigger(1);
    } else if (swipeDirection == 'right')
    if (triggerElementID=='mobile_bar') 
        trigger(-1);
}

// triggers a shift in date in the date bar
function trigger(val){
    
    var canShift = shiftDate(val);
    if(val == 1) { // swipe left, go to next day
        var firstPos = window.innerWidth * -1.5;
        var offScreen = "120vw";
    } else if(val == -1){

        var firstPos = window.innerWidth * 1.5;
        var offScreen = "-120vw";
    }

    // 200 miliseconds to complete half the animation
    var halfTime = 200;

    if(val == 1){ // swipe left, move right
        var hide = "#arrow-left";
        var flash = "#arrow-right";
    } else if (val == -1){
        var hide = "#arrow-right";
        var flash = "#arrow-left";   
    }

    $(hide).css("opacity", 0);

    // hiding the arrow
    $(hide).animate({
        opacity: 1
    }, halfTime*2, null);

    // flashing the arrow we are moving in the direction of 
    $(flash).css("borderTopColor", "#fff");
    $(flash).css("borderLeftColor", "#fff");

    // SET back to original color
    $(flash).animate({
        borderTopColor: "rgba(255, 255, 255, 0.55)",
        borderLeftColor: "rgba(255, 255, 255, 0.55)"
    }, halfTime, null);

    // Moving the actual date display
    $( "#date_display" ).animate({
        marginLeft: firstPos
    }, halfTime, function() {
        // Animation complete.   
        $( "#date_display" ).css("margin-left", offScreen);

        displayDate();

        $( "#date_display" ).animate({
            marginLeft: 0
        }, halfTime, function(){
            //MOVE back into center
        });
    });

    $("#arrow-left").css("display", "");
}


function isToday(){
    var date_moment = moment(Date.parse(mapDate));
    var mapdate = date_moment.format('MM/DD/YYYY');
    var today = moment(Date.now()).format('MM/DD/YYYY');

    return (today == mapdate);
}
