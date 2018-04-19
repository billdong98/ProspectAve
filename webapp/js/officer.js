window.data = {};
window.toEditDate = "";
window.club = "null";

var radio_status = 0;
$("input:radio[name=radio-get-in]").click(function() {
    radio_status = $(this).val();
});

var edit_status = 0;
$("input:radio[name=radio-edit-in]").click(function() {
    edit_status = $(this).val();
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

// triggered by selecting a new date on the calendar
function changeDate(d){
    var date = Date.parse($(d).attr("data-calendar-date"));
    updateDisp(date);
}
    
// pass in a date object to change the current date
function updateDisp(date){    
    // format the date in two different ways
    var dateString = moment(date).format('MM/DD/YYYY');
    var formattedDate = moment(date).format("ddd, MMM Do");
    
    $('#edit_info').unbind('click');
    $('#delete_info').unbind('click');
    
    var row = window.data[dateString];
    if(row === undefined){ 
        // if there's no event, display the "no data" text
        $("#event_panel").css('display','none');

        $("#register_panel").animate({'opacity': 0}, 200, function () {  
            $("#register_panel").css('display', 'block');    
            $("#reg_date_info").html(formattedDate);
            $("#date_var").html(dateString);
            // show the button that populates the field with the picked date
            $('#add_button').unbind('click');
            $('#add_button').click(function() {
                populateForm({}, date);
            });
        }).animate({'opacity': 1}, 200);
    } else {

        $("#register_panel").css('display','none');
        var club = row["club_name"];
        window.club = club;
        var date = row["date"];
        var poster = row["poster"];
        var post_date = row["post_date"];
        var status = row["status"];
        var info = row["info"];

        $("#event_panel").animate({'opacity': 0}, 200, function () {  
            $("#club_info").css('display', 'block'); 
            $("#event_panel").css('display', 'block');
            // update each field of the display
            $("#date_info").html(formattedDate);
            $("#status_info").html("Status: " + status);
            $("#description_info").html(info);
            $("#poster_info").html(poster);
            $("#postdate_info").html(post_date);  
        }).animate({'opacity': 1}, 200); 
        
        // set event listeners for these buttons
        $('#edit_info').click(function() {
            loadEditing(dateString, status, info);
        });
        $('#delete_info').click(function() {
            deleteEvent(date, club);
        });
    }
}

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
    $("#club_display").html(club + " Event Form");

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
    if(club != "Tiger Inn") club_name += " Club";
    
    $("#title").html(club_name + " Control Panel");
    $("#hereswhere").html("Welcome, " + name + ". Here's where you can add/edit/delete events.");
    $("#post_form_title").html("Upload " + club + "'s Schedule");

    // add logo to sidebar
    var c = club.toLowerCase();
    if(c == "tiger inn") c = "ti";
    $("#sidebar").prepend('<img id="sidebarlogo" class="fade-up" src="images/Logos/' + c + '.png"/>');
    
    // highlight all the right dates
    showDatesWithEvents();
}

// Colors calendar if date has an event 
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

function clearDatePicker(){
    console.log("Clearing dates");
    $('#schedule_date_picker').multiDatesPicker('resetDates', 'picked');
}

// populate the post form with data
function populateForm(row, date){
    console.log("Populating form");
    console.log(row);
    console.log(date);

    // reset the post form
    document.getElementById("post_form").reset();
    clearDatePicker();

    // add the date onto the calendar
    $('#schedule_date_picker').multiDatesPicker('addDates', [date]);
    
    // add a new event (blank date on calendar)
    if(jQuery.isEmptyObject(row)){
        
    } else { // there is row data
        $("#schedule_message").val(row['info']);
        var status = row['status'].toLowerCase();
        $("#radio-" + status).click();
    }
    
    // open if needed, or scroll
    if ($("#post_form_container").css("display") === "none"){
        // open the form and scroll to it
        toggleForm();
    } else {
        // scroll to it
        $('html, body').animate({
            scrollTop: $('#post_form_container').offset().top - 30
        }, 500);
    }
}

function toggleForm() {
    var x = document.getElementById("post_form_container");
    var button = document.getElementById("show_form");
    if (x.style.display === "none") {
        x.style.display = "block";
        button.text = "Hide";

        $('html, body').animate({
            scrollTop: $('#post_form_container').offset().top - 30
        }, 500);
    }
    else {
        x.style.display = "none";
        button.text = "Create";
    }
}


//TODO: ADD ANIMATIONS
// opens the editing tools with the given status and description
function loadEditing(date, status, description){
    $("#description_info").css('display', 'none');
    $("#status_info").css('display', 'none');
    $("#normal_buttons").css('display', 'none');
    $("#poster_info_li").css('display', 'none');
    $("#post_date_info_li").css('display', 'none');
    
    $("#edit_buttons").css('display', 'block');
    $("#edit_description").css('display', 'block');
    $("#edit_description").val(description);
    $("#edit_status").css('display', 'block');
   
    $("#radio-edit-" + status.toLowerCase()).click();
    edit_status = status;
    
    $('#cancel_edit').unbind('click');
    $('#cancel_edit').click(function() {
        closeEditing();
    });

    $('#submit_edit').unbind('click');
    $('#submit_edit').click(function() {
        var s = edit_status;
        var i = $("#edit_description").val();
        if(s != status || i != description){
            submitEdit(date, s, i);
        } else {
            alert("No information was changed.");
        }
    });
}


// on date change, hide them.
// on cancel, (add cancel button), hide? idkkk!
// TODO: A LOT
function closeEditing(){
    $('#submit_edit').unbind('click');
    $('#cancel_edit').unbind('click');

    $("#description_info").css('display', 'block');
    $("#status_info").css('display', 'block');
    $("#normal_buttons").css('display', 'block');
    $("#poster_info_li").css('display', 'block');
    $("#post_date_info_li").css('display', 'block');

    $("#edit_buttons").css('display', 'none');
    $("#edit_description").css('display', 'none');
    $("#edit_description").val("Enter description here");
    $("#edit_status").css('display', 'none');
    edit_status = 0;
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

// TODO: CHECK if the upload is DIFFERENT from OG


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
function upload(){
    console.log("Uploading");
    var dates = $("#schedule_date_picker").val().split(", ");
    var club = $("#club_selector").val();
    var poster = "Officer page";
    var status = radio_status;
    var info = $("#schedule_message").val();
    if (club == "" || status == 0 || dates == "") {
        alert("Form is incomplete!");
        return false;
    }
    var obj = {"c": club, "d": dates, "s": status, "i": info};
    console.log(obj);

    
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
    
    alert("Form submitted!");   
    return false;
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
