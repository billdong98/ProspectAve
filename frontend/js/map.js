/* GLOBAL date->array store */
window.data = {};
window.date;

window.filter;
var dateDisplay;
var mapDate;
var weekdays = new Array(7);
weekdays[0] = "Sun";
weekdays[1] = "Mon";
weekdays[2] = "Tue";
weekdays[3] = "Wed";
weekdays[4] = "Thu";
weekdays[5] = "Fri";
weekdays[6] = "Sat";

let clubs = ["terrace", "tower", "colonial", "cannon", "quadrangle", "ti", "ivy","cottage", "cap", "cloister", "charter"];

// initialize code after the DOM has loaded
$(document).ready(function(){
    dateDisplay = $("#date_display");
    window.date = getToday(); // set date to today's date
    mapDate = window.date;
    var tempdate = new Date(window.date);
    dateDisplay.html(window.date + " (" + weekdays[tempdate.getDay()] + ")");
    download(); // Download ALL data

    // initialize the calendar object
    vanillaCalendar.init({
        disablePastDays: false
    });

    var infobar = document.getElementById("infobar");
    var sidebar = document.getElementById("sidebar");

    // Set today as selected
    currentDay = document.getElementById(window.date);
    currentDay.classList.add('vcal-date--selected');

    // set up filter radio button listeners
    $("#radio-all").click(function(){
        window.filter = "all";
        showDatesWithEvents();
    });

    $("#radio-puid").click(function(){
        window.filter = "PUID";
        showPUIDEvents();
    });
    $("#radio-pass").click(function(){
        window.filter = "PassList";
        showPassListEvents();
    });

    document.body.onkeyup = function(e){
        if ($('#intro').visible(true)) {
            if(e.keyCode == 37){
                shiftDate(-1);
            }
            if(e.keyCode == 39){
                shiftDate(1);
            }
        }
    }

    /* Set all as default filter */  
    var $radios = $('input:radio[name=radio-filter]');  
    $radios.filter('[value=All]').prop('checked', true);  


    // prep the info bar
    hideInfo();

    /* set up the listeners for each club image */
    for(var i=0; i<clubs.length;i++){
        !function set(c){
            $("#" + c + "_wrap").mouseover(function() {
                showInfo(c);
            });

            $("#" + c + "_wrap").mouseout(function() {
                hideInfo();
            });
        }(clubs[i]);
    }
    //setInitListener();
});

// Adjust the starting locations of the side/top bar
$(window).resize(function(){
    var info = document.getElementById("infobar");
    hideInfo();
});

// Colors calendar if date has a PUID event
function showPUIDEvents() {
    for (var date in window.data) {
        var currentDay = document.getElementById(date);
        if(currentDay != null){
            currentDay.classList.remove('vcal-date--hasEvent');
            currentDay.classList.remove('vcal-date--pass');

            // Fade past days
            if (date < getToday()) {
                currentDay.classList.add('vcal-date--past');
            }

            var status = window.data[date];
            for(var j=0; j< status.length; j++){
                var row = status[j];
                if (row["status"] == "PUID") {
                    currentDay.classList.add('vcal-date--PUID');
                    break;
                }
            }
        }
    }
}

// Colors calendar if date has a Pass/List event
function showPassListEvents() {
    for (var date in window.data) {
        var currentDay = document.getElementById(date);
        if(currentDay != null){
            currentDay.classList.remove('vcal-date--hasEvent');
            currentDay.classList.remove('vcal-date--PUID');

            // Fade past days
            if (date < getToday()) {
                currentDay.classList.add('vcal-date--past');
            }

            var status = window.data[date];
            for(var j=0; j< status.length; j++){
                var row = status[j];
                if (row["status"] == "Pass" || row["status"] == "List") {
                    currentDay.classList.add('vcal-date--pass');
                    break;
                }
            }
        }
    }
}

