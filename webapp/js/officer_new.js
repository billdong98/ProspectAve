window.data = {};

$(document).ready(function(){
    vanillaCalendar.init({
        disablePastDays: true
    });
    
    downloadSuccess();
});

// triggered by selecting a new date on the calendar
function changeDate(d){
    var date = Date.parse($(d).attr("data-calendar-date"));
    var dateString = moment(date).format('MM/DD/YYYY');
    
    var formattedDate = moment(date).format("ddd, MMM Do")
        
    console.log(dateString);
    
    var row = window.data[dateString];
    
    if(row === undefined){
        console.log("No data");
        $("#reg_date_info").html(formattedDate);
        $("#club_info").css('display', 'none');
        $("#register_panel").css('display', 'block');
        
    } else {
        $("#date_info").html(formattedDate);
        $("#club_info").css('display', 'block');
        $("#register_panel").css('display', 'none');

        
        
        var club = row["club_name"];
        var date = row["date"];
        var poster = row["poster"];
        var post_date = row["post_date"];
        var status = row["status"];
        var info = row["info"];
        
        $("#status_info").html("Status: " + status);
        $("#description_info").html(info);
        $("#poster_info").html(poster);
        $("#postdate_info").html(post_date);
        
        
    }
    
    
}




// handles the results from the node server
// Parameter: rows is a JSON object array
function downloadSuccess(){
    
    // dummy data
    var json = {"identity":{"netID":"mman","club":"Cap"},
                "rows":[{"club_name":"Cap","date":"04/21/2018","poster":"Officer page","post_date":"04-12-2018","status":"Pass","info":"What is life supposed to be. Blah blah blah blah blah blah blah blah blah blahancnpie djiapscabob iaofiajcknojd uebofuahoakcobdu joefieisjc anch"}, {"club_name":"Cap","date":"04/28/2018","poster":"Officer page","post_date":"04-12-2018","status":"PUID","info":""},  {"club_name":"Cap","date":"04/23/2018","poster":"Officer page","post_date":"04-12-2018","status":"List","info":"Hi"}, {"club_name":"Cap","date":"04/25/2018","poster":"Officer page","post_date":"04-12-2018","status":"Pass","info":"Last"}
                       
                       ]};
    
    var rows = json["rows"];
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
            window.data[date] = row;
        }
    }
    
    /*
    var identity = json["identity"];
    if(identity == null){
        alert("You are NOT logged in! Bye!");
        window.location("https://prospectave.io:1738/login");
        return;
    }*/
    
    var name = json["identity"]["netID"];
    var club = json["identity"]["club"];
    
   
    
    $("#title").html(club + " Control Panel — " + name + "");

    $("#form2").html("Upload " + club + "'s Schedule");
    
    // highlight all the right dates
    showDatesWithEvents();
    
}

// Colors calendar if date has an event 
// NEED to do this WHENEVER month changes!!!!!!
function showDatesWithEvents() {
    console.log("Highlighting dates");
    for (var date in window.data) {
        var currentDay = document.getElementById(date);
        if (new Date(date) >= new Date() && currentDay != null){
            
            var status = window.data[date].status;
            if(status === "PUID"){
                currentDay.classList.add('vcal-date--PUID');
            } else if (status === "Pass"){
                currentDay.classList.add('vcal-date--pass');
            } else if(status === "List"){
                currentDay.classList.add('vcal-date--list');
            }
            
        }
    }
}