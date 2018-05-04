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
    window.date = moment(Date.now()).format('MM/DD/YYYY'); // set date to today's date
    mapDate = window.date;
    var tempdate = new Date(window.date);
    dateDisplay.html(window.date + " (" + weekdays[tempdate.getDay()] + ")");
    download(); // Download THIS week's data

    // initialize the calendar object
    vanillaCalendar.init({
        disablePastDays: true
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

/* Uses the mapping in window.data and applies it to each of the clubs */
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

    var today = moment(Date.now()).format('MM/DD/YYYY');

    /* Don't let users go to past days */
    if (today == mapdate && val == -1) {
        return;
    }

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
    // console.log("New date: " + dateString);
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

    var out = '<img src="images/Logos/' + club.toLowerCase() + '.png" style="left: 10%; top: 10%; height: 20%; width: auto;"/>';  

    // data for TODAY
    var rows = window.data[window.date];

    if(typeof rows == "undefined") return;

    for(var i=0; i<rows.length; i++){
        var row = rows[i];
        var name = row["club_name"].toLowerCase();
        infobar.style.background="#ffd347";
        infobar.style.color="black";
        if(name === club || (club === "ti" && name === "tiger inn")){
            var status = row["status"];
            var info = row["info"];
            var date = row["date"]; //redundant

            // prep sidebar and infobar for show
            infobar.innerHTML = out;
            var w = $(window).width() +15;
            sidebar.style.display="none";
            infobar.style.display="";

            if(w > 1100){
                infobar.style.top = "0";
            } else { // TOP info bar view
                infobar.style.left = "0";
                out = '<img id="clublogo" src="images/Logos/' + club.toLowerCase() + '.png"/>'; 
            }
            
            
            var c = row["club_name"];
            if(c == "Cap") {
                c = "Cap & Gown"
            }
            
            // generate HTML output
             out += "<div class='inner'> <nav> <ul> <li class='club_name'>"+ c + "</li> <li class='info-date'><span id='info-span'>Date: " + date + "</span></li> <li class='info-status'><span id='info-span'>Status: " + status + "</span></li>";
            
            if(info != ""){ //only add Info section if there is info
                    out += "<li class='info-moreinfo'> <span id='info-span'>More Info: <span style='font-style:italic'>" + info + "</span></span></li>"
            }
            out += "</ul> </nav> </div>";
            
            
            
            infobar.innerHTML = out;
            sidebar.style.display="none";
            infobar.style.display="";

            var w = $(window).width() + 15;
            if(w > 1100){
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

    var w = $(window).width() + 15;
    if(w > 1100){
        infobar.style.left = "0";
        infobar.style.top="100vh";
    } else {
        infobar.style.top = "0";
        infobar.style.left="-100vw";
    }

    sidebar.style.display="";
    infobar.style.background="#19273F";
}

