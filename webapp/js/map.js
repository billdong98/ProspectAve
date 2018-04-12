/* GLOBAL date->array store */
window.data = {};
window.date = moment(Date.now()).format('MM/DD/YYYY');
var dateDisplay;

let clubs = ["terrace", "tower", "colonial", "cannon", "quadrangle", "ti", "ivy","cottage", "cap", "cloister", "charter"];

$(document).ready(function(){
    dateDisplay = $("#date_display");
    dateDisplay.html("Date: " + window.date);
    download(); // Download THIS week's data
});


//downloads ALL data from the Node server
function download(){
    console.log("Downloading");
    $.ajax({
        url: "http://www.prospectave.io:1738/status",
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
        console.log(overlay);
        
        if(s== "PUID"){
            overlay.removeClass();
            overlay.addClass("puid");
        } else if (s == "List" || s == "Pass"){
            overlay.removeClass();
            overlay.addClass("list");
        }
    }
}

// triggered by selecting a new date on the calendar
function changeDate(d){
    var date = $(d).attr("data-calendar-date");
    var dateString = moment(Date.parse(date)).format('MM/DD/YYYY');;
    console.log(dateString);
    window.date = dateString;
    dateDisplay.html("Date: " + window.date);
    update(window.date);
    
    $('html, body').animate({
        scrollTop: $("#wrapper").offset().top
    }, 700);
}
