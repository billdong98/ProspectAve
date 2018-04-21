/* GLOBAL date->array store */
window.data = {};
window.date;
var dateDisplay;
var weekdays = new Array(7);
weekdays[0] = "Sun";
weekdays[1] = "Mon";
weekdays[2] = "Tue";
weekdays[3] = "Wed";
weekdays[4] = "Thu";
weekdays[5] = "Fri";
weekdays[6] = "Sat";

let clubs = ["terrace", "tower", "colonial", "cannon", "quadrangle", "ti", "ivy","cottage", "cap", "cloister", "charter"];

// show types of events selected on map
$('#puid_button').click(function() {
    showPUIDEvents();
});
$('#passlist_button').click(function() {
    showPassListEvents();
});
$('#default_button').click(function() {
    showDatesWithEvents();
});

$(document).ready(function(){
    dateDisplay = $("#date_display");
    window.date = moment(Date.now()).format('MM/DD/YYYY'); // set date to today's date
    var tempdate = new Date(window.date);
    dateDisplay.html(window.date + " (" + weekdays[tempdate.getDay()] + ")");
    download(); // Download THIS week's data

    // initialize the calendar object
    vanillaCalendar.init({
        disablePastDays: true
    });

    var infobar = document.getElementById("infobar");
    var sidebar = document.getElementById("sidebar");
    
    // set up filter radio button listeners
    $("#radio-all").click(function(){
        showDatesWithEvents();
    });
    
     $("#radio-puid").click(function(){
        showPUIDEvents();
    });
    $("#radio-pass").click(function(){
        showPassListEvents();
    });
    
    hideInfo();

    /* Set all as default filter */ 
    var $radios = $('input:radio[name=radio-filter]'); 
    $radios.filter('[value=All]').prop('checked', true); 

    /* set up the listeners for each club image */
    for(var i=0; i<clubs.length;i++){
        !function set(c){
            $("#" + c + "_wrap").mouseover(function() {
                console.log(c);
                showInfo(c);
            });


            $("#" + c + "_wrap").mouseout(function() {
                hideInfo();
            });
        }(clubs[i]);
    }
});

// Colors calendar if date has a PUID event
function showPUIDEvents() {
    for (var date in window.data) {
        var currentDay = document.getElementById(date);
        if(currentDay != null){
            currentDay.classList.remove('vcal-date--hasEvent');
            currentDay.classList.remove('vcal-date--pass');
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

// Colors calendar if date has a PUID event
function showPassListEvents() {
    for (var date in window.data) {
        var currentDay = document.getElementById(date);
        if(currentDay != null){
            currentDay.classList.remove('vcal-date--hasEvent');
            currentDay.classList.remove('vcal-date--PUID');
            var status = window.data[date];
            for(var j=0; j< status.length; j++){
                var row = status[j];
                if (row["status"] == "Pass") {
                    currentDay.classList.add('vcal-date--pass');
                    break;
                }
            }
        }
    }
}

// Colors calendar if date has an event 
function showDatesWithEvents() {
    for (var date in window.data) {
        var currentDay = document.getElementById(date);
        if(currentDay != null){
            currentDay.classList.remove('vcal-date--PUID');
            currentDay.classList.remove('vcal-date--pass');
            currentDay.classList.add('vcal-date--hasEvent');
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

/* Uses the mapping in window.data and applies it to each of the clubs */
function update(date){
    var status = window.data[date];

    for(var i=0; i<clubs.length;i++){
        var c = clubs[i];
        $("#" + c + "_overlay").removeClass();
        $("#" + c + "_overlay").addClass(c + " closed");
    }

    if(status == undefined){
        console.log("No values for: " + date);
        return;
    }

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
    console.log(dateString);
    window.date = dateString;
    var tempdate = new Date(window.date);
    dateDisplay.html(window.date + " (" + weekdays[tempdate.getDay()] + ")");
    update(window.date);

    $('html, body').animate({
        scrollTop: $("#intro").height() - $( window ).height()
    }, 500);
}

// triggered by the two buttons on either side of the date display
function shiftDate(val){
    // change colored date on calendar

    var date_moment = moment(Date.parse(window.date));
    var mapdate = date_moment.format('MM/DD/YYYY');

    console.log("Day: " +date_moment.date());

    var today = moment(Date.now()).format('MM/DD/YYYY');

    /* Don't let users go to past days */
    if (today == mapdate && val == -1) {
        return;
    }

    var currentDay = document.getElementById(window.date);
    currentDay.classList.remove('vcal-date--selected');

    var next_moment = moment(Date.parse(window.date)).add(val, 'd');
    var dateString = next_moment.format('MM/DD/YYYY');

    // next to change month data first
    if(next_moment.month() != date_moment.month()){
        if(val == -1){ //move back a month
            $("#cal-prev").click();
        } else { //move forward a month
            $("#cal-next").click();
        }
    }

    window.date = dateString;
    console.log("New date: " + dateString);
    var tempdate = new Date(window.date);
    dateDisplay.html(window.date + " (" + weekdays[tempdate.getDay()] + ")");

    currentDay = document.getElementById(window.date);
    currentDay.classList.add('vcal-date--selected');

    update(window.date);
}

// changes the sidebar to display info about this club
function showInfo(club) { 
    var infobar = document.getElementById("infobar");
    var sidebar = document.getElementById("sidebar");

    var out = '<img src="images/Logos/' + club.toLowerCase() + '.png" style="left: 10%; top: 10%; height: 20%; width: auto;"/>';  

    // data for TODAY
    var rows = window.data[window.date];

    for(var i=0; i<rows.length; i++){
        var row = rows[i];
        var name = row["club_name"].toLowerCase();
        infobar.style.background="#ffd347";
        infobar.style.color="black";
        if(name === club || (club === "ti" && name === "tiger inn")){
            var status = row["status"];
            var info = row["info"];
            var date = row["date"]; //redundant

            out += "<div class='inner'> <nav> <ul> <li class='club_name'>"+ row["club_name"] + "</li> <li class='info'>Date: " + date + "</li> <li class='info'>Status: " + status + "</li> <li class='info'>Information: " + info + "</li> </ul> </nav> </div>";
            infobar.innerHTML = out;
            var w = $(window).width();

            sidebar.style.display="none";
            infobar.style.display="";

            if(w > 1280){
                infobar.style.top = "0";
            } else {
                infobar.style.left = "0";
                out = '<img id="clublogo" src="images/Logos/' + club.toLowerCase() + '.png" style="height: 80%; width: auto;"/>'; 
                out += "<div class='inner'> <nav> <ul> <li class='club_name'>"+ row["club_name"] + "</li> <li class='info'>Date: " + date + "</li> <li class='info'>Status: " + status + "</li> <li class='info'>Information: " + info + "</li> </ul> </nav> </div>";
            }
            infobar.innerHTML = out;
            sidebar.style.display="none";
            infobar.style.display="";

            var w = $(window).width();
            if(w > 1280){
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

    var w = $(window).width();
    if(w > 1280){
        infobar.style.left = "0";
        infobar.style.top="100vh";
    } else {
        infobar.style.top = "0";
        infobar.style.left="-100vw";
    }

    sidebar.style.display="";
    infobar.style.background="#19273F";
}

