/* GLOBAL date->array store */
window.data = {};
window.date;
var dateDisplay;

let clubs = ["terrace", "tower", "colonial", "cannon", "quadrangle", "ti", "ivy","cottage", "cap", "cloister", "charter"];

$(document).ready(function(){
    dateDisplay = $("#date_display");
    window.date = moment(Date.now()).format('MM/DD/YYYY'); // set date to today's date
    dateDisplay.html("Date: " + window.date);
    download(); // Download THIS week's data


    vanillaCalendar.init({
        disablePastDays: true
    });


    var infobar = document.getElementById("infobar");
    //infobar.style.display="none";
    hideInfo();

    /* set up the listeners for each club */
    for(var i=0; i<clubs.length;i++){
        !function set(c){
            $("#" + c + "_overlay").mouseover(function() {
                console.log(c);
                showInfo(c);
            });

            $("#" + c + "_overlay").mouseout(function() {
                hideInfo();
            });
        }(clubs[i]);
    }
});

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
        if(club == "Tiger Inn"){
            overlay = $("#ti_overlay");
        } else {
            overlay = $("#" + club.toLowerCase() + "_overlay");
        }

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
    dateDisplay.html("Date: " + window.date);
    update(window.date);

    $('html, body').animate({
        scrollTop: $("#intro").height() - $( window ).height()
    }, 500);
}

// triggered by the two buttons on either side of the date display
function shiftDate(val){
    var dateString = moment(Date.parse(window.date)).add(val, 'd').format('MM/DD/YYYY');
    window.date = dateString;
    console.log("New date: " + dateString);
    dateDisplay.html("Date: " + window.date);
    update(window.date);
}

// changes the sidebar to display info about this club
function showInfo(club) { 
    out1 = '<img src="images/Logos/' + club.toLowerCase() + '.png" style="left: 10%; top: 10%; height: 20%; width: auto;"/>'; 

    out2 = out1 + "<div class='inner'> <nav> <ul> <li><a href='#intro'>No events on this date!</a></li> </ul> </nav> </div>";

    var infobar = document.getElementById("infobar");

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

            out2 = out1 + "<div class='inner'> <nav> <ul> <li>Club: " + row["club_name"] + "</li> <li>Date: " + date + "</li> <li>Status: " + status + "</li> <li>Information: " + info + "</li> </ul> </nav> </div>";
            infobar.innerHTML = out2;
            if (club == "colonial" || club == "quadrangle") {
                infobar.style.background="#000080";
                infobar.style.color="white";
            }
            sidebar.style.display="none";
            infobar.style.display="";

            var w = $(window).width();
            if(w > 1280){
                infobar.style.top = "0";
            } else {
                infobar.style.left = "0";
            }
            infobar.innerHTML = out2;
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