// Colors calendar if date has an event 
function showDatesWithEvents() {
    // Handles case when month is changed but filters need to preserved
    if(window.filter == "PUID"){
        showPUIDEvents();
        return;
    } else if(window.filter == "PassList"){
        showPassListEvents();
        return;
    }

    for (var date in window.data) {
        var currentDay = document.getElementById(date);
        if(currentDay != null){
            currentDay.classList.remove('vcal-date--PUID');
            currentDay.classList.remove('vcal-date--pass');
            currentDay.classList.add('vcal-date--hasEvent');
    
            // Fade past days
            if (date < getToday()) {
                currentDay.classList.add('vcal-date--past');
            }
        }
    }
}

//downloads ALL data from the Node server
function download(){
    console.log("Downloading");
    $.ajax({
        url: "https://www.prospectave.io:1738/status",
        type: 'GET',   
        contentType: 'json',    
        success: function(res) {
            downloadSuccess(res);
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    }); 
}


// handles the results from the node server
// Parameter: rows is a JSON object array
function downloadSuccess(rows){
    console.log("Successfully downloaded data");
    console.log(rows);
    // iterate over each JSON object
    for (i = 0; i < rows.length; i++) {
        var row = rows[i];
        var club = row["club_name"];
        var date = row["date"];
        var poster = row["poster"];
        var post_date = row["post_date"];
        var status = row["status"];
        var info = row["info"];

        if(date == "" || club == "" || status == "") continue; 

        if(!(date in window.data)){
            window.data[date] = [];
        }
        window.data[date].push(row);
    }
    showDatesWithEvents();
    // update map on successful download
    update(window.date);
}

/* Uses the mapping in window.data and applies it to each of the clubs on the map */
function update(date){
    var status = window.data[date];

    for(var i=0; i<clubs.length;i++){
        var c = clubs[i];
        $("#" + c + "_overlay").removeClass();
        $("#" + c + "_overlay").addClass(c + " closed");
    }

    if(status == undefined){
        //console.log("No values for: " + date);
        return;
    }

    // iterate over all events for this date
    for(var j=0; j< status.length; j++){
        var row = status[j];
        var club = row["club_name"];
        var date = row["date"]; //should always be the same
        var s = row["status"];
        var info = row["info"];

        var overlay;
        if(club == "Tiger Inn")
            club = "ti";
        overlay = $("#" + club.toLowerCase() + "_overlay");

        if(s === "PUID"){
            overlay.removeClass();
            overlay.addClass(club.toLowerCase() + " puid");
        } else if (s === "Pass"){
            overlay.removeClass();
            overlay.addClass(club.toLowerCase() + " pass");
        } else if(s === "List"){
            overlay.removeClass();
            overlay.addClass(club.toLowerCase() + " list");
        } else {
            console.log("Update error:");
            console.log(row);
        }
    }
}

// triggered by selecting a new date on the calendar
function changeDate(d){
    var date = $(d).attr("data-calendar-date");
    var dateString = moment(Date.parse(date)).format('MM/DD/YYYY');
    window.date = dateString;
    var tempdate = new Date(window.date);
    dateDisplay.html(window.date + " (" + weekdays[tempdate.getDay()] + ")");
    update(window.date);
    mapDate = window.date;

    $('html, body').animate({
        scrollTop: $("#intro").height() - $( window ).height()
    }, 500);
}

// triggered by the two buttons on either side of the date display
function shiftDate(val){
    // change colored date on calendar

    var date_moment = moment(Date.parse(mapDate));
    var mapdate = date_moment.format('MM/DD/YYYY');

    var today = getToday();

    var currentDay = document.getElementById(window.date);
    if (currentDay != null)
        currentDay.classList.remove('vcal-date--selected');

    var next_moment = moment(Date.parse(mapDate)).add(val, 'd');
    var dateString = next_moment.format('MM/DD/YYYY');

    // next to change month data first
    var monthChange = vanillaCalendar.monthDiff();
    var calMonth = moment(Date.parse(vanillaCalendar.returnDate()));

    if(next_moment.month() != calMonth.month()){
        var monthChange = vanillaCalendar.monthDiff();
        if (monthChange == 0)
            monthChange += val;

        vanillaCalendar.changeMonth(monthChange);
    }

    window.date = dateString;
    mapDate = window.date;

    var tempdate = new Date(window.date);
    dateDisplay.html(window.date + " (" + weekdays[tempdate.getDay()] + ")");

    currentDay = document.getElementById(window.date);
    currentDay.classList.add('vcal-date--selected');

    vanillaCalendar.resetMonth();
    update(window.date);
}

// changes the sidebar to display info about this club
function showInfo(club) { 
    var infobar = document.getElementById("infobar");
    var sidebar = document.getElementById("sidebar");

    var out = ''; 

    // data for TODAY
    var rows = window.data[window.date];

    if(typeof rows == "undefined") return;

    for(var i=0; i<rows.length; i++){
        var row = rows[i];
        var name = row["club_name"].toLowerCase();
        infobar.style.color="black";
        // find the event entry 
        if(name === club || (club === "ti" && name === "tiger inn")){
            var status = row["status"];
            var info = row["info"];
            info = info.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            var date = row["date"]; //redundant

            if (status == "List")
                infobar.style.background="#FFEE18";
            else if (status == "PUID")
                infobar.style.background="#62BB77";
            else if (status == "Pass")
                infobar.style.background="#FCAF3D";

            // prep sidebar and infobar for show
            infobar.innerHTML = out;
            var w = window.innerWidth;
            sidebar.style.display="none";
            infobar.style.display="";

            var c = row["club_name"];
            if(c == "Cap") {
                c = "Cap & Gown"
            }
            if(w >= 1100.1){ // SIDE BAR
                infobar.style.top = "0";
                out = '<div class="info_container"><img class="info-logo" src="images/Logos/' + club.toLowerCase() + '.png"/><p id="infobar_name">' + c + "</p></div>";
                out+="<div class='inner' id='infobarinner'> <nav> <ul> <li class='info-date'><span id='info-span'>Date: " + date + "</span></li> <li class='info-status'><span id='info-span'>Status: " + status + "</span></li>"
            } else { // TOP info bar view
                infobar.style.left = "0";
                out = '<img id="clublogo" src="images/Logos/' + club.toLowerCase() + '.png"/>';
                out += "<div class='inner' id='infobarinner'> <nav> <ul> <li class='club_name'>"+ c + "</li> <li class='info-date'><span id='info-span'>Date: " + date + "</span></li> <li class='info-status'><span id='info-span'>Status: " + status + "</span></li>";
            }

            if(info != ""){ //only add Info section if there is info
                out += "<li class='info-moreinfo'> <span id='info-span'>More Info: <span style='font-style:italic'>" + info + "</span></span></li>"
            }

            // add image
            if(row["image"] != undefined && row["image"] != ""){
                var src = "https://prospectave.io/uploads/" + row["image"];
                out += "<li class='side-image-wrap'><img id='flyer-image' src='" + src + "'></li>";
            }

            // close
            out += "</ul> </nav> </div>";

            infobar.innerHTML = out;
            sidebar.style.display="none";
            infobar.style.display="";

            var w = window.innerWidth;
            if(w >= 1100.1){
                infobar.style.top = "0";
            } else {
                infobar.style.left = "0";
            }

            break;
        }
    }
}

// brings back the default sidebar
function hideInfo() {
    var infobar = document.getElementById("infobar");
    var sidebar = document.getElementById("sidebar");

    infobar.innerHTML = "";

    var w = window.innerWidth;
    if(w >= 1100){ // side bar
        infobar.style.left = "0";
        infobar.style.top="100vh";
    } else { // top bar
        infobar.style.top = "0";
        infobar.style.left="-100vw";
    }

    sidebar.style.display="";
    infobar.style.background="#19273F";
    $("#image-hover").remove();
}

// returns today but shifted 4 hours back
function getToday(){
    return moment().subtract(4, "hours").format('MM/DD/YYYY');
}

// setups past calendar clicks
function setupPast(){
    // Add click listeners to all past dates
    this.pastDates = document.querySelectorAll(
      '[data-calendar-status="past"]'
      )
    for (var i = 0; i < this.pastDates.length; i++) {
      this.pastDates[i].addEventListener('click', function (event) {
        var picked = document.querySelectorAll(
          '[data-calendar-label="picked"]'
          )[0]
        console.log("Picked a past date!");
        changeDate(this);
        vanillaCalendar.removeActiveClass()
        this.classList.add('vcal-date--selected')
        vanillaCalendar.monthChange = 0;
    })
  }
}
