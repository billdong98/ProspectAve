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

$(document).ready(function(){
    dateDisplay = $("#date_display");
    window.date = moment(Date.now()).format('MM/DD/YYYY'); // set date to today's date
    mapDate = window.date;
    displayDate();
    download(); // Download THIS week's data


    vanillaCalendar.init({
        disablePastDays: true
    });

    var infobar_mobile = document.getElementById("infobar_mobile");
    //infobar_mobile.style.display="none";
    hideInfo();

    // Set today as selected 
    currentDay = document.getElementById(window.date); 
    currentDay.classList.add('vcal-date--selected'); 

    /* set up the listeners for each club */
    for(var i=0; i<clubs.length;i++){
        !function set(c){
            $("#" + c + "_overlay").click(function() {
                showInfo(c);
            });   
        }(clubs[i]);
    }

    // set up filter radio button listeners
    $("#radio-all-mobile").click(function(){
        window.filter = "all";
        showDatesWithEvents();
    });

    $("#radio-puid-mobile").click(function(){
        window.filter = "PUID";
        showPUIDEventsMobile();
    });
    $("#radio-pass-mobile").click(function(){
        window.filter = "PassList";
        showPassListEventsMobile();
    });

    /* Set all as default filter */  
    var $radios = $('input:radio[name=radio-filter]');  
    $radios.filter('[value=All]').prop('checked', true);
    
    if (isToday()) {
        $("#arrow-left").css("display", "none");
    }
});

// Colors calendar if date has a PUID event
function showPUIDEventsMobile() {
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
function showPassListEventsMobile() {
    for (var date in window.data) {
        var currentDay = document.getElementById(date);
        if(currentDay != null){
            currentDay.classList.remove('vcal-date--hasEvent');
            currentDay.classList.remove('vcal-date--PUID');
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
    window.date = dateString;
    displayDate();
    update(window.date);
    mapDate = window.date; 

    $('html, body').animate({
        scrollTop: $("#intro").height() - $( window ).height() - 100
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
        return false;
    }

    var currentDay = document.getElementById(window.date);
    if (currentDay != null)
        currentDay.classList.remove('vcal-date--selected');

    var next_moment = moment(Date.parse(mapDate)).add(val, 'd');
    var dateString = next_moment.format('MM/DD/YYYY');

    var monthChange = vanillaCalendar.monthDiff(); 
    var calMonth = moment(Date.parse(vanillaCalendar.returnDate())); 

    // next to change month data first
    if(next_moment.month() != calMonth.month()){
        var monthChange = vanillaCalendar.monthDiff();
        if (monthChange == 0)
            monthChange += val;
    
        vanillaCalendar.changeMonth(monthChange);
    }

    window.date = dateString;
    mapDate = window.date;

    currentDay = document.getElementById(window.date);
    currentDay.classList.add('vcal-date--selected');

    vanillaCalendar.resetMonth();
    update(window.date);
    return true;
}

// display the new date
function displayDate() {
    var tempdate = new Date(window.date);
    dateDisplay.html(window.date + " (" + weekdays[tempdate.getDay()] + ")");
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

            if (status == "List")
                infobar_mobile.style.background="#FFEE18";
            else if (status == "PUID")
                infobar_mobile.style.background="#62BB77";
            else if (status == "Pass")
                infobar_mobile.style.background="#FCAF3D";

            var c = row["club_name"];
            if(c == "Cap") {
                c = "Cap & Gown"
            }
            
            var w = $(window).width();

            infobar_mobile.style.display="";
            infobar_mobile.style.left = "0";
            out = '<img id="clublogo" src="images/Logos/' + club.toLowerCase() + '.png"/>'; 
            out += "<div class='inner'> <nav> <ul> <li class='club_name'>"+ c + "</li> <li class='info'>Date: " + date + "</li> <li class='info'>Status: " + status + "</li>";
            
            if(info != ""){
                out += "<li class='info'>More Info: <span style='font-style:italic'>" + info + "</span></li> </ul> </nav> </div>"
            }
            
            infobar_mobile.innerHTML = out;
            infobar_mobile.style.display="";

            infobar_mobile.style.left = "0";
            break;
        }
    }
}

// brings back the default sidebar
function hideInfo() { 
    var infobar_mobile = document.getElementById("infobar_mobile");

    infobar_mobile.style.top = "0";
    infobar_mobile.style.left="-100vw";

    infobar_mobile.style.background="#19273F";
}