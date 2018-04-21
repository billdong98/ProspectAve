window.data = {};
window.club = "null";

var radio_status = 0;
$("input:radio[name=radio-get-in]").click(function() {
    radio_status = $(this).val();
});


$(document).ready(function(){
    // initialize calendar
    vanillaCalendar.init({
        disablePastDays: true
    });

    // initialize date picker
    $("#schedule_date_picker").multiDatesPicker({
        maxPicks: 40 // no troll 
        // addDates: [today, tomorrow] PUT IN CURRENT CHOICES
    });
    download();
    
    updateDisp(new Date());
});

// handles the results from the node server
// Parameter: rows is a JSON object array
function downloadSuccess(json){
    console.log(json);
    
    var identity = json["identity"];
    if(identity == null){
        alert("You need to be logged in to access this page.");
        $(location).attr('href', "https://prospectave.io:1738/login");
        return;
    }
    // dummy data
    /*
    var json = {"identity":{"netID":"mman","club":"Cap"},
                "rows":[{"club_name":"Cap","date":"04/21/2018","poster":"Officer page","post_date":"04-12-2018","status":"Pass","info":"What is life supposed to be. Blah blah blah blah blah blah blah blah blah blahancnpie djiapscabob iaofiajcknojd uebofuahoakcobdu joefieisjc anch"}, {"club_name":"Cap","date":"04/28/2018","poster":"Officer page","post_date":"04-12-2018","status":"PUID","info":""},  {"club_name":"Cap","date":"04/23/2018","poster":"Officer page","post_date":"04-12-2018","status":"List","info":"Hi"}, {"club_name":"Cap","date":"04/25/2018","poster":"Officer page","post_date":"04-12-2018","status":"Pass","info":"Last"}

                       ]};*/

    var name = json["identity"]["netID"];
    var club = json["identity"]["club"];
    $("#club_display").html(club + " Mass Upload Form");

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

    var club_name = club;
    if(club == "Cap") club_name = "Cap & Gown";
    if(club != "Tiger Inn" && club != "Cloister") club_name += " Club";
    if(club == "Cloister") club_name += " Inn";
    
    $("#title").html(club_name + " Control Panel");
    $("#hereswhere").html("Welcome, " + name + "! Select a date to add, edit, or delete events for your club!");
    $("#post_form_title").html("Bulk Upload " + club + "'s Schedule");

    // add logo to sidebar
    var c = club.toLowerCase();
    if(c == "tiger inn") c = "ti";
    c += "-w";

    $("#sidebar").prepend('<img id="sidebarlogo" class="fade-up" style="align:center" src="images/Logos/' + c + '.png"/>');

    
    // highlight all the right dates
    showDatesWithEvents();
}

// submits an edited set of data for an existing event  
function submitEdit(date, status, desc){
    console.log("Submitting edit");
    if (date == "" || status == 0) {
        alert("Edit is incomplete!");
        return false;
    }
    var json = {"c": window.club, "d": date, "s": status, "i": desc};
    console.log(json);
 
    $.ajax({
        url: "https://www.prospectave.io:1738/edit",
        type: 'POST',   
        contentType: 'application/json',  
        xhrFields: {
          withCredentials: true //send cookies
        },
        crossDomain: true,
        data: JSON.stringify(json),
        error: function (xhr, status, error) {
            console.log(xhr);
            console.log(error);
            console.log(status);
        },
        success: function(res) {
            console.log("EDIT SUCCESS: " + res);
            location.reload();
        }
    })   
}

// TODO: CHECK if the upload is DIFFERENT from OG !!

//downloads the data for THIS club as json
function download(){
    console.log("Downloading");

    $.ajax({
        url: "https://www.prospectave.io:1738/officer_download/",
        xhrFields: {
          withCredentials: true
       },
        type: 'GET', 
        crossDomain: true,
        contentType: 'json',    
        success: function(res) {
            downloadSuccess(res);
        },
        error: function (xhr, status, error) {
            alert("Couldn't download data!");
            console.log(xhr);
        }
    }); 
}

// uploads new row(s) to the backend
// called by multi-date form
function upload(){
    console.log("Uploading");
    var dates = $("#schedule_date_picker").val().split(", ");
    var poster = "Officer page";
    var status = radio_status;
    var info = $("#schedule_message").val();
    if (club == "" || status == 0 || dates == "") {
        alert("Form is incomplete!");
        return false;
    }
    var obj = {"c": window.club, "d": dates, "s": status, "i": info};
    console.log(obj); 
    postEvents(obj);
   
    alert("Form submitted!");   
    return false;
}

// post an event given the defined JSON format
function postEvents(obj){
     $.ajax({
        url: "https://www.prospectave.io:1738/officer_post",
        type: 'POST',   
        contentType: 'application/json',  
        xhrFields: {
          withCredentials: true //send cookies
        },
        crossDomain: true,
        data: JSON.stringify(obj), //stringify is important
        error: function (xhr, status, error) {
            console.log(xhr);
            console.log(error);
            console.log(status);
        },
        success: function(res) {
            console.log("UPLOAD SUCCESS: " + res);
            location.reload(); //DONT HAVE TO DO THIS. SIMPLE SOLUTION FOR NOW.
        }
    });
}

// delete this row in the database.
function deleteEvent(date, club){
    console.log("Trying to delete : " + date + " , for " + club);
    var res = confirm("Are you sure you want to delete this event?");
    if(!res){
        console.log("User canceled delete");
        return;
    } 
    
    var obj = {"d": date, "c" : club};
    
    $.ajax({
        url: "https://www.prospectave.io:1738/delete",
        type: 'POST',   
        contentType: 'application/json',  
        xhrFields: {
          withCredentials: true //send cookies
        },
        crossDomain: true,
        data: JSON.stringify(obj), //stringify is important
        error: function (xhr, status, error) {
            console.log(xhr);
            console.log(error);
            console.log(status);
            alert("Something went wrong!");
        },
        success: function(res) {
            console.log("Successfully deleted " + res);
            location.reload(); //DONT HAVE TO DO THIS. SIMPLE SOLUTION FOR NOW.
        }
    });   
}
