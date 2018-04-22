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

$(document).ready(function(){
    dateDisplay = $("#date_display");
    window.date = moment(Date.now()).format('MM/DD/YYYY'); // set date to today's date
    var tempdate = new Date(window.date);
    dateDisplay.html(window.date + " (" + weekdays[tempdate.getDay()] + ")");
    download(); // Download THIS week's data

    vanillaCalendar.init({
        disablePastDays: true
    });

    var infobar_mobile = document.getElementById("infobar_mobile");
    //infobar_mobile.style.display="none";
    hideInfo();

    /* set up the listeners for each club */
    for(var i=0; i<clubs.length;i++){
        !function set(c){
            $("#" + c + "_wrap").click(function() {
                console.log(c);
                showInfo(c);
            });

            
            $("#infobar_mobile").click(function() {
                hideInfo();
            });
        }(clubs[i]);
    }
});

// Colors calendar if date has an event 
function showDatesWithEvents() {
    for (var date in window.data) {
        var currentDay = document.getElementById(date);
        if (new Date(date) >= new Date() && currentDay != null){
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
        $("#" + c + "_overlay").addClass("closed");
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
            overlay.addClass("puid");
        } else if (s === "Pass"){
            overlay.removeClass();
            overlay.addClass("pass");
        } else if(s === "List"){
            overlay.removeClass();
            overlay.addClass("list");
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
    var currentDay = document.getElementById(window.date);
    currentDay.classList.remove('vcal-date--selected');

    var today = moment(Date.now()).format('MM/DD/YYYY');
    var mapdate = moment(Date.parse(window.date)).format('MM/DD/YYYY');

    /* Don't let users go to past days */
    if (today == mapdate && val == -1) {
        return;
    }

    var dateString = moment(Date.parse(window.date)).add(val, 'd').format('MM/DD/YYYY');
    window.date = dateString;
    console.log("New date: " + dateString);
    var tempdate = new Date(window.date);
    dateDisplay.html(window.date + " (" + weekdays[tempdate.getDay()] + ")");

    currentDay = document.getElementById(window.date);
    currentDay.classList.add('vcal-date--selected');

    update(window.date);
}

// display info about this club
function showInfo(club) { 
    var infobar_mobile = document.getElementById("infobar_mobile");

    var out = '<img src="images/Logos/' + club.toLowerCase() + '.png" style="left: 10%; top: 10%; height: 20%; width: auto;"/>';  
    
    // data for TODAY
    var rows = window.data[window.date];

    for(var i=0; i<rows.length; i++){
        var row = rows[i];
        var name = row["club_name"].toLowerCase();
        infobar_mobile.style.background="#ffd347";
        infobar_mobile.style.color="black";
        if(name === club || (club === "ti" && name === "tiger inn")){
            var status = row["status"];
            var info = row["info"];
            var date = row["date"]; //redundant

            out += "<div class='inner'> <nav> <ul> <li class='club_name'>"+ row["club_name"] + "</li> <li class='info'>Date: " + date + "</li> <li class='info'>Status: " + status + "</li> <li class='info'>Information: " + info + "</li> </ul> </nav> </div>";
            infobar_mobile.innerHTML = out;
            var w = $(window).width();

            infobar_mobile.style.display="";

            if(w > 1280){
                infobar_mobile.style.top = "0";
            } else {
                infobar_mobile.style.left = "0";
                out = '<img id="clublogo" src="images/Logos/' + club.toLowerCase() + '.png" style="display: block; margin-left: auto; margin-right: auto; width: 25%;"/>'; 
                out += "<div class='inner'> <nav> <ul> <li class='club_name'>"+ row["club_name"] + "</li> <li class='info'>Date: " + date + "</li> <li class='info'>Status: " + status + "</li> <li class='info'>Information: " + info + "</li> </ul> </nav> </div>";
            }
            infobar_mobile.innerHTML = out;
            infobar_mobile.style.display="";

            var w = $(window).width();
            if(w > 1280){
                infobar_mobile.style.top = "0";
            } else {
                infobar_mobile.style.left = "0";
            }
            break;
        }
    }
}

// brings back the default sidebar
function hideInfo() { 
    var infobar_mobile = document.getElementById("infobar_mobile");

    var w = $(window).width();
    if(w > 1280){
        infobar_mobile.style.left = "0";
        infobar_mobile.style.top="100vh";
    } else {
        infobar_mobile.style.top = "0";
        infobar_mobile.style.left="-100vw";
    }

    infobar_mobile.style.background="#19273F";
}